from channels.generic.websocket import AsyncWebsocketConsumer
import json
import mediapipe as mp
import math

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

        # Constants:
        # For Bicep Curl Exercise
        self.BICEP_CURL_UPPER_THRESHOLD = 140
        self.BICEP_CURL_LOWER_THRESHOLD = 45
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
                "exercise_id": exercise_id
            }))
        except Exception as e:
            import traceback
            print(f"[ERROR] WebSocket receive failed: {e}")
            traceback.print_exc()

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

        # Right arm angle
        r_shoulder = lm[L.RIGHT_SHOULDER]
        r_elbow    = lm[L.RIGHT_ELBOW]
        r_wrist    = lm[L.RIGHT_WRIST]
        r_shoulder_pt = (int(r_shoulder.x * w), int(r_shoulder.y * h))
        r_elbow_pt    = (int(r_elbow.x * w),    int(r_elbow.y * h))
        r_wrist_pt    = (int(r_wrist.x * w),    int(r_wrist.y * h))
        angle = self.calculate_angle(r_shoulder_pt, r_elbow_pt, r_wrist_pt)

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
            return

        # --- Step 2: Check wrist position relative to shoulder ---
        # In normalized coords Y increases downward, so wrist ABOVE shoulder means wrist.y < shoulder.y
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
        else:
            print(f"Target of {self.target_reps} reps reached!")
    
   
    # ------------------ Quadriceps Stretch Detection Logic --------------------
    def detect_quadriceps_stretch(self, lm, h, w):
        """Counts the number of Quadriceps Stretch for either leg."""
        L = self.mp_pose.PoseLandmark

        # Right Leg
        r_hip   = lm[L.RIGHT_HIP]
        r_knee  = lm[L.RIGHT_KNEE]
        r_ankle = lm[L.RIGHT_ANKLE]
        r_hip_pt   = (int(r_hip.x * w),   int(r_hip.y * h))
        r_knee_pt  = (int(r_knee.x * w),  int(r_knee.y * h))
        r_ankle_pt = (int(r_ankle.x * w), int(r_ankle.y * h))
        r_angle = self.calculate_angle(r_hip_pt, r_knee_pt, r_ankle_pt)
        # Bending condition: Knee is bent, foot is lifted (ankle is higher than knee, i.e., smaller y coordinate)
        r_folded = r_angle < self.QUADRICEP_LOWER_THRESHOLD and r_ankle_pt[1] < r_knee_pt[1]

        # Left Leg
        l_hip   = lm[L.LEFT_HIP]
        l_knee  = lm[L.LEFT_KNEE]
        l_ankle = lm[L.LEFT_ANKLE]
        l_hip_pt   = (int(l_hip.x * w),   int(l_hip.y * h))
        l_knee_pt  = (int(l_knee.x * w),  int(l_knee.y * h))
        l_ankle_pt = (int(l_ankle.x * w), int(l_ankle.y * h))
        l_angle = self.calculate_angle(l_hip_pt, l_knee_pt, l_ankle_pt)
        l_folded = l_angle < self.QUADRICEP_LOWER_THRESHOLD and l_ankle_pt[1] < l_knee_pt[1]

        # Select the active leg (the one with the smaller angle / more bent)
        if r_angle < l_angle:
            angle = r_angle
            is_folded_now = r_folded
        else:
            angle = l_angle
            is_folded_now = l_folded

        # Rep logic
        if self.counter < self.target_reps:
            print(f"[DEBUG QUAD] R_Angle: {r_angle:.1f}° | L_Angle: {l_angle:.1f}° | Selected Angle: {angle:.1f}° | ready: {self.ready_to_count} | fold: {self.is_fold}")
            if angle > self.QUADRICEP_UPPER_THRESHOLD and not self.ready_to_count:
                self.ready_to_count = True
                self.is_fold = False
            elif is_folded_now and self.ready_to_count and not self.is_fold:
                self.is_fold = True
            elif angle > self.QUADRICEP_UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
                self.counter += 1
                self.ready_to_count = False
                self.is_fold = False
        else:
            print(f"Target of {self.target_reps} reps reached!")


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
        else:
            print(f"Target of {self.target_reps} reps reached!")
 
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
        else:
            print(f"Target of {self.target_reps} reps reached!")