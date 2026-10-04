from channels.generic.websocket import AsyncWebsocketConsumer
import json
import math
import time
from enum import IntEnum

class PoseLandmark(IntEnum):
    NOSE = 0
    LEFT_EYE_INNER = 1
    LEFT_EYE = 2
    LEFT_EYE_OUTER = 3
    RIGHT_EYE_INNER = 4
    RIGHT_EYE = 5
    RIGHT_EYE_OUTER = 6
    LEFT_EAR = 7
    RIGHT_EAR = 8
    MOUTH_LEFT = 9
    MOUTH_RIGHT = 10
    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14
    LEFT_WRIST = 15
    RIGHT_WRIST = 16
    LEFT_PINKY = 17
    RIGHT_PINKY = 18
    LEFT_INDEX = 19
    RIGHT_INDEX = 20
    LEFT_THUMB = 21
    RIGHT_THUMB = 22
    LEFT_HIP = 23
    RIGHT_HIP = 24
    LEFT_KNEE = 25
    RIGHT_KNEE = 26
    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28
    LEFT_HEEL = 29
    RIGHT_HEEL = 30
    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32

class PoseSolutionsMock:
    PoseLandmark = PoseLandmark

class LandmarkMock:
    def __init__(self, x, y, z, visibility):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility

class ExerciseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.counter = 0
        self.target_reps = 0
        self.ready_to_count = False
        self.is_fold = False
        self.last_rep_time = 0.0
        self.feedback_message = None

        # Constants:
        # For Bicep Curl Exercise
        self.BICEP_CURL_UPPER_THRESHOLD = 140
        self.BICEP_CURL_LOWER_THRESHOLD = 50
        # For Quadriceps Stretch Exercise
        self.QUADRICEP_UPPER_THRESHOLD = 150
        self.QUADRICEP_LOWER_THRESHOLD = 60
        # For Shoulder Exercise
        self.STRAIGHT_SHOULDER_THRESHOLD = 160
        # For Squat Exercise
        self.UPPER_SQUAT_THRESHOLD = 150
        self.SQUAT_KNEE_ANGLE = 100
        self.SQUAT_HIP_ANGLE = 100
        # For Standing Knee Lift

        # Lateral raise overhead — per arm flags
        self.op_arms_raised = False
        self.op_arms_down   = False

        self.mp_pose = PoseSolutionsMock

        self.detectors = {
            1: self.detect_bicep_curl,
            2: self.detect_quadriceps_stretch,
            3: self.detect_shoulder_exercise,                   
            4: self.detect_squat,
            5: self.standing_knee_lift,
        }

        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            landmarks_data = data.get("landmarks")
            
            try:
                exercise_id = int(data.get("exercise_id"))
            except (TypeError, ValueError):
                exercise_id = None
                
            try:
                self.target_reps = int(data.get("target"))
            except (TypeError, ValueError):
                self.target_reps = 0
                
            w = data.get("width", 640)
            h = data.get("height", 360)

            self.feedback_message = None

            if landmarks_data and exercise_id is not None:
                # Map raw coordinate dictionaries to LandmarkMock objects
                lm = [
                    LandmarkMock(
                        item.get("x", 0.0),
                        item.get("y", 0.0),
                        item.get("z", 0.0),
                        item.get("visibility", 1.0)
                    )
                    for item in landmarks_data
                ]
                
                # Dispatch to the correct detector 
                detector = self.detectors.get(exercise_id)
                if detector:
                    try:
                        detector(lm, h, w)
                    except Exception as det_err:
                        import traceback
                        print(f"[ERROR] Detector {exercise_id} failed: {det_err}")
                        traceback.print_exc()

            await self.send(text_data=json.dumps({
                "reps": self.counter,
                "exercise_id": exercise_id,
                "feedback": self.feedback_message
            }))
        except Exception as e:
            import traceback
            print(f"[ERROR] WebSocket receive failed: {e}")
            traceback.print_exc()


    # ------------------- Alignment Checking Logic --------------------
    def is_facing_front(self, lm):
        """Returns True if user is facing the camera, False if sideways."""
        L = self.mp_pose.PoseLandmark
        
        # Get shoulder landmarks (normalized)
        l_shoulder = lm[L.LEFT_SHOULDER]
        r_shoulder = lm[L.RIGHT_SHOULDER]
        
        # Use the Z-axis difference
        # If the user is facing front, both shoulders should have similar Z values.
        # If sideways, one shoulder will be much closer (smaller Z) than the other.
        z_diff = abs(l_shoulder.z - r_shoulder.z)
        
        # Use a ratio based on the distance between shoulders (X) and Z-depth
        # This is robust even if the user moves forward/backward
        return z_diff < 0.15 # Adjust this threshold (0.10 - 0.20) as needed


    # ------------------ Angle Calculation Logic ---------------------
    def calculate_angle(self, a, b, c):
        # a, b, c are (x,y) points
        ab = (a[0]-b[0], a[1]-b[1])
        cb = (c[0]-b[0], c[1]-b[1])
        dot = ab[0]*cb[0] + ab[1]*cb[1]
        mag_ab = math.sqrt(ab[0]**2 + ab[1]**2)
        mag_cb = math.sqrt(cb[0]**2 + cb[1]**2)
        
        if mag_ab == 0 or mag_cb == 0:
            return 0.0
            
        ratio = dot / (mag_ab * mag_cb)
        ratio = max(-1.0, min(1.0, ratio))
        angle = math.degrees(math.acos(ratio))
        return angle


    # -------------- Bicep Curl Detection Logic -------------------
    def detect_bicep_curl(self, lm, h, w):
        """Counts the number of Bicep Curls for either left or right arm."""
        L = self.mp_pose.PoseLandmark

        # ALIGNMENT CHECK: Front view required
        if not self.is_facing_front(lm):
            self.feedback_message = "Please face the camera directly"
            return
        else:
            self.feedback_message = None

        l_shoulder = lm[L.LEFT_SHOULDER]
        l_elbow    = lm[L.LEFT_ELBOW]
        l_wrist    = lm[L.LEFT_WRIST]

        r_shoulder = lm[L.RIGHT_SHOULDER]
        r_elbow    = lm[L.RIGHT_ELBOW]
        r_wrist    = lm[L.RIGHT_WRIST]

        r_vis = min(r_shoulder.visibility, r_elbow.visibility, r_wrist.visibility)
        l_vis = min(l_shoulder.visibility, l_elbow.visibility, l_wrist.visibility)

        # Require reasonable visibility of at least one arm
        if r_vis < 0.35 and l_vis < 0.35:
            return

        r_angle = 180.0
        l_angle = 180.0

        if r_vis >= 0.35:
            r_shoulder_pt = (int(r_shoulder.x * w), int(r_shoulder.y * h))
            r_elbow_pt    = (int(r_elbow.x * w),    int(r_elbow.y * h))
            r_wrist_pt    = (int(r_wrist.x * w),    int(r_wrist.y * h))
            r_angle = self.calculate_angle(r_shoulder_pt, r_elbow_pt, r_wrist_pt)

        if l_vis >= 0.35:
            l_shoulder_pt = (int(l_shoulder.x * w), int(l_shoulder.y * h))
            l_elbow_pt    = (int(l_elbow.x * w),    int(l_elbow.y * h))
            l_wrist_pt    = (int(l_wrist.x * w),    int(l_wrist.y * h))
            l_angle = self.calculate_angle(l_shoulder_pt, l_elbow_pt, l_wrist_pt)

        # Active angle is whichever arm is currently flexing more (smaller angle)
        active_angle = min(r_angle, l_angle)

        current_time = time.time()

        # Rep logic
        if self.counter < self.target_reps:
            # Arm is fully extended downward (> 140 deg)
            if active_angle > self.BICEP_CURL_UPPER_THRESHOLD and not self.ready_to_count:
                self.ready_to_count = True
                self.is_fold = False
            # Arm is fully flexed/curled upward (< 55 deg)
            elif active_angle < self.BICEP_CURL_LOWER_THRESHOLD and self.ready_to_count and not self.is_fold:
                self.is_fold = True
            # Arm returns to extension (> 140 deg) -> Register complete repetition
            elif active_angle > self.BICEP_CURL_UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
                # Minimum 0.75s between reps to eliminate sensor jitter / phantom counts
                if current_time - self.last_rep_time >= 0.75:
                    self.counter += 1
                    self.last_rep_time = current_time
                self.ready_to_count = False
                self.is_fold = False
        else:
            print(f"Target of {self.target_reps} reps reached!")

    #------------------- shoulder exercise  --------------------
    def detect_shoulder_exercise(self, lm, h, w):
        L = self.mp_pose.PoseLandmark

        # ALIGNMENT CHECK: Front view required
        if not self.is_facing_front(lm):
            self.feedback_message = "Please face the camera directly"
            return
        else:
            self.feedback_message = None

        # Raw landmarks
        l_shoulder = lm[L.LEFT_SHOULDER]
        l_elbow    = lm[L.LEFT_ELBOW]
        l_wrist    = lm[L.LEFT_WRIST]

        r_shoulder = lm[L.RIGHT_SHOULDER]
        r_elbow    = lm[L.RIGHT_ELBOW]
        r_wrist    = lm[L.RIGHT_WRIST]

        # Visibility guard
        key_points = (l_shoulder, l_elbow, l_wrist, r_shoulder, r_elbow, r_wrist)
        if any(pt.visibility < 0.4 for pt in key_points):
            return

        l_shoulder_pt = (l_shoulder.x * w, l_shoulder.y * h)
        l_elbow_pt    = (l_elbow.x * w,    l_elbow.y * h)
        l_wrist_pt    = (l_wrist.x * w,    l_wrist.y * h)

        r_shoulder_pt = (r_shoulder.x * w, r_shoulder.y * h)
        r_elbow_pt    = (r_elbow.x * w,    r_elbow.y * h)
        r_wrist_pt    = (r_wrist.x * w,    r_wrist.y * h)

        left_angle  = self.calculate_angle(l_shoulder_pt, l_elbow_pt, l_wrist_pt)
        right_angle = self.calculate_angle(r_shoulder_pt, r_elbow_pt, r_wrist_pt)

        arms_straight = left_angle > self.STRAIGHT_SHOULDER_THRESHOLD and right_angle > self.STRAIGHT_SHOULDER_THRESHOLD

        if not arms_straight:
            # Arms are bent — ignore frame
            return

        both_up = (l_wrist.y < l_shoulder.y and r_wrist.y < r_shoulder.y)
        both_down = (l_wrist.y > l_shoulder.y and r_wrist.y > r_shoulder.y)
        current_time = time.time()

        # 3-phase state machine
        if self.counter < self.target_reps:
            if both_down and not self.op_arms_raised:
                self.op_arms_down = True
            elif both_up and self.op_arms_down:
                self.op_arms_raised = True
                self.op_arms_down = False
            elif both_down and self.op_arms_raised:
                if current_time - self.last_rep_time >= 0.75:
                    self.counter += 1
                    self.last_rep_time = current_time
                self.op_arms_raised = False
                self.op_arms_down = True
    
   
    # ------------------ Quadriceps Stretch Detection Logic --------------------
    def detect_quadriceps_stretch(self, lm, h, w):
        """Counts the number of Quadriceps Stretch for either leg."""
        L = self.mp_pose.PoseLandmark

        # ALIGNMENT CHECK: Side view required
        if self.is_facing_front(lm):
            self.feedback_message = "Please turn sideways to the camera"
            return
        else:
            self.feedback_message = None

        r_hip   = lm[L.RIGHT_HIP]
        r_knee  = lm[L.RIGHT_KNEE]
        r_ankle = lm[L.RIGHT_ANKLE]
        
        if any(pt.visibility < 0.4 for pt in (r_hip, r_knee, r_ankle)):
            return

        r_hip_pt   = (int(r_hip.x * w),   int(r_hip.y * h))
        r_knee_pt  = (int(r_knee.x * w),  int(r_knee.y * h))
        r_ankle_pt = (int(r_ankle.x * w), int(r_ankle.y * h))
        angle = self.calculate_angle(r_hip_pt, r_knee_pt, r_ankle_pt)
        is_folded = angle < self.QUADRICEP_LOWER_THRESHOLD and r_ankle_pt[1] < r_knee_pt[1]
        current_time = time.time()

        # Rep logic
        if self.counter < self.target_reps:
            if angle > self.QUADRICEP_UPPER_THRESHOLD and not self.ready_to_count:
                self.ready_to_count = True
                self.is_fold = False
            elif is_folded and self.ready_to_count and not self.is_fold:
                self.is_fold = True
            elif angle > self.QUADRICEP_UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
                if current_time - self.last_rep_time >= 0.75:
                    self.counter += 1
                    self.last_rep_time = current_time
                self.ready_to_count = False
                self.is_fold = False


    # -------------------------------- SquatsDetection Logic ---------------------------
    def detect_squat(self, lm, h, w):
        """Counts the number of Squats."""
        L = self.mp_pose.PoseLandmark

        # ALIGNMENT CHECK: Side view required
        if self.is_facing_front(lm):
            self.feedback_message = "Please turn sideways to the camera"
            return
        else:
            self.feedback_message = None

        right_hip     = lm[L.RIGHT_HIP]
        right_knee    = lm[L.RIGHT_KNEE]
        right_ankle   = lm[L.RIGHT_ANKLE]
        left_hip      = lm[L.LEFT_HIP]
        l_knee        = lm[L.LEFT_KNEE]
        left_ankle    = lm[L.LEFT_ANKLE]
        shoulder      = lm[L.LEFT_SHOULDER]

        if any(pt.visibility < 0.4 for pt in (right_hip, right_knee, right_ankle, left_hip, l_knee, left_ankle, shoulder)):
            return

        right_hip_x, right_hip_y = int(right_hip.x * w), int(right_hip.y * h)
        rignt_knee_x, right_knee_y = int(right_knee.x * w), int(right_knee.y * h)
        right_ankle_x, right_ankle_y = int(right_ankle.x * w), int(right_ankle.y * h)

        left_hip_x, left_hip_y = int(left_hip.x * w), int(left_hip.y * h)
        left_knee_x, left_knee_y = int(l_knee.x * w), int(l_knee.y * h)
        left_ankle_x, left_ankle_y = int(left_ankle.x * w), int(left_ankle.y * h)
        
        shoulder_x, shoulder_y = int(shoulder.x * w), int(shoulder.y * h)

        r_h_angle = self.calculate_angle((right_hip_x, right_hip_y), (rignt_knee_x, right_knee_y), (right_ankle_x, right_ankle_y))
        r_k_angle = self.calculate_angle((rignt_knee_x, right_knee_y), (right_hip_x, right_hip_y), (shoulder_x, shoulder_y))

        l_h_angle = self.calculate_angle((left_hip_x, left_hip_y), (left_knee_x, left_knee_y), (left_ankle_x, left_ankle_y))
        l_k_angle = self.calculate_angle((left_knee_x, left_knee_y), (left_hip_x, left_hip_y), (shoulder_x, shoulder_y))

        current_time = time.time()

        # Rep logic
        if (r_h_angle > self.UPPER_SQUAT_THRESHOLD and r_k_angle > self.UPPER_SQUAT_THRESHOLD) and (l_h_angle > self.UPPER_SQUAT_THRESHOLD and l_k_angle > self.UPPER_SQUAT_THRESHOLD) and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False

        elif (r_h_angle < self.SQUAT_HIP_ANGLE and r_k_angle < self.SQUAT_KNEE_ANGLE and right_hip_y >= right_knee_y) and (l_h_angle < self.SQUAT_HIP_ANGLE and l_k_angle < self.SQUAT_KNEE_ANGLE and left_hip_y >= left_knee_y) and self.ready_to_count and not self.is_fold:
            self.is_fold = True

        elif (r_h_angle > self.UPPER_SQUAT_THRESHOLD and r_k_angle > self.UPPER_SQUAT_THRESHOLD) and (l_h_angle > self.UPPER_SQUAT_THRESHOLD and l_k_angle > self.UPPER_SQUAT_THRESHOLD) and self.ready_to_count and self.is_fold:
            if current_time - self.last_rep_time >= 0.75:
                self.counter += 1
                self.last_rep_time = current_time
            self.ready_to_count = False
            self.is_fold = False


    # ------------------ Standing Knee Lift Detection Logic --------------------
    def standing_knee_lift(self, lm, h, w):
        L = self.mp_pose.PoseLandmark

        # ALIGNMENT CHECK: Side view required
        if self.is_facing_front(lm):
            self.feedback_message = "Please turn sideways to the camera"
            return
        else:
            self.feedback_message = None

        left_hip    = lm[L.LEFT_HIP]
        left_knee   = lm[L.LEFT_KNEE]
        left_ankle  = lm[L.LEFT_ANKLE]

        right_hip   = lm[L.RIGHT_HIP]
        right_knee  = lm[L.RIGHT_KNEE]
        right_ankle = lm[L.RIGHT_ANKLE]

        key_points = (left_hip, left_knee, left_ankle, right_hip, right_knee, right_ankle)
        if any(pt.visibility < 0.4 for pt in key_points):
            return

        rhx, rhy = int(right_hip.x   * w), int(right_hip.y   * h)
        rkx, rky = int(right_knee.x  * w), int(right_knee.y  * h)
        rax, ray = int(right_ankle.x * w), int(right_ankle.y * h)

        active_angle = self.calculate_angle((rhx, rhy), (rkx, rky), (rax, ray))

        STRAIGHT_THRESHOLD = 150
        LIFT_THRESHOLD = 95
        current_time = time.time()

        if active_angle > STRAIGHT_THRESHOLD and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False

        elif active_angle < LIFT_THRESHOLD and self.ready_to_count and not self.is_fold:
            self.is_fold = True

        elif active_angle > STRAIGHT_THRESHOLD and self.ready_to_count and self.is_fold:
            if current_time - self.last_rep_time >= 0.75:
                self.counter += 1
                self.last_rep_time = current_time
            self.ready_to_count = False
            self.is_fold = False
        else:
            if self.counter >= self.target_reps:
                print(f"Target of {self.target_reps} reps reached!")