from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

BLOOD_TYPES = [
    ('A+', 'A positive'),
    ('A-', 'A negative'),
    ('B+', 'B positive'),
    ('B-', 'B negative'),
    ('AB+', 'AB positive'),
    ('AB-', 'AB negative'),
    ('O+', 'O positive'),
    ('O-', 'O negative'),
]

GENDER_TYPES = [
    ('male', 'Male'),
    ('female', 'Female'),
]


class User(AbstractUser):
    """
    Custom User model with role flags:
    - is_hospital_admin: True for Hospital Admins
    - is_staff: True for Hospital Admins and Doctors (and Super Admin)
    - is_superuser: True for Super Admin
    - is_user: True for all authenticated users
    """
    is_hospital_admin = models.BooleanField(default=False)
    is_user = models.BooleanField(default=True)

    @property
    def is_super_admin(self):
        return self.is_superuser

    @property
    def is_doctor(self):
        return self.is_staff and not self.is_hospital_admin and not self.is_superuser


class Hospital(models.Model):
    """
    Model representing a Hospital/Clinic organization managed by a Hospital Admin.
    """
    name = models.CharField(max_length=255, unique=True)
    admin = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='managed_hospital'
    )
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DoctorProfile(models.Model):
    """
    Model to store a doctor's specific information.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='doctors',
        null=True,
        blank=True
    )
    qualification = models.CharField(max_length=255)
    speciality = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    image_base64 = models.TextField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True, null=True, choices=GENDER_TYPES)
    city = models.CharField(max_length=100, blank=True, null=True)  
    hospital_name = models.CharField(max_length=255, blank=True, null=True)
    experience_years = models.IntegerField(null=True, blank=True)
    professional_summary = models.TextField(null=True)

    def __str__(self):
        return f"Dr. {self.user.username} ({self.hospital.name if self.hospital else self.hospital_name or 'Independent'})"


class PatientProfile(models.Model):
    """
    Model to store a patient's specific information.
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        related_name='patients',
        null=True,
        blank=True
    )
    date_of_birth = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True, choices=GENDER_TYPES)
    height = models.IntegerField(null=True)
    weight = models.IntegerField(null=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_TYPES, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    image_base64 = models.TextField(null=True, blank=True)  
    doctor = models.ForeignKey(
        DoctorProfile,
        on_delete=models.SET_NULL,
        related_name='patients',
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} ({self.hospital.name if self.hospital else 'No Hospital'})"


class Exercise(models.Model):
    """
    Model to define a specific exercise with its details (Managed by Super Admin).
    """
    name = models.CharField(max_length=255)
    description = models.TextField()
    demo_video_url = models.URLField()
    thumbnail_image_url = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_exercises'
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True)

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
        on_delete=models.SET_NULL,
        related_name='assigned_by',
        blank=True,
        null=True
    )
    target_reps = models.IntegerField()
    is_completed = models.BooleanField(default=False)
    date_assigned = models.DateTimeField(auto_now_add=True)
    assigned_time = models.TimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient.user.username}'s assignment of {self.exercise.name}"
    

class Message(models.Model):
    patient = models.ForeignKey(PatientProfile, on_delete=models.CASCADE)
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE)
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
