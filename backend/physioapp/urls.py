from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/login/', views.login_api),
    path('api/patient/profile/', views.patient_profile_api),
    path('api/doctor/profile/', views.doctor_profile_api),
    path('api/get-patient-list/', views.get_patient_list),
]
