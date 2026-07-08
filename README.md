# 🩺 PhysioBuddy

PhysioBuddy is a full-stack physiotherapy platform that connects doctors and patients, letting doctors assign exercise routines and letting patients perform them at home with **real-time, AI-powered pose tracking**. Using MediaPipe pose landmarks streamed over WebSockets, the app automatically counts reps, checks form/alignment, and gives live feedback — no manual logging required.

---

## ✨ Features

- **Doctor & Patient roles** — separate dashboards and profiles for doctors and their patients, linked via a doctor–patient relationship.
- **Exercise assignment** — doctors browse an exercise catalogue and assign routines (with target rep counts) to specific patients.
- **AI-powered rep counting** — the frontend captures webcam video, extracts pose landmarks with MediaPipe, and streams them to a Django Channels WebSocket consumer that scores form and counts reps in real time for exercises like:
  - Bicep curls
  - Quadriceps stretches
  - Shoulder exercises
  - Squats
  - Standing knee lifts
- **Live feedback** — the backend checks alignment (facing the camera, joint angles, thresholds) and returns corrective feedback alongside the live rep count.
- **Compliance tracking** — patient exercise completion status is tracked and can be checked by doctors.
- **In-app messaging** — simple doctor ↔ patient messaging with read/unread status.
- **Profile management** — profile photos (stored as base64), personal/medical details, and doctor specialities/qualifications.

---

## 🏗️ Tech Stack

**Frontend**
- React 19 + Vite
- React Router
- Tailwind CSS

**Backend**
- Django 5 + Django REST-style function views
- Django Channels (ASGI) for WebSockets, served via Daphne/Uvicorn
- MediaPipe + OpenCV for pose landmark processing
- NumPy / SciPy for angle and geometry calculations
- `django-cors-headers` for cross-origin requests from the Vite dev server

**Database**
- Django ORM (SQLite by default via `manage.py`, swappable for any Django-supported DB)

---

## 📁 Project Structure

```
PhysioBuddy/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── seed_data.py                 # Script to seed sample data
│   └── physioapp/
│       ├── models.py                # DoctorProfile, PatientProfile, Exercise, AssignedExercise, Message
│       ├── views.py                 # REST-style API endpoints (auth, profiles, assignments, messages)
│       ├── consumers.py             # WebSocket consumer: real-time pose analysis & rep counting
│       ├── routing.py               # WebSocket URL routing
│       ├── urls.py                  # HTTP API routes
│       ├── settings.py
│       ├── asgi.py / wsgi.py
│       └── migrations/
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── Components/
        │   └── Navbar.jsx
        └── pages/
            ├── Landingpage.jsx
            ├── Login.jsx
            ├── DoctorHome.jsx
            ├── DoctorProfile.jsx
            ├── PatientHome.jsx
            ├── PatientProfile.jsx
            ├── ExerciseList.jsx
            ├── NewAssignmentForm.jsx
            ├── PatientStatusPage.jsx
            ├── Webstream.jsx         # Webcam capture + live pose tracking UI
            └── CustomerCare.jsx
```

---

## 🔗 Prerequisites

- Python **3.10.11**
- Node.js + npm
- Git

---

## ⚙️ Backend Setup (Django)

Navigate to the `backend` folder and create a virtual environment:

```bash
cd backend
py -3.10 -m venv .venv
.\.venv\Scripts\activate      # Windows
# source .venv/bin/activate   # macOS/Linux
```

Check that the correct Python version is active:

```bash
py --version
```

Install backend dependencies (after activating the virtual environment):

```bash
pip install -r requirements.txt
```

Apply migrations and (optionally) seed sample data:

```bash
py manage.py migrate
py manage.py runserver
```

The backend serves both the HTTP API and the WebSocket endpoint used for real-time exercise tracking.

---

## 💻 Frontend Setup (React)

Navigate to the `frontend` folder:

```bash
cd ../frontend
```

Install frontend packages:

```bash
npm install
```

Run the React dev server:

```bash
npm run dev
```

The app expects the backend at `http://127.0.0.1:8000` (see `CORS_ALLOWED_ORIGINS` in `settings.py`) and the frontend dev server at `http://localhost:5173`.

---

## 🔌 API Overview

| Area | Endpoint |
|---|---|
| Auth | `POST /api/login/`, `POST /api/logout/` |
| Doctor | `/api/doctor/get-name/`, `/api/doctor/profile/`, `/api/doctor/home/`, `/api/doctor/update-image/`, `/api/doctor/get-my-patients/`, `/api/submit-assignment/` |
| Patient | `/api/patient/profile/`, `/api/get-exercise-list/`, `/api/patient/update-image/`, `/api/update-completion/`, `/api/check-compliance/` |
| Status | `/api/patient-status/` |
| Messaging | `/api/patient/send-message/`, `/api/patient/messages/`, `/api/doctor/messages/`, `/api/doctor/messages/mark-read/` |
| Real-time tracking | WebSocket consumer (`ExerciseConsumer`) — accepts a stream of pose landmarks + exercise ID, returns live rep counts and feedback |

---

## 🖥️ How Live Tracking Works

1. The patient opens an assigned exercise on the **Webstream** page, which accesses the webcam.
2. Pose landmarks (joint coordinates) are extracted client-side and sent over a WebSocket connection along with the exercise ID and target rep count.
3. The Django Channels consumer (`ExerciseConsumer`) reconstructs the landmarks, computes joint angles, and checks orientation/alignment for the selected exercise.
4. The server increments the rep counter when a valid repetition is detected and returns `{ reps, exercise_id, feedback }` after every frame, which the frontend renders live.

---

## 🚧 Notes

- `CHANNEL_LAYERS` currently uses Django's `InMemoryChannelLayer`, which is fine for local development but should be swapped for a Redis-backed layer before scaling to multiple workers/processes.
- Profile images are stored as base64 strings on the model rather than as files — fine for a prototype, but worth moving to proper file/object storage for production use.

---

## 🤝 Contributing

Issues and pull requests are welcome. If you're adding a new trackable exercise, add a detector method in `consumers.py` and register it in the `self.detectors` dispatch map alongside the existing bicep curl, quadriceps stretch, shoulder, squat, and standing knee lift detectors.
