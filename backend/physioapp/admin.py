from django.contrib import admin
from .models import User, DoctorProfile, PatientProfile, Exercise, AssignedExercise
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

admin.site.unregister(User)
@admin.register(User)
class CustomUserAdmin(DefaultUserAdmin):
    # Your custom list_display here
    list_display = ('id', 'username', 'email', 'is_staff', 'is_superuser')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    # Displays these fields in the admin list view
    list_display = ('id', 'user', 'qualification', 'speciality', 'phone_number')
    # Adds a search bar for these fields
    search_fields = ('user__username', 'speciality')
    # Filters by speciality
    list_filter = ('speciality',)

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'gender', 'date_of_birth', 'phone_number', 'doctor')
    search_fields = ('user__username', 'gender', 'date_of_birth', 'phone_number', 'doctor')
    list_filter = ('doctor', 'gender')

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'demo_video_url', 'thumbnail_image_url')
    search_fields = ('name',)

@admin.register(AssignedExercise)
class AssignedExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'exercise', 'assigned_by', 'target_reps', 'is_completed', 'date_assigned')
    # Using raw_id_fields to improve performance for foreign keys
    raw_id_fields = ('patient', 'exercise', 'assigned_by')
    list_filter = ('is_completed', 'exercise', 'assigned_by')
    search_fields = (
        'patient__user__username',
        'exercise__name',
        'assigned_by__user__username'
    )