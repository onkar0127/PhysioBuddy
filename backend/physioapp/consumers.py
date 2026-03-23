import base64
import cv2
import numpy as np
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import mediapipe as mp
import asyncio

class ExerciseConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Init per-connection state
        self.counter = 0
        self.ready_to_count = False
        self.is_fold = False
        self.UPPER_THRESHOLD = 150
        self.LOWER_THRESHOLD = 60  # 35 for bicep curl

        # MediaPipe Pose (create lazily in thread)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()

        # Dispatch table for exercises 
        self.detectors = {
            1: self.detect_bicep_curl, 
            2: self.detect_quadriceps_stretch,
            3: self.detect_squat,
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
    def calculate_angle(self, a, b, c):
        """Calculates the angle between given coordinates."""
        a, b, c = np.array(a), np.array(b), np.array(c)
        ba, bc = a - b, c - b
        denom = np.linalg.norm(ba) * np.linalg.norm(bc)
        if denom == 0:
            return 0.0
        cosang = np.dot(ba, bc) / denom
        ang = np.arccos(np.clip(cosang, -1.0, 1.0))
        return float(np.degrees(ang))
    

    # -------------- Bicep Curl Detection Logic -------------------
    def detect_bicep_curl(self, lm, h, w):
        """Counts the number of Bicep Curl."""
        L = self.mp_pose.PoseLandmark

        shoulder = lm[L.RIGHT_SHOULDER]
        elbow    = lm[L.RIGHT_ELBOW]
        wrist    = lm[L.RIGHT_WRIST]

        sx, sy = int(shoulder.x * w), int(shoulder.y * h)
        ex, ey = int(elbow.x * w),    int(elbow.y * h)
        wx, wy = int(wrist.x * w),    int(wrist.y * h)

        angle = self.calculate_angle((sx, sy), (ex, ey), (wx, wy))

        # Rep logic
        if angle > self.UPPER_THRESHOLD and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False
        elif angle < self.LOWER_THRESHOLD and self.ready_to_count and not self.is_fold:
            self.is_fold = True
        elif angle > self.UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False


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
        if angle > self.UPPER_THRESHOLD and not self.ready_to_count:
            self.ready_to_count = True
            self.is_fold = False

        elif angle < 60 and ay < ky and ax < hx and self.ready_to_count and not self.is_fold:
            self.is_fold = True
        
        elif angle > self.UPPER_THRESHOLD and self.ready_to_count and self.is_fold:
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False


    # -------------------------------- SquatsDetection Logic ---------------------------
    def detect_squat(self, lm, h, w):
        """Counts the number of Squats."""
        L = self.mp_pose.PoseLandmark

        # Landmarks for right side (mirror for left if needed)
        r_hip     = lm[L.RIGHT_HIP]
        r_knee    = lm[L.RIGHT_KNEE]
        r_ankle   = lm[L.RIGHT_ANKLE]
        l_hip     = lm[L.RIGHT_HIP]
        l_knee    = lm[L.LEFT_KNEE]
        l_ankle   = lm[L.LEFT_ANKLE]
        shoulder= lm[L.LEFT_SHOULDER]

        # Right side coordinates
        # Convert normalized coords → pixel coords
        r_hx, r_hy = int(r_hip.x * w), int(r_hip.y * h)
        r_kx, r_ky = int(r_knee.x * w), int(r_knee.y * h)
        r_ax, r_ay = int(r_ankle.x * w), int(r_ankle.y * h)

        # Left side coordinates
        l_hx, l_hy = int(l_hip.x * w), int(l_hip.y * h)
        l_kx, l_ky = int(l_knee.x * w), int(l_knee.y * h)
        l_ax, l_ay = int(l_ankle.x * w), int(l_ankle.y * h)
        
        # Shoulder Coordinates
        sx, sy = int(shoulder.x * w), int(shoulder.y * h)

        # Right Joint Angles
        r_h_angle = self.calculate_angle((r_hx, r_hy), (r_kx, r_ky), (r_ax, r_ay))   # Right hip–knee–ankle
        r_k_angle = self.calculate_angle((r_kx, r_ky), (r_hx, r_hy), (sx, sy))   # Right knee–hip–shoulder

        # Left Joint Angles
        l_h_angle = self.calculate_angle((l_hx, l_hy), (l_kx, l_ky), (l_ax, l_ay))   # Left hip–knee–ankle
        l_k_angle = self.calculate_angle((l_kx, l_ky), (l_hx, l_hy), (sx, sy))   # Left knee–hip–shoulder

        # Torso angle (shoulder–hip–ankle)
        r_torso_angle = self.calculate_angle((sx, sy), (r_hx, r_hy), (r_ax, r_ay))
        l_torso_angle = self.calculate_angle((sx, sy), (l_hx, l_hy), (l_ax, l_ay))

        # Rep logic
        if (r_h_angle > 150 and r_k_angle > 150) and (l_h_angle > 150 and l_k_angle > 150) and not self.ready_to_count:
            # Standing straight (reset position)
            self.ready_to_count = True
            self.is_fold = False

        elif (r_h_angle < 80 and r_k_angle < 100 and r_hy > r_ky) and (l_h_angle < 80 and l_k_angle < 100 and l_hy > l_ky) and self.ready_to_count and not self.is_fold and (r_torso_angle>120 or l_torso_angle>120):
            # Squat down detected (hip lower than knee, angles small)
            self.is_fold = True

        elif (r_h_angle > 150 and r_k_angle > 150) and (l_h_angle > 150 and l_k_angle > 150) and self.ready_to_count and self.is_fold:
            # Back to standing → count one squat
            self.counter += 1
            self.ready_to_count = False
            self.is_fold = False

