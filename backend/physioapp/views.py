from django.http import StreamingHttpResponse
from django.shortcuts import render, redirect
import time
import cv2
import mediapipe as mp

from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import PatientProfile, DoctorProfile


def test_api(request):
    data = {
        "status": "success",
        "message": "Hello from Django!",
        "developer": "Sailesh"
    }
    return JsonResponse(data)


"""
# 📷 Webcam
webcam = cv2.VideoCapture(0)
if not webcam.isOpened():
    print("Error: Webcam not accessible.")
    exit()

# 🔢 Rep logic variables
counter = 0
ready_to_count = False
is_fold = False
UPPER_THRESHOLD = 160
LOWER_THRESHOLD = 35

cv2.namedWindow('Pose Detection', cv2.WINDOW_NORMAL)

# 🧍‍♂️ Main loop
with mp_pose.Pose() as pose:
    while True:
        ret, frame = webcam.read()
        if not ret:
            print("Error: Couldn't read frame.")
            break

        frame = cv2.resize(frame, (screen_width, screen_height))
        frame = cv2.flip(frame, 1)

        image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        image_bgr = cv2.cvtColor(image_rgb, cv2.COLOR_RGB2BGR)

        if results.pose_landmarks:
            mp_drawing.draw_landmarks(image_bgr, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # 🎯 Visual right side → use LEFT landmarks
            shoulder = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            elbow = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            wrist = results.pose_landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST]

            sx, sy = int(shoulder.x * screen_width), int(shoulder.y * screen_height)
            ex, ey = int(elbow.x * screen_width), int(elbow.y * screen_height)
            wx, wy = int(wrist.x * screen_width), int(wrist.y * screen_height)

            elbow_angle = calculate_angle((sx, sy), (ex, ey), (wx, wy))

            # 🎨 Annotate elbow
            cv2.circle(image_bgr, (ex, ey), 8, (0, 0, 255), -1)
            cv2.putText(image_bgr, 'Right Elbow', (ex + 10, ey - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 0), 2)
            cv2.putText(image_bgr, f'Angle: {int(elbow_angle)}°', (ex + 10, ey + 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

            # 🔁 Controlled repetition counting
            if elbow_angle > UPPER_THRESHOLD and not ready_to_count:
                ready_to_count = True
                is_fold = False
            elif elbow_angle < LOWER_THRESHOLD and ready_to_count and not is_fold:
                is_fold = True
            elif elbow_angle > UPPER_THRESHOLD and ready_to_count and is_fold:
                counter += 1
                ready_to_count = False
                is_fold = False

            # 📊 Show rep count
            cv2.putText(image_bgr, f'Reps: {counter}', (50, 100),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.2, (0, 255, 0), 3)

        cv2.imshow('Pose Detection', image_bgr)

        if cv2.waitKey(10) & 0xFF == 27:
            break

"""


def generate_frames():
    webcam = cv2.VideoCapture(0)

    # 🔢 Rep logic variables
    counter = 0
    ready_to_count = False
    is_fold = False
    UPPER_THRESHOLD = 160
    LOWER_THRESHOLD = 35

    while True:
        success, frame = webcam.read()
        if not success:
            break

        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()

        # time.sleep(0.1)  # ~10 frames per second (50ms delay)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')


def video_feed(request):
    return StreamingHttpResponse(generate_frames(), content_type='multipart/x-mixed-replace; boundary=frame')


def webcam_page(request):
    return render(request, 'webcam.html')

def login_view(request):

    error = ""
    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate the user.
        user = authenticate(request, username=username, password=password)


        if user is not None:
            # Step 4: Login the user
            login(request, user)

            # Step 5: Redirect based on user type (doctor vs. patient)
            if user.is_staff:
                # User is a doctor
                return redirect('/api/doctor/profile/') # Make sure this URL exists
            else:
                # User is a patient
                return redirect('/api/patient/profile/') # Make sure this URL exists
        else:
            error = "Invalid"

    # Render the login page for GET requests or on login failure
    return render(request, 'physioapp/login.html', {"error": error})

@login_required
def doctor_profile(request):
    """
    Displays the doctor's dashboard.
    """
    # Get the doctor's profile using the reverse relationship
    doctor_profile = request.user.doctorprofile
    
    # Create the context dictionary
    context = {
        'doctor': doctor_profile,
    }
    return render(request, 'physioapp/doctorprofile.html', context)


@login_required
def patient_profile(request):
    """
    Displays the patient's dashboard.
    """
    # Get the patient's profile using the reverse relationship
    patient_profile = request.user.patientprofile
    
    # Create the context dictionary
    context = {
        'patient': patient_profile,
    }
    return render(request, 'physioapp/patientprofile.html', context)

@login_required
def patient_profile_api(request):
    
    patient = get_object_or_404(PatientProfile, user=request.user)
    
    data = {'patient name': patient.user.username, 
            'phone number': patient.phone_number, 
            'email': patient.user.email, 
            'dob': patient.date_of_birth, 
            'gender': patient.gender,
            'assigned doctor': patient.doctor.id
            }

    return JsonResponse(data)

@login_required
def doctor_profile_api(request):
    
    doctor = get_object_or_404(DoctorProfile, user=request.user)
    
    data = {'doctor name': doctor.user.username,
            }

    return JsonResponse(data)