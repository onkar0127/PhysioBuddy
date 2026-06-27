from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Comman API endpoints
    path('api/login/', views.login_api),
    path('api/logout/', views.logout_api),
    
    # Routes for Doctors
    path('api/doctor/get-name/', views.get_doctor_name),
    path('api/doctor/profile/', views.doctor_profile_api),
    path('api/doctor/home/', views.doctor_home_api),
    path('api/doctor/update-image/', views.update_doctor_image),
    path('api/patient-status/', views.get_patient_status),
    path('api/doctor/get-my-patients/',views.my_patients),
    path('api/submit-assignment/', views.submit_assignment),

    # Routes for Patients
    path('api/patient/profile/', views.patient_profile_api),
    path('api/get-exercise-list/', views.get_exercise_list),
    path('api/patient/update-image/', views.update_patient_image),
    path('api/update-completion/', views.update_completion_status),
    path('api/check-compliance/', views.check_exercise_compliance),

    # Message API routes
    path('api/patient/send-message/', views.send_message_api),
    path('api/patient/messages/', views.get_patient_messages_api),
    path('api/doctor/messages/', views.get_doctor_messages_api),
    path('api/doctor/messages/mark-read/', views.mark_message_read_api),
]

