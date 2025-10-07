from django.urls import path
from .consumers import ExerciseConsumer

websocket_urlpatterns = [
    path("ws/exercise/", ExerciseConsumer.as_asgi()),
]
