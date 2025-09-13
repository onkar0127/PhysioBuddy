from django.db import models
from django.contrib.auth.models import User

class DoctorProfile(models.Model):
    """
    Model to store a doctor's specific information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    qualification = models.CharField(max_length=255)
    speciality = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return self.user.username

class PatientProfile(models.Model):
    """
    Model to store a patient's specific information.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True)
    height = models.IntegerField()
    weight = models.IntegerField()
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    image = models.ImageField(null=True, blank=True)
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL, # If the doctor is deleted, the patient is not.
        related_name='patients',
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.username

class Exercise(models.Model):
    """
    Model to define a specific exercise with its details.
    """
    name = models.CharField(max_length=255)
    description = models.TextField()
    demo_video_url = models.URLField()
    thumbnail_image_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

class AssignedExercise(models.Model):
    """
    Model to track an exercise assigned by a doctor to a patient.
    """
    patient = models.ForeignKey(
        PatientProfile,
        on_delete=models.CASCADE,
        related_name='assigned_exercises'
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    assigned_by = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL, # If doctor is deleted, we keep the record.
        related_name='assigned_by',
        blank=True,
        null=True
    )
    target_reps = models.IntegerField()
    is_completed = models.BooleanField(default=False)
    date_assigned = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.user.username}'s assignment of {self.exercise.name}"