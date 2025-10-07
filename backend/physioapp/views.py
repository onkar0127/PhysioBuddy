from django.shortcuts import render
import subprocess
import os, sys

import json
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from .models import PatientProfile, DoctorProfile, AssignedExercise

from django.views.decorators.csrf import csrf_exempt

from django.utils import timezone

def tk(request):
    return render(request, 'exercise.html')

def start_exercise(request):
    exercise_id = request.GET.get('exercise_id', '1')  # default to 1
    script_path = os.path.join(os.path.dirname(__file__), '..', 'exercise_session.py')
    subprocess.Popen([sys.executable, script_path, exercise_id])
    return JsonResponse({'status': 'Exercise started'})


@csrf_exempt
def login_api(request):
    if request.method =='post':
        try:
            # Access request.body (a binary object)
            data_bytes = request.body

            # Decode it into a JSON string
            json_string = data_bytes.decode('utf-8')

            # Load the JSON string into a Python dictionary
            data = json.loads(json_string)

            # Get the data
            username = data.get('username')
            password = data.get('password')
            #username = User2@1234
            #password = Iam4050
            # Authentication logic goes here...
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Login the user
                login(request, user)

                # Check the user type: doctor or patient
                if user.is_staff:
                    # User is a doctor
                    return JsonResponse({'user': 'doctor'}, status=200)
                else:
                    # User is a patient
                    return JsonResponse({'user': 'patient'}, status=200)
            else:
                return JsonResponse({'error': 'User doesn\'t exists123'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    #return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    if request.method =='GET':
        try:
           
            # Get the data
            username = request.GET.get('username')
            password = request.GET.get('password')
            #username = User2@1234
            #password = Iam4050
            # Authentication logic goes here...
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Login the user
                login(request, user)

                # Check the user type: doctor or patient
                if user.is_staff:
                    # User is a doctor
                    return JsonResponse({'user': 'doctor'}, status=200)
                else:
                    # User is a patient
                    return JsonResponse({'user': 'patient'}, status=200)
            else:
                return JsonResponse({'error': 'User doesn\'t exists123'}, status=404)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if request.method == 'GET':
         # Get the data
            username = request.GET.get('username')
            password = request.GET.get('password')

            # Authentication logic goes here...
            user = authenticate(request, username=username, password=password)
            if user is not None:
                # Login the user
                login(request, user)

                # Check the user type: doctor or patient
                if user.is_staff:
                    # User is a doctor
                    return JsonResponse({'user': 'doctor'}, status=200)
                else:
                    # User is a patient
                    return JsonResponse({'user': 'patient'}, status=200)
            else:
                return JsonResponse({'error': 'User doesn\'t exists'}, status=404)

    return JsonResponse({'error': 'Invalid request method'}, status=405)


@login_required
def patient_profile_api(request):
    try:
        patient = get_object_or_404(PatientProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Patient profile not found'}, status=404)

    patient_details = {
                'patient name': patient.user.username, 
                'phone number': patient.phone_number, 
                'email': patient.user.email, 
                'dob': patient.date_of_birth, 
                'gender': patient.gender,
                'assigned doctor': patient.doctor.id,
                'height' : patient.height, 
                'weight' : patient.weight, 
                'bg' : patient.blood_group, 
                'patient image' : patient.image.url if patient.image else None
            }        
    return JsonResponse(patient_details, status=200)


@login_required
def doctor_profile_api(request):
    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Doctor profile not found.'}, status=404)
    
    doctor_details = {
                    'doctor name': doctor.user.username,
                    'phone number': doctor.phone_number,
                    'email': doctor.user.email,
                    'specialization': doctor.speciality,
                    'qualification': doctor.qualification,
                }

    return JsonResponse(doctor_details, status=200)


@login_required
def get_patient_list(request):
    # Check if the user is doctor
    if not request.user.is_staff:
        return JsonResponse({'error': 'Permission denied.'}, status=403)

    # Identify the Doctor Profile
    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Doctor profile not found.'}, status=404)

    # Get today's date
    today = timezone.now().date()
    
    # Filter Assignments for today by the current doctor
    assignments = AssignedExercise.objects.filter(
        assigned_by=doctor,
        
    )
    # Manually Serialize the QuerySet into a JSON-ready list
    assignments_list = []
    for assignment in assignments:
        assignments_list.append({
            'patient_username': assignment.patient.user.username,
            'exercise_name': assignment.exercise.name,
            'exercise_video_url': assignment.exercise.demo_video_url,
            'target_reps': assignment.target_reps,
            'is_completed': assignment.is_completed,
            'date_assigned': assignment.date_assigned.isoformat() # Convert DateTimeField to string
        })

    # Return the list as a JsonResponse
    return JsonResponse(assignments_list, safe=False, status=200)



@login_required
def get_exercise_list(request):
    # Check if the user is patient
    if  request.user.is_staff:
        return JsonResponse({'error': 'Permission denied.'}, status=403)
    try:
        Patientobj = get_object_or_404(PatientProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Patient profile not found.'}, status=404)
    #today = timezone.now().date()
    assignments = AssignedExercise.objects.filter(
        patient=Patientobj,
       
    ).select_related('exercise')
    
    assignments_list = []
    for assignment in assignments:
        assignments_list.append({
            'patient_username': assignment.patient.user.username,
            'exercise_name': assignment.exercise.name,
            'exercise_video_url': assignment.exercise.demo_video_url,
            'target_reps': assignment.target_reps,
            'is_completed': assignment.is_completed,
            'date_assigned': assignment.date_assigned.isoformat() # Convert DateTimeField to string
        })

    # Return the list as a JsonResponse
    return JsonResponse(assignments_list, safe=False, status=200)
