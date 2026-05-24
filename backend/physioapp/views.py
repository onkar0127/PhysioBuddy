import json
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from .models import PatientProfile, DoctorProfile, AssignedExercise,Exercise
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

# Common API
def login_api(request):
    if request.method == 'GET':
            # Get the data
            username = request.GET.get('username')
            password = request.GET.get('password')
            
            logout(request)

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

def logout_api(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'message': 'Logged out successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)



# APIs for Doctors
def doctor_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Authentication required"},
            status=401
        )

    try:
        # 2. Fetch doctor profile for the logged-in user
        doctor = get_object_or_404(DoctorProfile, user=request.user)

        # 3. Build response
        doctor_details = {
            "doctor_name": doctor.user.username,
            "phone_number": doctor.phone_number,
            "email": doctor.user.email,
            "specialization": doctor.speciality,
            "qualification": doctor.qualification,
            "gender": doctor.gender,
            "city": doctor.city,
            "hospital_name": doctor.hospital_name,
            "experience_years": doctor.experience_years,
            "professional_summary": doctor.professional_summary,
            "doctor_image": doctor.image_base64

        }
        return JsonResponse(doctor_details, status=200)

    except Http404:
        return JsonResponse(
            {"error": "Doctor profile not found"},
            status=404
        )

@csrf_exempt 
def update_doctor_image(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not logged in'}, status=401)
            
        try:
            # Parse the incoming JSON from React
            data = json.loads(request.body)
            base64_string = data.get('doctor_image')

            # Find the doctor and update the field
            doctor = get_object_or_404(DoctorProfile, user=request.user)
            doctor.image_base64 = base64_string
            doctor.save()

            return JsonResponse({'success': 'Image updated successfully'}, status=200)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
    return JsonResponse({'error': 'Invalid method'}, status=405)

def get_patient_status(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        curr_doc = DoctorProfile.objects.get(user = request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'message':"Can't find the doctor!!!"})
    else:
        patients = PatientProfile.objects.filter(doctor=curr_doc)
        patient_data_list = []
        for patient in patients:        
            patient_data = {}
            patient_data['name']=patient.user.username
            exe_list = []
            assigned_exercises = AssignedExercise.objects.filter(
                                                                    patient=patient, 
                                                                    assigned_by=curr_doc,
                                                                    date_assigned__date = timezone.now().date()
                                                                )
            for assigned_exercise in assigned_exercises:
                exe_list.append(
                                {
                                    'exercise_name':assigned_exercise.exercise.name, 
                                    'reps': assigned_exercise.target_reps, 
                                    'is_completed':assigned_exercise.is_completed
                                }
                                )
            patient_data['assigned_exercises'] = exe_list
            if exe_list:
                patient_data_list.append(patient_data)
    return JsonResponse(patient_data_list, safe=False)

@csrf_exempt
def my_patients(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
        
    try:
        curr_doc = DoctorProfile.objects.get(user = request.user)
        
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'message':"Can't find the doctor!!!"})
    else:
        patients = PatientProfile.objects.filter(doctor=curr_doc)
        exercises = Exercise.objects.all()
       
        patient_data_list = []
        for patient in patients:
            patient_data_list.append(patient.user.username)
        
        exercise_list = []
        for exercise in exercises:
            exercise_list.append(exercise.name)

        # Return combined response
        return JsonResponse({
            'patients': patient_data_list,
            'exercises': exercise_list
        })

@csrf_exempt
def submit_assignment(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            patient_name = data.get('patient_name')
            exercise_name = data.get('exercise_name')
            rep_count = data.get('repetitions')
            
            if not all([patient_name, exercise_name, rep_count]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        try:
            # Creating respective objects
            patient_obj = PatientProfile.objects.get(user__username=patient_name)
            doctor_obj = DoctorProfile.objects.get(user=request.user)  # Use authenticated user
            exercise_obj = Exercise.objects.get(name=exercise_name)

        except PatientProfile.DoesNotExist:
            return JsonResponse({'error': 'Patient doesn\'t exist'}, status=404)
        except Exercise.DoesNotExist:
            return JsonResponse({'error': 'Exercise doesn\'t exist'}, status=404)
        except DoctorProfile.DoesNotExist:
            return JsonResponse({'error': 'Doctor profile not found'}, status=404)
        
        # Creating AssignedExercise Object
        assignment = AssignedExercise(patient=patient_obj, assigned_by=doctor_obj, exercise=exercise_obj, target_reps=rep_count)
        assignment.save()
        return JsonResponse({'message': 'Assignment created successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)







# APIs for Patients
def patient_profile_api(request):
    try:
        patient = get_object_or_404(PatientProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Patient profile not found'}, status=404)
    

    patient_details = {
                'patient_name': patient.user.username, 
                'phone_number': patient.phone_number, 
                'email': patient.user.email, 
                'dob': patient.date_of_birth, 
                'gender': patient.gender,
                'assigned_doctor': patient.doctor.user.username,
                'height' : patient.height, 
                'weight' : patient.weight, 
                'bg' : patient.blood_group, 
                #'patient_image': request.build_absolute_uri(patient.image.url) if patient.image else None
                'patient_image' : patient.image_base64
            }        
    return JsonResponse(patient_details, status=200)

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
        date_assigned__date = timezone.now().date()
       
    ).select_related('exercise')
    
    assignments_list = []
    for assignment in assignments:
        assignments_list.append({
            'patient_username': assignment.patient.user.username,
            'exercise_id': assignment.exercise.id,
            'assignment_id': assignment.id,
            'exercise_name': assignment.exercise.name,
            'exercise_video_url': assignment.exercise.demo_video_url,
            'target_reps': assignment.target_reps,
            'is_completed': assignment.is_completed,
            'date_assigned': assignment.date_assigned.isoformat() # Convert DateTimeField to string
        })

    # Return the list as a JsonResponse
    return JsonResponse(assignments_list, safe=False, status=200)

@csrf_exempt 
def update_patient_image(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Not logged in'}, status=401)
            
        try:
            # Parse the incoming JSON from React
            data = json.loads(request.body)
            base64_string = data.get('patient_image')

            # Find the patient and update the field
            patient = get_object_or_404(PatientProfile, user=request.user)
            patient.image_base64 = base64_string
            patient.save()

            return JsonResponse({'success': 'Image updated successfully'}, status=200)
            
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
            
    return JsonResponse({'error': 'Invalid method'}, status=405)

def get_doctor_name(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        doctor_name = doctor.user.username
        return JsonResponse({'doctor_name': doctor_name}, status=200)
    except Http404:
        return JsonResponse({'error': 'Doctor profile not found'}, status=404)


def update_completion_status(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            data = json.loads(request.body)
            assignment_id = data.get('assignment_id')
        
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        
        try:
            assignment = AssignedExercise.objects.get(
                                                        id=assignment_id,
                                                    )
        except AssignedExercise.DoesNotExist:
            return JsonResponse({'error': 'Assignment not found'}, status=404)
        
        assignment.is_completed = True
        assignment.save()
        
        return JsonResponse({'message': 'Completion status updated successfully'})
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)