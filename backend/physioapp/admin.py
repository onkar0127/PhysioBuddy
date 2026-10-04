from django.contrib import admin
from .models import User, Hospital, DoctorProfile, PatientProfile, Exercise, AssignedExercise, Message
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

@admin.register(User)
class CustomUserAdmin(DefaultUserAdmin):
    list_display = ('id', 'username', 'email', 'is_hospital_admin', 'is_staff', 'is_superuser', 'is_user')
    list_filter = ('is_hospital_admin', 'is_staff', 'is_superuser', 'is_user', 'is_active')
    fieldsets = DefaultUserAdmin.fieldsets + (
        ('Role Configuration', {'fields': ('is_hospital_admin', 'is_user')}),
    )


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'admin', 'city', 'phone_number', 'email', 'created_at')
    search_fields = ('name', 'admin__username', 'city', 'email')
    list_filter = ('city', 'created_at')


@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'hospital', 'qualification', 'speciality', 'phone_number', 'gender', 'city', 'experience_years')
    search_fields = ('user__username', 'speciality', 'hospital__name')
    list_filter = ('hospital', 'speciality')


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'hospital', 'gender', 'date_of_birth', 'phone_number', 'doctor')
    search_fields = ('user__username', 'hospital__name', 'phone_number', 'doctor__user__username')
    list_filter = ('hospital', 'doctor', 'gender')


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'demo_video_url', 'created_by', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)


@admin.register(AssignedExercise)
class AssignedExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'exercise', 'assigned_by', 'target_reps', 'is_completed', 'date_assigned')
    raw_id_fields = ('patient', 'exercise', 'assigned_by')
    list_filter = ('is_completed', 'exercise', 'assigned_by')
    search_fields = (
        'patient__user__username',
        'exercise__name',
        'assigned_by__user__username'
    )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'content', 'is_read', 'created_at')
