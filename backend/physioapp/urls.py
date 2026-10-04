from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Common & Auth API endpoints
    path('api/login/', views.login_api),
    path('api/logout/', views.logout_api),
    path('api/auth/me/', views.get_current_user_api),
    path('api/register-hospital/', views.register_hospital_api),
    
    # Super Admin API endpoints
    path('api/superadmin/login/', views.superadmin_login_api),
    path('api/superadmin/dashboard/', views.superadmin_dashboard_api),
    path('api/superadmin/hospitals/', views.superadmin_hospitals_api),
    path('api/superadmin/hospitals/create/', views.register_hospital_api),
    path('api/superadmin/hospitals/<int:hospital_id>/', views.superadmin_hospital_detail_api),
    path('api/superadmin/exercises/', views.superadmin_get_exercises_api),
    path('api/superadmin/exercises/create/', views.superadmin_create_exercise_api),
    path('api/superadmin/exercises/<int:exercise_id>/delete/', views.superadmin_delete_exercise_api),

    # Hospital Admin API endpoints
    path('api/hospital-admin/dashboard/', views.hospital_admin_dashboard_api),
    path('api/hospital-admin/profile/', views.hospital_admin_profile_api),
    path('api/hospital-admin/profile/update/', views.hospital_admin_update_profile_api),
    path('api/hospital-admin/doctors/', views.hospital_admin_doctors_api),
    path('api/hospital-admin/doctors/create/', views.hospital_admin_create_doctor_api),
    path('api/hospital-admin/doctors/<int:doctor_id>/delete/', views.hospital_admin_delete_doctor_api),
    path('api/hospital-admin/patients/', views.hospital_admin_patients_api),
    path('api/hospital-admin/patients/create/', views.hospital_admin_create_patient_api),
    path('api/hospital-admin/patients/<int:patient_id>/delete/', views.hospital_admin_delete_patient_api),

    # Routes for Doctors
    path('api/doctor/get-name/', views.get_doctor_name),
    path('api/doctor/profile/', views.doctor_profile_api),
    path('api/doctor/home/', views.doctor_home_api),
    path('api/doctor/update-image/', views.update_doctor_image),
    path('api/patient-status/', views.get_patient_status),
    path('api/doctor/get-my-patients/', views.my_patients),
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
