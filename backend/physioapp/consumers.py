import base64
import cv2
import numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import mediapipe as mp
import asyncio
import math

class ExerciseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.counter = 0
        self.target_reps = 0
        self.ready_to_count = False
        self.is_fold = False

        # Constants:
        # For Bicep Curl Exercise
        self.BICEP_CURL_UPPER_THRESHOLD = 150
        self.BICEP_CURL_LOWER_THRESHOLD = 35
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

        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )

        self.detectors = {
            1: self.detect_bicep_curl,
            2: self.detect_quadriceps_stretch,
            3: self.detect_shoulder_exercise,                   
            4: self.detect_squat,
            5: self.standing_knee_lift,
            }

        await self.accept()

    async def disconnect(self, close_code):
        # Cleanup
        if hasattr(self, "pose"):
            self.pose.close()

    async def receive(self, text_data):
        data = json.loads(text_data)
        b64 = data.get("frame")
        exercise_id = data.get("exercise_id")
        self.target_reps = data.get("target")

        if not b64:
            return

        # Decode base64 JPEG → numpy BGR
        img_bytes = base64.b64decode(b64)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Pose process expects RGB
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = await asyncio.get_event_loop().run_in_executor(None, self.pose.process, rgb)

        if results.pose_landmarks:

            h, w = frame.shape[:2]
            lm = results.pose_landmarks.landmark
            # Dispatch to the correct detector 
            detector = self.detectors.get(exercise_id) 
            if detector: detector(lm, h, w)

        await self.send(text_data=json.dumps({
            # "frame": b64_out,
            "reps": self.counter,
            "exercise_id": exercise_id
        }))

    # ------------------ Angle Calculation Logic ---------------------
    def calculate_angle(self,a, b, c):
        # a, b, c are (x,y) points: shoulder, elbow, wrist
        ab = (a[0]-b[0], a[1]-b[1])
        cb = (c[0]-b[0], c[1]-b[1])
        dot = ab[0]*cb[0] + ab[1]*cb[1]
        mag_ab = math.sqrt(ab[0]**2 + ab[1]**2)
        mag_cb = math.sqrt(cb[0]**2 + cb[1]**2)
        angle = math.degrees(math.acos(dot/(mag_ab*mag_cb)))
        return angle

    # -------------- Bicep Curl Detection Logic -------------------
    def detect_bicep_curl(self, lm, h, w):
        """Counts the number of Bicep Curl."""
        L = self.mp_pose.PoseLandmark

        shoulder = lm[L.RIGHT_SHOULDER]
        elbow    = lm[L.RIGHT_ELBOW]
        wrist    = lm[L.RIGHT_WRIST]

        shoulder_x, shoulder_y = int(shoulder.x * w), int(shoulder.y * h)
        ex, ey = int(elbow.x * w),    int(elbow.y * h)
        wx, wy = int(wrist.x * w),    int(wrist.y * h)

        angle = self.calculate_angle((shoulder_x, shoulder_y), (ex, ey), (wx, wy))

        # Rep logic
        if self.counter < self.target_reps:
            if angle > self.BICEP_CURL_UPPER_THRESHOLD and not self.ready_to_count:
                self.ready_to_count = True
                self.is_fold = False
            elif angle < self.BICEP_CURL_LOWER_THRESHOLD and self.ready_to_count and not self.is_fold:
                self.is_fold = True
            elif angle > self.BICEP_CURL_UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
                self.counter += 1
                self.ready_to_count = False
                self.is_fold = False
        else:
            print(f"Target of {self.target_reps} reps reached!")


    #------------------- shoulder exercise  --------------------
    def detect_shoulder_exercise(self, lm, h, w):
        L = self.mp_pose.PoseLandmark
        # --- Raw normalized landmarks (same as your code) ---
        l_shoulder = lm[L.LEFT_SHOULDER]
        l_elbow    = lm[L.LEFT_ELBOW]
        l_wrist    = lm[L.LEFT_WRIST]

        r_shoulder = lm[L.RIGHT_SHOULDER]
        r_elbow    = lm[L.RIGHT_ELBOW]
        r_wrist    = lm[L.RIGHT_WRIST]

        # --- Visibility guard ---
        key_points = (l_shoulder, l_elbow, l_wrist, r_shoulder, r_elbow, r_wrist)
        if any(pt.visibility < 0.5 for pt in key_points):
            return

        # --- Normalized (x, y) tuples — matches your calculate_angle signature ---
        l_shoulder_pt = (l_shoulder.x*w, l_shoulder.y*h)
        l_elbow_pt    = (l_elbow.x*w,    l_elbow.y*h)
        l_wrist_pt    = (l_wrist.x*w,    l_wrist.y*h)

        r_shoulder_pt = (r_shoulder.x*w, r_shoulder.y*h)
        r_elbow_pt    = (r_elbow.x*w,    r_elbow.y*h)
        r_wrist_pt    = (r_wrist.x*w,    r_wrist.y*h)

        # --- Step 1: Check both arms are straight ---
        left_angle  = self.calculate_angle(l_shoulder_pt, l_elbow_pt, l_wrist_pt)
        right_angle = self.calculate_angle(r_shoulder_pt, r_elbow_pt, r_wrist_pt)

        arms_straight = left_angle > self.STRAIGHT_SHOULDER_THRESHOLD and right_angle > self.STRAIGHT_SHOULDER_THRESHOLD

        if not arms_straight:
            # Arms are bent — ignore frame, do not change state
            print(f"[SKIP] Arms bent — L={left_angle:.1f}° R={right_angle:.1f}°")
            return

        # --- Step 2: Check wrist position relative to shoulder ---
        # In normalized coords Y increases downward,
        # so wrist ABOVE shoulder means wrist.y < shoulder.y
        both_up = (
            l_wrist.y < l_shoulder.y and
            r_wrist.y < r_shoulder.y
        )
        both_down = (
            l_wrist.y > l_shoulder.y and
            r_wrist.y > r_shoulder.y
        )

        print(
            f"[SHOULDER] "
            f"L={left_angle:.1f}° R={right_angle:.1f}° | "
            f"L_wrist_y={l_wrist.y:.2f} L_shoulder_y={l_shoulder.y:.2f} | "
            f"R_wrist_y={r_wrist.y:.2f} R_shoulder_y={r_shoulder.y:.2f} | "
            f"both_up={both_up} both_down={both_down} | "
            f"raised={self.op_arms_raised} down={self.op_arms_down} | "
            f"count={self.counter}"
        )

        # --- 3-phase state machine ---

        # Phase 0 → 1: both arms raised up first time
        if both_down and not self.op_arms_raised:
            self.op_arms_down   = True
            print("[PHASE 1] Both arms down → ready for raise")

        # Phase 1 → 2: both arms lowered after first raise
        elif both_up and self.op_arms_down:
            self.op_arms_raised = True
            self.op_arms_down = False
            print("[PHASE 2] Both arms down")

        # Phase 2 → 3: both arms raised again → COUNT
        elif both_down and self.op_arms_raised:
            self.counter       += 1
            self.op_arms_raised = False
            self.op_arms_down   = True
            print(f"[COUNTED] Rep = {self.counter}")
    
   
    # ------------------ Quadriceps Stretch Detection Logic --------------------
    def detect_quadriceps_stretch(self, lm, h, w):
        """Counts the number of Quadriceps Stretch."""
        L = self.mp_pose.PoseLandmark

        # Right leg landmarks (you can mirror for left leg if needed)
        hip   = lm[L.RIGHT_HIP]
        knee  = lm[L.RIGHT_KNEE]
        ankle = lm[L.RIGHT_ANKLE]

        # Convert normalized coords → pixel coords
        hx, hy = int(hip.x * w), int(hip.y * h)
        kx, ky = int(knee.x * w), int(knee.y * h)
        ax, ay = int(ankle.x * w), int(ankle.y * h)

        # Knee angle (hip–knee–ankle)
        angle = self.calculate_angle((hx, hy), (kx, ky), (ax, ay))

        # Detection conditions:
        # 1. Knee is folded (angle < threshold)
        # 2. Foot is lifted upward (ankle above knee → ay < ky)
        # 3. Foot is behind hip (ankle.x < hip.x for right leg, opposite for left)
        if angle > self.QUADRICEP_UPPER_THRESHOLD and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False

        elif angle < self.QUADRICEP_LOWER_THRESHOLD and ay < ky and ax < hx and self.ready_to_count and not self.is_fold:
            self.is_fold = True
        
        elif angle > self.QUADRICEP_UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False


    # -------------------------------- SquatsDetection Logic ---------------------------
    def detect_squat(self, lm, h, w):
        """Counts the number of Squats."""
        L = self.mp_pose.PoseLandmark

        # Landmarks for right side (mirror for left if needed)
        right_hip     = lm[L.RIGHT_HIP]
        right_knee    = lm[L.RIGHT_KNEE]
        right_ankle   = lm[L.RIGHT_ANKLE]
        left_hip     = lm[L.RIGHT_HIP]
        l_knee    = lm[L.LEFT_KNEE]
        left_ankle   = lm[L.LEFT_ANKLE]
        shoulder= lm[L.LEFT_SHOULDER]

        # Right side coordinates
        # Convert normalized coords → pixel coords
        right_hip_x, right_hip_y = int(right_hip.x * w), int(right_hip.y * h)
        rignt_knee_x, right_knee_y = int(right_knee.x * w), int(right_knee.y * h)
        right_ankle_x, right_ankle_y = int(right_ankle.x * w), int(right_ankle.y * h)

        # Left side coordinates
        left_hip_x, left_hip_y = int(left_hip.x * w), int(left_hip.y * h)
        left_knee_x, left_knee_y = int(l_knee.x * w), int(l_knee.y * h)
        left_ankle_x, left_ankle_y = int(left_ankle.x * w), int(left_ankle.y * h)
        
        # Shoulder Coordinates
        shoulder_x, shoulder_y = int(shoulder.x * w), int(shoulder.y * h)

        # Right Joint Angles
        r_h_angle = self.calculate_angle((right_hip_x, right_hip_y), (rignt_knee_x, right_knee_y), (right_ankle_x, right_ankle_y))   # Right hip–knee–ankle
        r_k_angle = self.calculate_angle((rignt_knee_x, right_knee_y), (right_hip_x, right_hip_y), (shoulder_x, shoulder_y))   # Right knee–hip–shoulder

        # Left Joint Angles
        l_h_angle = self.calculate_angle((left_hip_x, left_hip_y), (left_knee_x, left_knee_y), (left_ankle_x, left_ankle_y))   # Left hip–knee–ankle
        l_k_angle = self.calculate_angle((left_knee_x, left_knee_y), (left_hip_x, left_hip_y), (shoulder_x, shoulder_y))   # Left knee–hip–shoulder

        # Torso angle (shoulder–hip–ankle)
        r_torso_angle = self.calculate_angle((shoulder_x, shoulder_y), (right_hip_x, right_hip_y), (right_ankle_x, right_ankle_y))
        l_torso_angle = self.calculate_angle((shoulder_x, shoulder_y), (left_hip_x, left_hip_y), (left_ankle_x, left_ankle_y))

        # Rep logic
        if (r_h_angle > self.UPPER_SQUAT_THRESHOLD and r_k_angle > self.UPPER_SQUAT_THRESHOLD) and (l_h_angle > self.UPPER_SQUAT_THRESHOLD and l_k_angle > self.UPPER_SQUAT_THRESHOLD) and not self.ready_to_count:
            # Standing straight (reset position)
            self.ready_to_count = True
            self.is_fold = False

        elif (r_h_angle < self.SQUAT_HIP_ANGLE and r_k_angle < self.SQUAT_KNEE_ANGLE and right_hip_y >= right_knee_y) and (l_h_angle < self.SQUAT_HIP_ANGLE and l_k_angle < self.SQUAT_KNEE_ANGLE and left_hip_y >= left_knee_y) and self.ready_to_count and not self.is_fold:
            # Squat down detected (hip lower than knee, angles small)
            self.is_fold = True

        elif (r_h_angle > self.UPPER_SQUAT_THRESHOLD and r_k_angle > self.UPPER_SQUAT_THRESHOLD) and (l_h_angle > self.UPPER_SQUAT_THRESHOLD and l_k_angle > self.UPPER_SQUAT_THRESHOLD) and self.ready_to_count and self.is_fold:
            # Back to standing → count one squat
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False
 
    # ------------------ Standing Knee Lift Detection Logic --------------------
    def standing_knee_lift(self, lm, h, w):
        L = self.mp_pose.PoseLandmark

        left_hip    = lm[L.LEFT_HIP]
        left_knee   = lm[L.LEFT_KNEE]
        left_ankle  = lm[L.LEFT_ANKLE]

        right_hip   = lm[L.RIGHT_HIP]
        right_knee  = lm[L.RIGHT_KNEE]
        right_ankle = lm[L.RIGHT_ANKLE]

        key_points = (left_hip, left_knee, left_ankle,
                      right_hip, right_knee, right_ankle)
        if any(pt.visibility < 0.5 for pt in key_points):
            return

        # ── Pixel coordinates ────────────────────────────────────────────────
        lhx, lhy = int(left_hip.x   * w), int(left_hip.y   * h)
        lkx, lky = int(left_knee.x  * w), int(left_knee.y  * h)
        lax, lay = int(left_ankle.x * w), int(left_ankle.y * h)

        rhx, rhy = int(right_hip.x   * w), int(right_hip.y   * h)
        rkx, rky = int(right_knee.x  * w), int(right_knee.y  * h)
        rax, ray = int(right_ankle.x * w), int(right_ankle.y * h)

        # ── Knee angles (hip – knee – ankle) ─────────────────────────────────
        left_angle  = self.calculate_angle((lhx, lhy), (lkx, lky), (lax, lay))
        right_angle = self.calculate_angle((rhx, rhy), (rkx, rky), (rax, ray))

        # ── Thresholds ───────────────────────────────────────────────────────
        # Leg is "straight / down" when knee angle is large (> 150 °)
        STRAIGHT_THRESHOLD = 150
        # Knee is "lifted to 90 °" when angle drops below 95 °
        LIFT_THRESHOLD = 95

        # Use whichever leg is actively lifting (smaller angle = more bent)
        active_angle = min(left_angle, right_angle)

        # ── Rep state machine (mirrors bicep curl / quadriceps logic) ────────
        # Phase 0 → 1 : both legs straight → ready to count
        if active_angle > STRAIGHT_THRESHOLD and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False

        # Phase 1 → 2 : active knee reaches (or passes) 90 °
        elif active_angle < LIFT_THRESHOLD and self.ready_to_count and not self.is_fold:
            self.is_fold = True

        # Phase 2 → 0 : leg returns to straight → count rep
        elif active_angle > STRAIGHT_THRESHOLD and self.ready_to_count and self.is_fold:
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False