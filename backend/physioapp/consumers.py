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
        self.LOWER_THRESHOLD = 35

        # MediaPipe Pose (create lazily in thread)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose()

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

        await self.send(text_data=json.dumps({
            # "frame": b64_out,
            "reps": self.counter,
            "exercise_id": exercise_id
        }))

    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        ba, bc = a - b, c - b
        denom = np.linalg.norm(ba) * np.linalg.norm(bc)
        if denom == 0:
            return 0.0
        cosang = np.dot(ba, bc) / denom
        ang = np.arccos(np.clip(cosang, -1.0, 1.0))
        return float(np.degrees(ang))
