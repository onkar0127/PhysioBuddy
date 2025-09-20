from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
#    path('video-feed/', views.video_feed, name='video_feed'),
#    path('', views.webcam_page, name='webcam_page'),
#    path('api/test/', views.test_api),

    path('login/', views.login_view),

    # API endpoints
    path('api/login/', views.login_api),
    path('api/patient/profile/', views.patient_profile_api),
    path('api/doctor/profile/', views.doctor_profile_api),

    # Tkinter URL
    path('tk/', views.tk),
    path('start-exercise/', views.start_exercise),
]
