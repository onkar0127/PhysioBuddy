from django.http import StreamingHttpResponse
from django.shortcuts import render, redirect
import subprocess
import os, sys

import json
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import PatientProfile, DoctorProfile


def tk(request):
    return render(request, 'exercise.html')

def start_exercise(request):
    exercise_id = request.GET.get('exercise_id', '1')  # default to 1
    script_path = os.path.join(os.path.dirname(__file__), '..', 'exercise_session.py')
    subprocess.Popen([sys.executable, script_path, exercise_id])
    return JsonResponse({'status': 'Exercise started'})


def login_view(request):

    error = ""
    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        # Authenticate the user.
        user = authenticate(request, username=username, password=password)


        if user is not None:
            # Login the user
            login(request, user)

            # Redirect based on user type (doctor or patient)
            if user.is_staff:
                # User is a doctor
                return redirect('/api/doctor/profile/')
            else:
                # User is a patient
                return redirect('/api/patient/profile/')
        else:
            error = "Invalid"

    return render(request, 'login.html', {"error": error})


def login_api(request):
    if request.method == 'POST':
        try:
            # 1. Access request.body (a binary object)
            data_bytes = request.body

            # 2. Decode it into a JSON string
            json_string = data_bytes.decode('utf-8')

            # 3. Load the JSON string into a Python dictionary
            data = json.loads(json_string)

            # Now you can get the data just like a dictionary
            email = data.get('email')
            password = data.get('password')

            # Your authentication logic goes here...
            user = authenticate(request, username=email, password=password)
            if user is not None:
                # Login the user
                login(request, user)

                # Redirect based on user type (doctor or patient)
                if user.is_staff:
                    # User is a doctor
                    return redirect('/api/doctor/profile/')
                else:
                    # User is a patient
                    return redirect('/api/patient/profile/')
            else:
                error = "Invalid"

            return JsonResponse({'message': 'Data received!'})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)


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
    try:
        patient = get_object_or_404(PatientProfile, user=request.user)
        
        data = {
                    'patient name': patient.user.username, 
                    'phone number': patient.phone_number, 
                    'email': patient.user.email, 
                    'dob': patient.date_of_birth, 
                    'gender': patient.gender,
                    'assigned doctor': patient.doctor.id,
                    'height' : patient.height, 
                    'weight' : patient.weight, 
                    'bg' : patient.blood_group, 
                    # 'patient image' : patient.image
                }        
        return JsonResponse(data)
        
    except PatientProfile.DoesNotExist:
        return JsonResponse({'error': 'Patient profile not found'}, status=404)


@login_required
def doctor_profile_api(request):
    try:
    
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        
        data = {'doctor name': doctor.user.username,
                'phone number': doctor.phone_number,
                'email': doctor.user.email,
                'specialization': doctor.speciality,
                'qualification': doctor.qualification,
                }

        return JsonResponse(data)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Doctor profile not found.'}, status=404)