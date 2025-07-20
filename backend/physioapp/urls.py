from django.urls import path
from . import views

urlpatterns = [
    path('video-feed/', views.video_feed, name='video_feed'),
    path('', views.webcam_page, name='webcam_page'),
    path('api/test/', views.test_api),
]
