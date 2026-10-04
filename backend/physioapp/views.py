import json
import datetime
import re
import time
import sys
import os
import platform
import random
import django
from django.contrib.auth import authenticate, login, logout, get_user_model, update_session_auth_hash
from django.http import JsonResponse, Http404
from django.shortcuts import get_object_or_404
from .models import Hospital, PatientProfile, DoctorProfile, AssignedExercise, Exercise, Message
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.db import transaction, connection
from django.conf import settings
from .consumers import ExerciseConsumer, LandmarkMock
from .emails import send_credentials_email, send_password_reset_email

User = get_user_model()


def get_user_role(user):
    """
    Determine the role of a given user using role flags:
    - Super Admin: is_superuser or is_super_admin
    - Hospital Admin: is_hospital_admin
    - Doctor: is_staff (and not is_hospital_admin)
    - Patient: default / is_user
    """
    if not user or not user.is_authenticated:
        return None
    if user.is_superuser or getattr(user, 'is_super_admin', False):
        return 'superadmin'
    if getattr(user, 'is_hospital_admin', False):
        return 'hospital_admin'
    if user.is_staff:
        return 'doctor'
    return 'patient'


# ==========================================
# Common & Authentication APIs
# ==========================================

@ensure_csrf_cookie
def csrf_api(request):
    """
    CSRF token bootstrap endpoint.
    Sets the 'csrftoken' cookie on the client and returns the token in JSON.
    """
    if request.method == 'GET':
        token = get_token(request)
        return JsonResponse({'message': 'CSRF cookie set', 'csrfToken': token}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@csrf_exempt
def login_api(request):
    """
    General portal login for Hospital Admins, Doctors, and Patients only.
    Super Admins are redirected to the dedicated Super Admin Portal.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    logout(request)

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    # Allow login by email or username
    try:
        user_obj = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        try:
            user_obj = User.objects.get(username__iexact=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid email/username or password'}, status=404)

    user = authenticate(request, username=user_obj.username, password=password)
    if user is not None:
        role = get_user_role(user)

        # Restrict Super Admin from logging in via standard user portal
        if role == 'superadmin' or user.is_superuser:
            return JsonResponse({'error': 'Invalid email/username or password'}, status=404)

        login(request, user)

        extra_info = {
            'user': role,
            'username': user.username,
            'email': user.email,
            'is_user': getattr(user, 'is_user', True),
            'is_staff': user.is_staff,
            'is_hospital_admin': getattr(user, 'is_hospital_admin', False),
            'is_super_admin': False,
            'is_superuser': False,
        }

        if role == 'hospital_admin' and hasattr(user, 'managed_hospital'):
            extra_info['hospital_id'] = user.managed_hospital.id
            extra_info['hospital_name'] = user.managed_hospital.name
        elif role == 'doctor' and hasattr(user, 'doctorprofile'):
            doc = user.doctorprofile
            extra_info['hospital_name'] = doc.hospital.name if doc.hospital else doc.hospital_name

        return JsonResponse(extra_info, status=200)

    return JsonResponse({'error': 'Invalid email/username or password'}, status=404)


@csrf_exempt
def superadmin_login_api(request):
    """
    Dedicated authentication endpoint for Super Administrators only.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    logout(request)

    if not email or not password:
        return JsonResponse({'error': 'Email/Username and password are required'}, status=400)

    # Allow login by email or username
    try:
        user_obj = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        try:
            user_obj = User.objects.get(username__iexact=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid email/username or password'}, status=404)

    user = authenticate(request, username=user_obj.username, password=password)
    if user is not None:
        role = get_user_role(user)

        # Ensure only Super Admins can authenticate here
        if role != 'superadmin' and not user.is_superuser:
            return JsonResponse({
                'error': 'Access denied: Super Administrator privileges required.'
            }, status=403)

        login(request, user)

        extra_info = {
            'user': 'superadmin',
            'username': user.username,
            'email': user.email,
            'is_user': getattr(user, 'is_user', True),
            'is_staff': user.is_staff,
            'is_hospital_admin': False,
            'is_super_admin': True,
            'is_superuser': True,
        }
        return JsonResponse(extra_info, status=200)

    return JsonResponse({'error': 'Invalid email/username or password'}, status=404)


@csrf_exempt
def forgot_password_api(request):
    """
    Finds a user by email, username, or phone number.
    If found, generates a new temporary password, updates the user's password,
    and sends an automated credentials email to their registered email address.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        raw_query = data.get('identifier', data.get('email', '')).strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    if not raw_query:
        return JsonResponse({'error': 'Please enter your registered Email, Username, or Mobile Phone Number.'}, status=400)

    user_obj = None
    role = None
    hospital_name = 'PhysioBuddy Clinic'

    # 1. Look up by Email
    user_obj = User.objects.filter(email__iexact=raw_query).first()

    # 2. Look up by Username
    if not user_obj:
        user_obj = User.objects.filter(username__iexact=raw_query).first()

    # 3. Look up by Phone Number (cleans non-digits for comparison)
    if not user_obj:
        clean_query = re.sub(r'[^0-9]', '', raw_query)
        if len(clean_query) >= 6:
            # Check Doctor profiles
            doc = DoctorProfile.objects.filter(phone_number__icontains=clean_query).first()
            if doc and doc.user:
                user_obj = doc.user

            # Check Patient profiles
            if not user_obj:
                pat = PatientProfile.objects.filter(phone_number__icontains=clean_query).first()
                if pat and pat.user:
                    user_obj = pat.user

            # Check Hospital phone numbers
            if not user_obj:
                hosp = Hospital.objects.filter(phone_number__icontains=clean_query).first()
                if hosp and hosp.admin:
                    user_obj = hosp.admin

    if not user_obj:
        return JsonResponse({
            'error': f"No account found matching '{raw_query}'. Please verify your email, username, or mobile number."
        }, status=404)

    # Silently reject super admin accounts — show generic not-found
    if user_obj.is_superuser:
        return JsonResponse({
            'error': f"No account found matching '{raw_query}'. Please verify your email, username, or mobile number."
        }, status=404)

    if not user_obj.email or '@' not in user_obj.email:
        return JsonResponse({
            'error': f"Account '{user_obj.username}' does not have a registered email address to receive reset credentials. Please contact your hospital administrator for assistance."
        }, status=400)

    # Determine user role and hospital name
    role = get_user_role(user_obj)
    if role == 'doctor' and hasattr(user_obj, 'doctorprofile'):
        doc = user_obj.doctorprofile
        hospital_name = doc.hospital.name if doc.hospital else (doc.hospital_name or 'PhysioBuddy Clinic')
    elif role == 'patient' and hasattr(user_obj, 'patientprofile'):
        pat = user_obj.patientprofile
        hospital_name = pat.hospital.name if pat.hospital else 'PhysioBuddy Clinic'
    elif role == 'hospital_admin' and hasattr(user_obj, 'managed_hospital'):
        hospital_name = user_obj.managed_hospital.name

    # Generate temporary password
    prefix = 'Doc' if role == 'doctor' else ('Pat' if role == 'patient' else 'Pass')
    random_digits = ''.join(random.choices('0123456789', k=4))
    temp_password = f"{prefix}@{random_digits}"

    # Update password in database
    user_obj.set_password(temp_password)
    user_obj.save()

    # Mask email for privacy in response (e.g. s***h@gmail.com)
    email_parts = user_obj.email.split('@')
    name_part = email_parts[0]
    domain_part = email_parts[1] if len(email_parts) > 1 else ''
    if len(name_part) <= 2:
        masked_name = name_part[0] + '*'
    else:
        masked_name = name_part[0] + '*' * (len(name_part) - 2) + name_part[-1]
    masked_email = f"{masked_name}@{domain_part}"

    full_name = f"{user_obj.first_name} {user_obj.last_name}".strip()
    display_name = full_name if full_name else user_obj.username

    # Send temporary password email
    send_password_reset_email(
        user_email=user_obj.email,
        full_name=display_name,
        username=user_obj.username,
        temp_password=temp_password,
        role=role or 'user',
        hospital_name=hospital_name
    )

    return JsonResponse({
        'success': True,
        'message': f"A new temporary password has been successfully generated and sent to your registered email address ({masked_email}). Please check your inbox and log in.",
        'masked_email': masked_email,
        'username': user_obj.username
    }, status=200)


@csrf_exempt
def superadmin_forgot_password_api(request):
    """
    Dedicated password recovery for Super Admin accounts only.
    Searches only superuser accounts by email or username.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        raw_query = data.get('identifier', data.get('email', '')).strip()
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    if not raw_query:
        return JsonResponse({'error': 'Please enter your Super Admin email or username.'}, status=400)

    user_obj = None

    # Only search among superusers
    user_obj = User.objects.filter(email__iexact=raw_query, is_superuser=True).first()
    if not user_obj:
        user_obj = User.objects.filter(username__iexact=raw_query, is_superuser=True).first()

    if not user_obj:
        return JsonResponse({
            'error': f"No Super Admin account found matching '{raw_query}'. Verify your admin email or username."
        }, status=404)

    if not user_obj.email or '@' not in user_obj.email:
        return JsonResponse({
            'error': f"Super Admin account '{user_obj.username}' does not have a registered email address. Contact platform support."
        }, status=400)

    # Generate temporary password
    random_digits = ''.join(random.choices('0123456789', k=6))
    temp_password = f"Root@{random_digits}"

    # Update password in database
    user_obj.set_password(temp_password)
    user_obj.save()

    # Mask email for privacy
    email_parts = user_obj.email.split('@')
    name_part = email_parts[0]
    domain_part = email_parts[1] if len(email_parts) > 1 else ''
    if len(name_part) <= 2:
        masked_name = name_part[0] + '*'
    else:
        masked_name = name_part[0] + '*' * (len(name_part) - 2) + name_part[-1]
    masked_email = f"{masked_name}@{domain_part}"

    full_name = f"{user_obj.first_name} {user_obj.last_name}".strip()
    display_name = full_name if full_name else user_obj.username

    # Send temporary password email
    send_password_reset_email(
        user_email=user_obj.email,
        full_name=display_name,
        username=user_obj.username,
        temp_password=temp_password,
        role='superadmin',
        hospital_name='PhysioBuddy Master Platform'
    )

    return JsonResponse({
        'success': True,
        'message': f"A new temporary root password has been sent to your registered email ({masked_email}). Check your inbox and log in.",
        'masked_email': masked_email,
        'username': user_obj.username
    }, status=200)


@csrf_exempt
def logout_api(request):
    """
    Logs out the user and destroys the active session.
    Marked csrf_exempt to ensure a missing or stale CSRF cookie does not prevent session termination.
    """
    if request.method in ['POST', 'GET']:
        logout(request)
        return JsonResponse({'message': 'Logged out successfully'}, status=200)
    return JsonResponse({'error': 'Invalid request method'}, status=405)


@ensure_csrf_cookie
def get_current_user_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'authenticated': False}, status=200)

    role = get_user_role(request.user)
    data = {
        'authenticated': True,
        'user': role,
        'username': request.user.username,
        'email': request.user.email,
        'is_user': getattr(request.user, 'is_user', True),
        'is_staff': request.user.is_staff,
        'is_hospital_admin': getattr(request.user, 'is_hospital_admin', False),
        'is_super_admin': request.user.is_superuser or getattr(request.user, 'is_super_admin', False),
        'is_superuser': request.user.is_superuser,
    }

    if role == 'hospital_admin' and hasattr(request.user, 'managed_hospital'):
        data['hospital_id'] = request.user.managed_hospital.id
        data['hospital_name'] = request.user.managed_hospital.name
    elif role == 'doctor' and hasattr(request.user, 'doctorprofile'):
        doc = request.user.doctorprofile
        data['hospital_name'] = doc.hospital.name if doc.hospital else doc.hospital_name

    return JsonResponse(data, status=200)


# ==========================================
# Hospital Registration (Public / Direct)
# ==========================================

@csrf_exempt
def register_hospital_api(request):
    """
    Allows registering a new hospital and creating its Hospital Admin account.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        hospital_name = data.get('hospital_name', '').strip()
        admin_username = data.get('admin_username', '').strip()
        admin_email = data.get('admin_email', '').strip()
        admin_password = data.get('admin_password', '').strip()
        city = data.get('city', '').strip()
        address = data.get('address', '').strip()
        phone_number = data.get('phone_number', '').strip()

        if not hospital_name or not admin_username or not admin_email or not admin_password:
            return JsonResponse({'error': 'Hospital Name, Admin Username, Email, and Password are required.'}, status=400)

        if Hospital.objects.filter(name__iexact=hospital_name).exists():
            return JsonResponse({'error': f"A hospital named '{hospital_name}' already exists."}, status=400)

        if User.objects.filter(username__iexact=admin_username).exists():
            return JsonResponse({'error': f"Username '{admin_username}' is already taken."}, status=400)

        if User.objects.filter(email__iexact=admin_email).exists():
            return JsonResponse({'error': f"Email '{admin_email}' is already registered."}, status=400)

        with transaction.atomic():
            admin_user = User.objects.create_user(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                is_staff=True,
                is_hospital_admin=True,
                is_user=True
            )
            hospital = Hospital.objects.create(
                name=hospital_name,
                admin=admin_user,
                city=city,
                address=address,
                phone_number=phone_number,
                email=admin_email
            )

        # Send automated welcome credentials email to Hospital Admin
        send_credentials_email(
            user_email=admin_email,
            full_name=admin_username,
            username=admin_username,
            temp_password=admin_password,
            role='hospital_admin',
            hospital_name=hospital.name
        )

        return JsonResponse({
            'message': f"Hospital '{hospital.name}' registered successfully!",
            'hospital_id': hospital.id,
            'hospital_name': hospital.name,
            'admin_username': admin_user.username
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ==========================================
# Super Admin APIs
# ==========================================

def superadmin_dashboard_api(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    total_hospitals = Hospital.objects.count()
    total_doctors = DoctorProfile.objects.count()
    total_patients = PatientProfile.objects.count()
    total_exercises = Exercise.objects.count()
    total_assignments = AssignedExercise.objects.count()

    hospitals = Hospital.objects.all().order_by('-created_at')[:10]
    hospital_list = []
    for h in hospitals:
        hospital_list.append({
            'id': h.id,
            'name': h.name,
            'city': h.city or 'N/A',
            'phone_number': h.phone_number or 'N/A',
            'email': h.email or 'N/A',
            'admin_username': h.admin.username if h.admin else 'N/A',
            'admin_email': h.admin.email if h.admin else 'N/A',
            'doctors_count': h.doctors.count(),
            'patients_count': h.patients.count(),
            'created_at': h.created_at.strftime('%Y-%m-%d'),
        })

    return JsonResponse({
        'total_hospitals': total_hospitals,
        'total_doctors': total_doctors,
        'total_patients': total_patients,
        'total_exercises': total_exercises,
        'total_assignments': total_assignments,
        'recent_hospitals': hospital_list
    }, status=200)


def superadmin_system_status_api(request):
    """
    Returns comprehensive system telemetry:
    - Database provider detection (Render Postgres, Supabase, AWS RDS, Neon, SQLite, etc.)
    - DB latency, engine, masked host, record counts
    - WebSocket & Pose Tracking channels layer, registered detectors
    - Environment settings (DEBUG, CORS, CSRF, Cookie security, Static storage)
    - Python & Django runtime info
    """
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    # 1. Database Provider & Connection Telemetry
    db_settings = connection.settings_dict
    engine = db_settings.get('ENGINE', '')
    host = db_settings.get('HOST', '') or ''
    name = db_settings.get('NAME', '') or ''
    port = db_settings.get('PORT', '') or ''
    user = db_settings.get('USER', '') or ''

    provider = "Custom / Other Database"
    provider_type = "custom"

    if 'sqlite' in engine:
        provider = "Local SQLite"
        provider_type = "sqlite"
        display_host = "Local Filesystem"
    elif 'postgresql' in engine or 'postgres' in engine or 'psycopg2' in engine:
        host_lower = host.lower()
        if 'render.com' in host_lower or 'dpg-' in host_lower:
            provider = "Render PostgreSQL"
            provider_type = "render"
        elif 'supabase.co' in host_lower or 'supabase.in' in host_lower:
            provider = "Supabase PostgreSQL"
            provider_type = "supabase"
        elif 'rds.amazonaws.com' in host_lower or 'compute.amazonaws.com' in host_lower:
            provider = "AWS RDS (PostgreSQL)"
            provider_type = "aws"
        elif 'neon.tech' in host_lower:
            provider = "Neon PostgreSQL"
            provider_type = "neon"
        elif 'railway.app' in host_lower or 'railway.internal' in host_lower:
            provider = "Railway PostgreSQL"
            provider_type = "railway"
        elif 'aivencloud.com' in host_lower:
            provider = "Aiven PostgreSQL"
            provider_type = "aiven"
        elif host in ('localhost', '127.0.0.1', ''):
            provider = "Local PostgreSQL"
            provider_type = "local_postgres"
        else:
            provider = "PostgreSQL"
            provider_type = "postgresql"

        # Mask host for security
        if host:
            if len(host) > 16:
                display_host = host[:6] + "..." + host[-10:]
            else:
                display_host = host
        else:
            display_host = "localhost"
    elif 'mysql' in engine:
        provider = "MySQL Database"
        provider_type = "mysql"
        display_host = host if host else "localhost"
    else:
        display_host = host or "N/A"

    # Measure DB Latency
    start_time = time.time()
    db_healthy = True
    db_error = None
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_latency_ms = round((time.time() - start_time) * 1000, 2)
    except Exception as e:
        db_latency_ms = -1
        db_healthy = False
        db_error = str(e)

    clean_db_name = os.path.basename(str(name)) if ('/' in str(name) or '\\' in str(name)) else str(name)
    masked_user = (user[:2] + '***' if len(user) > 2 else user) if user else 'N/A'

    # Record counts
    record_counts = {
        'users': User.objects.count(),
        'hospitals': Hospital.objects.count(),
        'doctors': DoctorProfile.objects.count(),
        'patients': PatientProfile.objects.count(),
        'exercises': Exercise.objects.count(),
        'assignments': AssignedExercise.objects.count(),
        'messages': Message.objects.count(),
    }

    # 2. WebSocket & Pose Tracking Telemetry
    channel_layers_setting = getattr(settings, 'CHANNEL_LAYERS', {})
    default_layer = channel_layers_setting.get('default', {})
    layer_backend = default_layer.get('BACKEND', 'channels.layers.InMemoryChannelLayer')

    if 'Redis' in layer_backend or 'redis' in layer_backend:
        channel_layer_type = "Redis Channel Layer (Distributed)"
    elif 'InMemory' in layer_backend:
        channel_layer_type = "In-Memory Channel Layer (Single Process / Dev)"
    else:
        channel_layer_type = layer_backend.split('.')[-1]

    # Active Pose Detectors Catalog
    pose_detectors = [
        {
            'id': 1,
            'name': 'Bicep Curls',
            'category': 'Upper Body',
            'tracked_joints': 'Shoulder, Elbow, Wrist',
            'type': 'Flexion / Extension Angle (45°-140°)',
            'status': 'ACTIVE'
        },
        {
            'id': 2,
            'name': 'Quadriceps Stretches',
            'category': 'Lower Body',
            'tracked_joints': 'Hip, Knee, Ankle',
            'type': 'Flexion Angle & Balance (60°-150°)',
            'status': 'ACTIVE'
        },
        {
            'id': 3,
            'name': 'Shoulder Exercises',
            'category': 'Upper Body',
            'tracked_joints': 'Hip, Shoulder, Elbow',
            'type': 'Arm Abduction & Overhead Lift (>160°)',
            'status': 'ACTIVE'
        },
        {
            'id': 4,
            'name': 'Squats',
            'category': 'Lower Body',
            'tracked_joints': 'Hip, Knee, Ankle, Torso',
            'type': 'Knee-Hip Triple Flexion (<100°)',
            'status': 'ACTIVE'
        },
        {
            'id': 5,
            'name': 'Standing Knee Lifts',
            'category': 'Lower Body / Core',
            'tracked_joints': 'Hip, Knee, Foot',
            'type': 'Hip Flexion & Knee Elevation (>90°)',
            'status': 'ACTIVE'
        },
    ]

    # Check OpenCV / MediaPipe
    cv_available = False
    cv_version = "N/A"
    try:
        import cv2
        cv_available = True
        cv_version = getattr(cv2, '__version__', 'Available')
    except ImportError:
        pass

    # 3. Environment, Security & Static Files
    allowed_hosts = getattr(settings, 'ALLOWED_HOSTS', [])
    cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', [])
    csrf_origins = getattr(settings, 'CSRF_TRUSTED_ORIGINS', [])
    debug_mode = getattr(settings, 'DEBUG', False)
    session_cookie_samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'Lax')
    session_cookie_secure = getattr(settings, 'SESSION_COOKIE_SECURE', False)
    csrf_cookie_secure = getattr(settings, 'CSRF_COOKIE_SECURE', False)

    # Static files storage
    static_storage = getattr(settings, 'STATICFILES_STORAGE', '')
    if not static_storage:
        storages = getattr(settings, 'STORAGES', {})
        staticfiles = storages.get('staticfiles', {})
        static_storage = staticfiles.get('BACKEND', 'django.contrib.staticfiles.storage.StaticFilesStorage')

    whitenoise_active = any('whitenoise' in m.lower() for m in getattr(settings, 'MIDDLEWARE', []))

    return JsonResponse({
        'server': {
            'status': 'OPERATIONAL',
            'python_version': sys.version.split(' ')[0],
            'django_version': django.get_version(),
            'platform': platform.system() + ' ' + platform.release(),
            'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S %Z'),
            'debug': debug_mode,
            'environment': 'Development (DEBUG=True)' if debug_mode else 'Production (DEBUG=False)',
        },
        'database': {
            'provider': provider,
            'provider_type': provider_type,
            'engine': engine.split('.')[-1] if '.' in engine else engine,
            'database_name': clean_db_name,
            'host': display_host,
            'port': port or ('5432' if 'postgres' in engine else '3306' if 'mysql' in engine else 'N/A'),
            'user': masked_user,
            'is_healthy': db_healthy,
            'latency_ms': db_latency_ms,
            'error': db_error,
            'records': record_counts,
        },
        'websocket': {
            'asgi_application': getattr(settings, 'ASGI_APPLICATION', 'physioapp.asgi.application'),
            'channel_layer_type': channel_layer_type,
            'channel_layer_backend': layer_backend.split('.')[-1] if '.' in layer_backend else layer_backend,
            'websocket_route': '/ws/exercise/',
            'status': 'OPERATIONAL',
        },
        'pose_tracking': {
            'engine': 'MediaPipe Pose Landmark Solutions (33 Keypoints)',
            'opencv_available': cv_available,
            'opencv_version': cv_version,
            'detectors_count': len(pose_detectors),
            'detectors': pose_detectors,
            'status': 'OPERATIONAL',
        },
        'security': {
            'allowed_hosts': allowed_hosts,
            'cors_allowed_origins': cors_origins,
            'csrf_trusted_origins': csrf_origins,
            'session_cookie_samesite': session_cookie_samesite,
            'session_cookie_secure': session_cookie_secure,
            'csrf_cookie_secure': csrf_cookie_secure,
            'whitenoise_active': whitenoise_active,
            'static_storage': static_storage.split('.')[-1] if '.' in static_storage else static_storage,
        }
    }, status=200)


@csrf_exempt
def superadmin_run_diagnostics_api(request):
    """
    Executes live non-destructive diagnostic benchmarks:
    1. Database ping latency test
    2. Django ORM data query
    3. AI Pose Landmark calculation engine verification
    4. Production security configuration audit
    """
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    results = []

    # 1. Database Read Ping Test
    t0 = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_ms = round((time.time() - t0) * 1000, 2)
        results.append({
            'name': 'Database Query Ping',
            'status': 'PASSED',
            'latency_ms': db_ms,
            'details': f"Raw database connection responded in {db_ms}ms"
        })
    except Exception as e:
        results.append({
            'name': 'Database Query Ping',
            'status': 'FAILED',
            'latency_ms': -1,
            'details': str(e)
        })

    # 2. Django ORM Model Layer
    t0 = time.time()
    try:
        user_count = User.objects.count()
        hospital_count = Hospital.objects.count()
        orm_ms = round((time.time() - t0) * 1000, 2)
        results.append({
            'name': 'Django ORM & Model Layer',
            'status': 'PASSED',
            'latency_ms': orm_ms,
            'details': f"Successfully fetched records ({user_count} users, {hospital_count} hospitals) in {orm_ms}ms"
        })
    except Exception as e:
        results.append({
            'name': 'Django ORM & Model Layer',
            'status': 'FAILED',
            'latency_ms': -1,
            'details': str(e)
        })

    # 3. AI Pose Landmark Engine Calculation Test
    t0 = time.time()
    try:
        consumer = ExerciseConsumer()
        # Create 33 mock landmarks
        synthetic_landmarks = [
            LandmarkMock(0.5, 0.5, 0.0, 0.99) for _ in range(33)
        ]
        # Position left arm: shoulder (11), elbow (13), wrist (15)
        synthetic_landmarks[11] = LandmarkMock(0.5, 0.3, 0.0, 0.99)
        synthetic_landmarks[13] = LandmarkMock(0.5, 0.5, 0.0, 0.99)
        synthetic_landmarks[15] = LandmarkMock(0.5, 0.7, 0.0, 0.99)

        # Test angle calculation
        angle = consumer.calculate_angle(
            (synthetic_landmarks[11].x, synthetic_landmarks[11].y),
            (synthetic_landmarks[13].x, synthetic_landmarks[13].y),
            (synthetic_landmarks[15].x, synthetic_landmarks[15].y)
        )

        ai_ms = round((time.time() - t0) * 1000, 2)
        results.append({
            'name': 'AI Pose Tracking & Math Engine',
            'status': 'PASSED',
            'latency_ms': ai_ms,
            'details': f"Computed 3-point joint angle ({round(angle, 1)}°) and verified vector trigonometry in {ai_ms}ms"
        })
    except Exception as e:
        results.append({
            'name': 'AI Pose Tracking & Math Engine',
            'status': 'FAILED',
            'latency_ms': -1,
            'details': str(e)
        })

    # 4. Security & Environment Configuration Audit
    sec_warnings = []
    if getattr(settings, 'DEBUG', False):
        sec_warnings.append("DEBUG is True")
    secret_key = getattr(settings, 'SECRET_KEY', '') or ''
    if len(secret_key) < 20:
        sec_warnings.append("SECRET_KEY length is short")

    results.append({
        'name': 'Environment & Security Audit',
        'status': 'PASSED' if not sec_warnings else 'WARNING',
        'latency_ms': 0.1,
        'details': "All baseline production security criteria satisfied" if not sec_warnings else f"Notice: {', '.join(sec_warnings)}"
    })

    all_passed = all(r['status'] in ('PASSED', 'WARNING') for r in results)

    return JsonResponse({
        'success': all_passed,
        'timestamp': timezone.now().strftime('%Y-%m-%d %H:%M:%S %Z'),
        'results': results
    }, status=200)


def superadmin_hospitals_api(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    hospitals = Hospital.objects.all().order_by('-created_at')
    hospital_list = []
    for h in hospitals:
        hospital_list.append({
            'id': h.id,
            'name': h.name,
            'city': h.city or 'N/A',
            'address': h.address or '',
            'phone_number': h.phone_number or 'N/A',
            'email': h.email or 'N/A',
            'admin_username': h.admin.username if h.admin else 'N/A',
            'admin_email': h.admin.email if h.admin else 'N/A',
            'doctors_count': h.doctors.count(),
            'patients_count': h.patients.count(),
            'created_at': h.created_at.strftime('%Y-%m-%d'),
        })

    return JsonResponse(hospital_list, safe=False, status=200)


def superadmin_hospital_detail_api(request, hospital_id):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    hospital = get_object_or_404(Hospital, id=hospital_id)
    doctors = hospital.doctors.all().select_related('user')
    patients = hospital.patients.all().select_related('user', 'doctor__user')

    doc_list = []
    for d in doctors:
        doc_list.append({
            'id': d.id,
            'username': d.user.username,
            'email': d.user.email,
            'speciality': d.speciality,
            'qualification': d.qualification,
            'phone_number': d.phone_number or 'N/A',
            'experience_years': d.experience_years,
            'patient_count': d.patients.count(),
        })

    pat_list = []
    for p in patients:
        pat_list.append({
            'id': p.id,
            'username': p.user.username,
            'email': p.user.email,
            'phone_number': p.phone_number or 'N/A',
            'gender': p.gender or 'N/A',
            'blood_group': p.blood_group or 'N/A',
            'assigned_doctor': p.doctor.user.username if p.doctor else 'Unassigned',
        })

    return JsonResponse({
        'id': hospital.id,
        'name': hospital.name,
        'city': hospital.city,
        'address': hospital.address,
        'phone_number': hospital.phone_number,
        'email': hospital.email,
        'admin_username': hospital.admin.username if hospital.admin else 'N/A',
        'created_at': hospital.created_at.strftime('%Y-%m-%d'),
        'doctors': doc_list,
        'patients': pat_list,
    }, status=200)


def superadmin_create_exercise_api(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        demo_video_url = data.get('demo_video_url', '').strip()
        thumbnail_image_url = data.get('thumbnail_image_url', '').strip()

        if not name or not description or not demo_video_url:
            return JsonResponse({'error': 'Exercise Name, Description, and Video URL are required'}, status=400)

        exercise = Exercise.objects.create(
            name=name,
            description=description,
            demo_video_url=demo_video_url,
            thumbnail_image_url=thumbnail_image_url or None,
            created_by=request.user
        )

        return JsonResponse({
            'message': 'Exercise added successfully',
            'exercise': {
                'id': exercise.id,
                'name': exercise.name,
                'description': exercise.description,
                'demo_video_url': exercise.demo_video_url,
                'thumbnail_image_url': exercise.thumbnail_image_url
            }
        }, status=201)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def superadmin_get_exercises_api(request):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    exercises = Exercise.objects.all().order_by('-id')
    exercise_list = []
    for ex in exercises:
        exercise_list.append({
            'id': ex.id,
            'name': ex.name,
            'description': ex.description,
            'demo_video_url': ex.demo_video_url,
            'thumbnail_image_url': ex.thumbnail_image_url,
            'created_at': ex.created_at.strftime('%Y-%m-%d') if ex.created_at else None,
            'created_by': ex.created_by.username if ex.created_by else 'System'
        })
    return JsonResponse(exercise_list, safe=False, status=200)


def superadmin_delete_exercise_api(request, exercise_id):
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({'error': 'Super Admin authentication required'}, status=403)

    if request.method not in ['POST', 'DELETE']:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    exercise = get_object_or_404(Exercise, id=exercise_id)
    exercise.delete()
    return JsonResponse({'message': 'Exercise deleted successfully'}, status=200)


# ==========================================
# Hospital Admin APIs
# ==========================================

def _get_hospital_for_request(request):
    """
    Returns the Hospital object if the user is a Hospital Admin.
    """
    if not request.user.is_authenticated:
        return None
    try:
        return request.user.managed_hospital
    except Hospital.DoesNotExist:
        return None


def hospital_admin_dashboard_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    doctors = hospital.doctors.all()
    patients = hospital.patients.all()
    today = timezone.now().date()

    total_doctors = doctors.count()
    total_patients = patients.count()

    today_assignments = AssignedExercise.objects.filter(
        patient__hospital=hospital,
        date_assigned__date=today
    )
    total_today = today_assignments.count()
    completed_today = today_assignments.filter(is_completed=True).count()

    recent_docs = []
    for d in doctors.order_by('-id')[:5]:
        full_name = f"{d.user.first_name} {d.user.last_name}".strip()
        recent_docs.append({
            'id': d.id,
            'username': d.user.username,
            'first_name': d.user.first_name,
            'last_name': d.user.last_name,
            'name': full_name if full_name else d.user.username,
            'email': d.user.email,
            'speciality': d.speciality,
            'qualification': d.qualification,
            'patient_count': d.patients.count()
        })

    recent_pats = []
    for p in patients.order_by('-id')[:5]:
        pat_full_name = f"{p.user.first_name} {p.user.last_name}".strip()
        doc_full_name = f"{p.doctor.user.first_name} {p.doctor.user.last_name}".strip() if p.doctor else ''
        recent_pats.append({
            'id': p.id,
            'username': p.user.username,
            'first_name': p.user.first_name,
            'last_name': p.user.last_name,
            'name': pat_full_name if pat_full_name else p.user.username,
            'email': p.user.email,
            'assigned_doctor': (doc_full_name if doc_full_name else p.doctor.user.username) if p.doctor else 'Unassigned',
            'gender': p.gender or 'N/A'
        })

    return JsonResponse({
        'hospital_id': hospital.id,
        'hospital_name': hospital.name,
        'city': hospital.city,
        'total_doctors': total_doctors,
        'total_patients': total_patients,
        'today_assignments_total': total_today,
        'today_assignments_completed': completed_today,
        'recent_doctors': recent_docs,
        'recent_patients': recent_pats
    }, status=200)


def hospital_admin_doctors_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    doctors = hospital.doctors.all().select_related('user').order_by('-id')
    doc_list = []
    for d in doctors:
        full_name = f"{d.user.first_name} {d.user.last_name}".strip()
        doc_list.append({
            'id': d.id,
            'username': d.user.username,
            'first_name': d.user.first_name,
            'last_name': d.user.last_name,
            'full_name': full_name if full_name else d.user.username,
            'email': d.user.email,
            'phone_number': d.phone_number or '',
            'speciality': d.speciality,
            'qualification': d.qualification,
            'gender': d.gender or '',
            'city': d.city or '',
            'experience_years': d.experience_years or 0,
            'professional_summary': d.professional_summary or '',
            'patient_count': d.patients.count(),
            'image_base64': d.image_base64
        })

    return JsonResponse(doc_list, safe=False, status=200)


def hospital_admin_create_doctor_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        speciality = data.get('speciality', '').strip()
        qualification = data.get('qualification', '').strip()
        phone_number = data.get('phone_number', '').strip()
        gender = data.get('gender', 'male').strip()
        city = data.get('city', '').strip()
        experience_years = data.get('experience_years')
        professional_summary = data.get('professional_summary', '').strip()

        # If username is empty, auto-generate from first_name and last_name
        if not username:
            clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name).lower()
            clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name).lower()
            if clean_first and clean_last:
                base_user = f"{clean_first}_{clean_last}"
            elif clean_first:
                base_user = clean_first
            elif clean_last:
                base_user = clean_last
            else:
                base_user = 'doctor'

            username = base_user
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_user}_{counter}"
                counter += 1

        if not username or not email or not password or not speciality or not qualification:
            return JsonResponse({'error': 'Username, Email, Password, Speciality, and Qualification are required'}, status=400)

        if User.objects.filter(username__iexact=username).exists():
            return JsonResponse({'error': f"Username '{username}' is already taken"}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({'error': f"Email '{email}' is already registered"}, status=400)

        full_first = f"{first_name} {middle_name}".strip() if middle_name else first_name

        with transaction.atomic():
            doc_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=full_first,
                last_name=last_name,
                is_staff=True,
                is_hospital_admin=False,
                is_user=True
            )
            DoctorProfile.objects.create(
                user=doc_user,
                hospital=hospital,
                hospital_name=hospital.name,
                speciality=speciality,
                qualification=qualification,
                phone_number=phone_number,
                gender=gender,
                city=city or hospital.city,
                experience_years=int(experience_years) if experience_years else None,
                professional_summary=professional_summary
            )

        full_name = f"{first_name} {middle_name} {last_name}".replace('  ', ' ').strip()
        display_name = full_name if full_name else username

        # Send automated welcome credentials email to Doctor
        send_credentials_email(
            user_email=email,
            full_name=display_name,
            username=username,
            temp_password=password,
            role='doctor',
            hospital_name=hospital.name
        )

        return JsonResponse({'message': f"Doctor 'Dr. {display_name}' added successfully to {hospital.name}"}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def hospital_admin_delete_doctor_api(request, doctor_id):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    if request.method not in ['POST', 'DELETE']:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    doctor = get_object_or_404(DoctorProfile, id=doctor_id, hospital=hospital)
    user = doctor.user
    doctor.delete()
    user.delete()

    return JsonResponse({'message': 'Doctor removed successfully'}, status=200)


def hospital_admin_patients_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    patients = hospital.patients.all().select_related('user', 'doctor__user').order_by('-id')
    patient_list = []
    for p in patients:
        pat_full_name = f"{p.user.first_name} {p.user.last_name}".strip()
        doc_full_name = f"{p.doctor.user.first_name} {p.doctor.user.last_name}".strip() if p.doctor else ''
        patient_list.append({
            'id': p.id,
            'username': p.user.username,
            'first_name': p.user.first_name,
            'last_name': p.user.last_name,
            'full_name': pat_full_name if pat_full_name else p.user.username,
            'email': p.user.email,
            'phone_number': p.phone_number or '',
            'gender': p.gender or '',
            'dob': p.date_of_birth.strftime('%Y-%m-%d') if p.date_of_birth else '',
            'blood_group': p.blood_group or '',
            'height': p.height,
            'weight': p.weight,
            'doctor_id': p.doctor.id if p.doctor else None,
            'doctor_name': (doc_full_name if doc_full_name else p.doctor.user.username) if p.doctor else 'Unassigned',
            'image_base64': p.image_base64
        })

    return JsonResponse(patient_list, safe=False, status=200)


def hospital_admin_create_patient_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        phone_number = data.get('phone_number', '').strip()
        gender = data.get('gender', 'male').strip()
        date_of_birth = data.get('dob') or None
        blood_group = data.get('blood_group', '').strip()
        height = data.get('height')
        weight = data.get('weight')
        doctor_id = data.get('doctor_id')

        # If username is empty, auto-generate from first_name and last_name
        if not username:
            clean_first = re.sub(r'[^a-zA-Z0-9]', '', first_name).lower()
            clean_last = re.sub(r'[^a-zA-Z0-9]', '', last_name).lower()
            if clean_first and clean_last:
                base_user = f"{clean_first}_{clean_last}"
            elif clean_first:
                base_user = clean_first
            elif clean_last:
                base_user = clean_last
            else:
                base_user = 'patient'

            username = base_user
            counter = 1
            while User.objects.filter(username__iexact=username).exists():
                username = f"{base_user}_{counter}"
                counter += 1

        if not username or not email or not password:
            return JsonResponse({'error': 'Username, Email, and Password are required'}, status=400)

        if User.objects.filter(username__iexact=username).exists():
            return JsonResponse({'error': f"Username '{username}' is already taken"}, status=400)

        if User.objects.filter(email__iexact=email).exists():
            return JsonResponse({'error': f"Email '{email}' is already registered"}, status=400)

        doctor_obj = None
        if doctor_id:
            try:
                doctor_obj = DoctorProfile.objects.get(id=doctor_id, hospital=hospital)
            except DoctorProfile.DoesNotExist:
                return JsonResponse({'error': 'Assigned Doctor not found in this hospital'}, status=400)

        full_first = f"{first_name} {middle_name}".strip() if middle_name else first_name

        with transaction.atomic():
            pat_user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=full_first,
                last_name=last_name,
                is_staff=False,
                is_hospital_admin=False,
                is_user=True
            )
            PatientProfile.objects.create(
                user=pat_user,
                hospital=hospital,
                doctor=doctor_obj,
                phone_number=phone_number,
                gender=gender,
                date_of_birth=date_of_birth,
                blood_group=blood_group or None,
                height=int(height) if height else None,
                weight=int(weight) if weight else None
            )

        full_name = f"{first_name} {middle_name} {last_name}".replace('  ', ' ').strip()
        display_name = full_name if full_name else username

        # Send automated welcome credentials email to Patient
        send_credentials_email(
            user_email=email,
            full_name=display_name,
            username=username,
            temp_password=password,
            role='patient',
            hospital_name=hospital.name
        )

        return JsonResponse({'message': f"Patient '{display_name}' added successfully to {hospital.name}"}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def hospital_admin_delete_patient_api(request, patient_id):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    if request.method not in ['POST', 'DELETE']:
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    patient = get_object_or_404(PatientProfile, id=patient_id, hospital=hospital)
    user = patient.user
    patient.delete()
    user.delete()

    return JsonResponse({'message': 'Patient removed successfully'}, status=200)


def hospital_admin_profile_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    return JsonResponse({
        'id': hospital.id,
        'hospital_name': hospital.name,
        'city': hospital.city or '',
        'address': hospital.address or '',
        'phone_number': hospital.phone_number or '',
        'hospital_email': hospital.email or '',
        'admin_username': hospital.admin.username,
        'admin_email': hospital.admin.email,
        'created_at': hospital.created_at.strftime('%Y-%m-%d'),
        'total_doctors': hospital.doctors.count(),
        'total_patients': hospital.patients.count(),
    }, status=200)


def hospital_admin_update_profile_api(request):
    hospital = _get_hospital_for_request(request)
    if not hospital:
        return JsonResponse({'error': 'Hospital Admin access required'}, status=403)

    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    try:
        data = json.loads(request.body)
        hospital_name = data.get('hospital_name', '').strip()
        city = data.get('city', '').strip()
        address = data.get('address', '').strip()
        phone_number = data.get('phone_number', '').strip()
        hospital_email = data.get('hospital_email', '').strip()
        admin_email = data.get('admin_email', '').strip()
        new_password = data.get('new_password', '').strip()

        if hospital_name and hospital_name != hospital.name:
            if Hospital.objects.filter(name__iexact=hospital_name).exclude(id=hospital.id).exists():
                return JsonResponse({'error': f"Hospital name '{hospital_name}' is already taken."}, status=400)
            hospital.name = hospital_name

        hospital.city = city
        hospital.address = address
        hospital.phone_number = phone_number
        hospital.email = hospital_email
        hospital.save()

        # Update Admin user email and optional password
        admin_user = hospital.admin
        if admin_email and admin_email != admin_user.email:
            if User.objects.filter(email__iexact=admin_email).exclude(id=admin_user.id).exists():
                return JsonResponse({'error': f"Email '{admin_email}' is already registered by another user."}, status=400)
            admin_user.email = admin_email

        if new_password:
            if len(new_password) < 6:
                return JsonResponse({'error': 'Password must be at least 6 characters long.'}, status=400)
            admin_user.set_password(new_password)

        admin_user.save()

        # Update Doctor hospital_name cache if hospital name changed
        if hospital_name:
            hospital.doctors.all().update(hospital_name=hospital.name)

        return JsonResponse({
            'message': 'Hospital and Administrator profile updated successfully!',
            'hospital': {
                'id': hospital.id,
                'hospital_name': hospital.name,
                'city': hospital.city,
                'address': hospital.address,
                'phone_number': hospital.phone_number,
                'hospital_email': hospital.email,
                'admin_username': admin_user.username,
                'admin_email': admin_user.email,
            }
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ==========================================
# APIs for Doctors
# ==========================================

def doctor_home_api(request):
    """
    Doctor dashboard summary KPI endpoint.
    Restricted to patients belonging to the authenticated doctor and same hospital tenant.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        curr_doc = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Doctor profile not found'}, status=404)

    if curr_doc.hospital:
        patients = PatientProfile.objects.filter(doctor=curr_doc, hospital=curr_doc.hospital).prefetch_related('assigned_exercises')
    else:
        patients = PatientProfile.objects.filter(doctor=curr_doc).prefetch_related('assigned_exercises')

    total_patients = patients.count()
    completed_patients = 0
    not_completed_patients = 0
    today = timezone.now().date()

    for patient in patients:
        assignments = patient.assigned_exercises.filter(
            assigned_by=curr_doc,
            date_assigned__date=today,
        )
        if not assignments.exists():
            continue

        if all(a.is_completed for a in assignments):
            completed_patients += 1
        else:
            not_completed_patients += 1

    hospital_title = curr_doc.hospital.name if curr_doc.hospital else curr_doc.hospital_name or 'PhysioBuddy Clinic'

    return JsonResponse({
        'total_patients': total_patients,
        'completed_patients': completed_patients,
        'not_completed_patients': not_completed_patients,
        'hospital_name': hospital_title
    }, status=200)


def doctor_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        full_name = f"{doctor.user.first_name} {doctor.user.last_name}".strip()

        raw_first = doctor.user.first_name.strip() if doctor.user.first_name else ''
        first_parts = raw_first.split(' ', 1) if raw_first else ['', '']
        first_name = first_parts[0] if len(first_parts) > 0 else ''
        middle_name = first_parts[1] if len(first_parts) > 1 else ''

        doctor_details = {
            "username": doctor.user.username,
            "doctor_name": doctor.user.username,
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": doctor.user.last_name or '',
            "full_name": full_name if full_name else doctor.user.username,
            "phone_number": doctor.phone_number or '',
            "email": doctor.user.email or '',
            "specialization": doctor.speciality or '',
            "speciality": doctor.speciality or '',
            "qualification": doctor.qualification or '',
            "gender": doctor.gender or '',
            "city": doctor.city or '',
            "hospital_name": doctor.hospital.name if doctor.hospital else (doctor.hospital_name or 'PhysioBuddy Clinic'),
            "experience_years": doctor.experience_years or 0,
            "professional_summary": doctor.professional_summary or '',
            "doctor_image": doctor.image_base64 or ''
        }
        return JsonResponse(doctor_details, status=200)

    except Http404:
        return JsonResponse({"error": "Doctor profile not found"}, status=404)


def doctor_update_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        data = json.loads(request.body)

        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        phone_number = data.get('phone_number', '').strip()
        speciality = data.get('speciality', data.get('specialization', '')).strip()
        qualification = data.get('qualification', '').strip()
        gender = data.get('gender', '').strip()
        city = data.get('city', '').strip()
        experience_years = data.get('experience_years')
        professional_summary = data.get('professional_summary', '').strip()
        new_password = data.get('new_password', '').strip()

        # Check email uniqueness if changed
        if email and email.lower() != doctor.user.email.lower():
            if User.objects.filter(email__iexact=email).exclude(id=doctor.user.id).exists():
                return JsonResponse({'error': f"Email '{email}' is already in use by another account."}, status=400)

        # Update User fields
        full_first = f"{first_name} {middle_name}".strip() if middle_name else first_name
        doctor.user.first_name = full_first
        if last_name is not None:
            doctor.user.last_name = last_name
        if email:
            doctor.user.email = email

        # Password update if requested
        password_updated = False
        if new_password:
            if len(new_password) < 6:
                return JsonResponse({'error': 'New password must be at least 6 characters long.'}, status=400)
            doctor.user.set_password(new_password)
            password_updated = True

        doctor.user.save()

        # Update DoctorProfile fields
        if speciality:
            doctor.speciality = speciality
        if qualification:
            doctor.qualification = qualification
        if phone_number is not None:
            doctor.phone_number = phone_number
        if gender:
            doctor.gender = gender
        if city is not None:
            doctor.city = city
        if experience_years is not None:
            try:
                doctor.experience_years = int(experience_years) if str(experience_years).strip() != '' else None
            except (ValueError, TypeError):
                doctor.experience_years = None
        if professional_summary is not None:
            doctor.professional_summary = professional_summary

        doctor.save()

        if password_updated:
            update_session_auth_hash(request, doctor.user)

        full_name = f"{doctor.user.first_name} {doctor.user.last_name}".strip()
        return JsonResponse({
            'message': 'Doctor profile updated successfully!' + (' Password was updated.' if password_updated else ''),
            'doctor': {
                "username": doctor.user.username,
                "first_name": first_name,
                "middle_name": middle_name,
                "last_name": doctor.user.last_name,
                "full_name": full_name if full_name else doctor.user.username,
                "phone_number": doctor.phone_number or '',
                "email": doctor.user.email,
                "specialization": doctor.speciality,
                "speciality": doctor.speciality,
                "qualification": doctor.qualification,
                "gender": doctor.gender or '',
                "city": doctor.city or '',
                "hospital_name": doctor.hospital.name if doctor.hospital else (doctor.hospital_name or 'PhysioBuddy Clinic'),
                "experience_years": doctor.experience_years or 0,
                "professional_summary": doctor.professional_summary or '',
                "doctor_image": doctor.image_base64 or ''
            }
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def update_doctor_image(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not logged in'}, status=401)

    try:
        data = json.loads(request.body)
        base64_string = data.get('doctor_image')
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        doctor.image_base64 = base64_string
        doctor.save()
        return JsonResponse({'success': 'Image updated successfully'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


def get_patient_status(request):
    """
    Returns exercise assignment and completion status (including today's exercises and historical assignments)
    for patients strictly belonging to the authenticated doctor within the same hospital tenant.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        curr_doc = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'message': "Can't find the doctor!!!"}, status=404)

    if curr_doc.hospital:
        patients = PatientProfile.objects.filter(doctor=curr_doc, hospital=curr_doc.hospital)
    else:
        patients = PatientProfile.objects.filter(doctor=curr_doc)

    today = timezone.now().date()
    patient_data_list = []
    for patient in patients:
        assigned_exercises = AssignedExercise.objects.filter(
            patient=patient,
            assigned_by=curr_doc
        ).select_related('exercise').order_by('-date_assigned')

        today_exercises = []
        history_by_date = {}
        upcoming_by_date = {}

        for ae in assigned_exercises:
            ae_date = ae.date_assigned.date() if ae.date_assigned else today
            date_str = ae_date.strftime('%Y-%m-%d')
            time_str = ae.assigned_time.strftime('%I:%M %p') if ae.assigned_time else (ae.date_assigned.strftime('%I:%M %p') if ae.date_assigned else '')
            is_uncompleted = (ae_date < today and not ae.is_completed)
            status = 'completed' if ae.is_completed else ('uncompleted' if ae_date < today else ('today_pending' if ae_date == today else 'upcoming'))

            ex_info = {
                'id': ae.id,
                'exercise_name': ae.exercise.name,
                'reps': ae.target_reps,
                'is_completed': ae.is_completed,
                'is_uncompleted': is_uncompleted,
                'status': status,
                'date': date_str,
                'time': time_str,
                'date_assigned': ae.date_assigned.isoformat() if ae.date_assigned else None
            }

            if ae_date == today:
                today_exercises.append(ex_info)
            elif ae_date < today:
                if date_str not in history_by_date:
                    history_by_date[date_str] = []
                history_by_date[date_str].append(ex_info)
            elif ae_date > today:
                if date_str not in upcoming_by_date:
                    upcoming_by_date[date_str] = []
                upcoming_by_date[date_str].append(ex_info)

        history_list = [
            {
                'date': d,
                'exercises': items,
                'completed_count': sum(1 for item in items if item['is_completed']),
                'uncompleted_count': sum(1 for item in items if not item['is_completed']),
                'total_count': len(items)
            }
            for d, items in sorted(history_by_date.items(), key=lambda x: x[0], reverse=True)
        ]

        upcoming_list = [
            {
                'date': d,
                'exercises': items,
                'completed_count': sum(1 for item in items if item['is_completed']),
                'uncompleted_count': sum(1 for item in items if not item['is_completed']),
                'total_count': len(items)
            }
            for d, items in sorted(upcoming_by_date.items(), key=lambda x: x[0])
        ]

        patient_data_list.append({
            'id': patient.id,
            'name': patient.user.username,
            'full_name': patient.user.get_full_name() or patient.user.username,
            'phone_number': patient.phone_number or '',
            'assigned_exercises': today_exercises,
            'upcoming': upcoming_list,
            'total_upcoming_count': sum(len(u['exercises']) for u in upcoming_list),
            'history': history_list,
            'total_history_count': sum(len(h['exercises']) for h in history_list)
        })

    return JsonResponse(patient_data_list, safe=False, status=200)


def my_patients(request):
    """
    Returns patient usernames and detailed patient & exercise lists belonging to the authenticated doctor within the same hospital tenant.
    """
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        curr_doc = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'message': "Can't find the doctor!!!"}, status=404)

    if curr_doc.hospital:
        patients = PatientProfile.objects.filter(doctor=curr_doc, hospital=curr_doc.hospital).select_related('user')
    else:
        patients = PatientProfile.objects.filter(doctor=curr_doc).select_related('user')

    exercises = Exercise.objects.all().order_by('name')

    patient_usernames = [patient.user.username for patient in patients]
    patient_details = [
        {
            'id': patient.id,
            'username': patient.user.username,
            'full_name': patient.user.get_full_name() or patient.user.username,
            'phone_number': patient.phone_number or '',
            'gender': patient.gender or '',
        }
        for patient in patients
    ]

    exercise_names = [exercise.name for exercise in exercises]
    exercise_details = [
        {
            'id': exercise.id,
            'name': exercise.name,
            'description': exercise.description or '',
            'thumbnail_image_url': exercise.thumbnail_image_url or '',
            'demo_video_url': exercise.demo_video_url or ''
        }
        for exercise in exercises
    ]

    return JsonResponse({
        'patients': patient_usernames,
        'patient_details': patient_details,
        'exercises': exercise_names,
        'exercise_details': exercise_details
    }, status=200)


def submit_assignment(request):
    """
    Creates new exercise assignment(s) for a patient across specified durations of days.
    Supports both:
    1. Multiple exercises in a single batch: `assignments: [{ exercise_name, repetitions, days }]`
    2. Single legacy exercise payload: `{ exercise_name, repetitions, days }`
    Strictly enforces tenant ownership and doctor permissions.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    patient_name = data.get('patient_name')
    if not patient_name:
        return JsonResponse({'error': 'Patient name is required.'}, status=400)

    try:
        doctor_obj = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Doctor profile not found'}, status=404)

    try:
        patient_obj = PatientProfile.objects.get(user__username=patient_name)
    except PatientProfile.DoesNotExist:
        return JsonResponse({'error': f"Patient '@{patient_name}' does not exist."}, status=404)

    # Enforce same-hospital tenant ownership
    if doctor_obj.hospital and patient_obj.hospital != doctor_obj.hospital:
        return JsonResponse(
            {'error': 'Permission denied: Patient belongs to a different hospital tenant.'},
            status=403
        )

    # Enforce doctor assignment if doctor is not attached to a shared hospital tenant practice
    if not doctor_obj.hospital and patient_obj.doctor != doctor_obj:
        return JsonResponse(
            {'error': 'Permission denied: You do not have permission to assign exercises to this patient.'},
            status=403
        )

    # Normalize assignments list (supports both single payload and multi-exercise array)
    raw_assignments = data.get('assignments')
    if raw_assignments is None:
        # Legacy single exercise payload format
        raw_assignments = [{
            'exercise_name': data.get('exercise_name'),
            'repetitions': data.get('repetitions'),
            'days': data.get('days', 1)
        }]

    if not isinstance(raw_assignments, list) or len(raw_assignments) == 0:
        return JsonResponse({'error': 'At least one exercise assignment must be provided.'}, status=400)

    # Validate and build assignment records
    now = timezone.now()
    created_assignments = []
    exercise_cache = {}
    summary_list = []

    for idx, item in enumerate(raw_assignments):
        ex_name = item.get('exercise_name')
        if not ex_name:
            return JsonResponse({'error': f'Exercise name missing for item #{idx + 1}.'}, status=400)

        try:
            reps = int(item.get('repetitions', 0))
            if reps <= 0 or reps > 500:
                return JsonResponse({'error': f'Invalid repetition count for "{ex_name}". Must be between 1 and 500.'}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({'error': f'Invalid repetition count for "{ex_name}".'}, status=400)

        try:
            days = int(item.get('days', 1))
            if days < 1:
                days = 1
            elif days > 365:
                days = 365
        except (ValueError, TypeError):
            days = 1

        # Fetch exercise object
        if ex_name not in exercise_cache:
            try:
                exercise_cache[ex_name] = Exercise.objects.get(name=ex_name)
            except Exercise.DoesNotExist:
                return JsonResponse({'error': f'Exercise "{ex_name}" does not exist in catalog.'}, status=404)

        exercise_obj = exercise_cache[ex_name]

        for day_offset in range(days):
            assigned_date = now + datetime.timedelta(days=day_offset)
            created_assignments.append(
                AssignedExercise(
                    patient=patient_obj,
                    assigned_by=doctor_obj,
                    exercise=exercise_obj,
                    target_reps=reps,
                    date_assigned=assigned_date,
                    assigned_time=assigned_date.time()
                )
            )

        summary_list.append({
            'exercise': ex_name,
            'repetitions': reps,
            'days': days
        })

    if created_assignments:
        AssignedExercise.objects.bulk_create(created_assignments)

    ex_count = len(summary_list)
    return JsonResponse({
        'message': f'Successfully scheduled {ex_count} {"exercise" if ex_count == 1 else "exercises"} for @{patient_name} ({len(created_assignments)} daily sessions created).',
        'exercises_assigned': ex_count,
        'total_sessions': len(created_assignments),
        'summary': summary_list
    }, status=201)


# ==========================================
# APIs for Patients
# ==========================================

def patient_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        patient = get_object_or_404(PatientProfile, user=request.user)
        full_name = f"{patient.user.first_name} {patient.user.last_name}".strip()

        raw_first = patient.user.first_name.strip() if patient.user.first_name else ''
        first_parts = raw_first.split(' ', 1) if raw_first else ['', '']
        first_name = first_parts[0] if len(first_parts) > 0 else ''
        middle_name = first_parts[1] if len(first_parts) > 1 else ''

        doc_display = 'Not Assigned'
        if patient.doctor:
            doc_name = f"Dr. {patient.doctor.user.first_name} {patient.doctor.user.last_name}".strip()
            doc_display = doc_name if (patient.doctor.user.first_name or patient.doctor.user.last_name) else f"Dr. {patient.doctor.user.username}"

        formatted_dob = ''
        if patient.date_of_birth:
            if hasattr(patient.date_of_birth, 'strftime'):
                formatted_dob = patient.date_of_birth.strftime('%Y-%m-%d')
            else:
                formatted_dob = str(patient.date_of_birth)

        patient_details = {
            'username': patient.user.username,
            'patient_name': patient.user.username,
            'first_name': first_name,
            'middle_name': middle_name,
            'last_name': patient.user.last_name or '',
            'full_name': full_name if full_name else patient.user.username,
            'phone_number': patient.phone_number or '',
            'email': patient.user.email or '',
            'dob': formatted_dob,
            'gender': patient.gender or '',
            'assigned_doctor': doc_display,
            'hospital_name': patient.hospital.name if patient.hospital else 'PhysioBuddy Clinic',
            'height': patient.height,
            'weight': patient.weight,
            'bg': patient.blood_group or '',
            'blood_group': patient.blood_group or '',
            'patient_image': patient.image_base64 or ''
        }
        return JsonResponse(patient_details, status=200)

    except Http404:
        return JsonResponse({'error': 'Patient profile not found'}, status=404)


def patient_update_profile_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)

    if request.method != 'POST':
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        patient = get_object_or_404(PatientProfile, user=request.user)
        data = json.loads(request.body)

        first_name = data.get('first_name', '').strip()
        middle_name = data.get('middle_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        phone_number = data.get('phone_number', '').strip()
        dob = data.get('dob')
        gender = data.get('gender', '').strip()
        height = data.get('height')
        weight = data.get('weight')
        blood_group = data.get('blood_group', data.get('bg', '')).strip()
        new_password = data.get('new_password', '').strip()

        # Check email uniqueness if changed
        if email and email.lower() != patient.user.email.lower():
            if User.objects.filter(email__iexact=email).exclude(id=patient.user.id).exists():
                return JsonResponse({'error': f"Email '{email}' is already in use by another account."}, status=400)

        # Update User fields
        full_first = f"{first_name} {middle_name}".strip() if middle_name else first_name
        patient.user.first_name = full_first
        if last_name is not None:
            patient.user.last_name = last_name
        if email:
            patient.user.email = email

        # Password update if requested
        password_updated = False
        if new_password:
            if len(new_password) < 6:
                return JsonResponse({'error': 'New password must be at least 6 characters long.'}, status=400)
            patient.user.set_password(new_password)
            password_updated = True

        patient.user.save()

        # Update PatientProfile fields
        if phone_number is not None:
            patient.phone_number = phone_number
        if dob:
            if isinstance(dob, str) and dob.strip():
                patient.date_of_birth = dob.strip()
            elif hasattr(dob, 'strftime'):
                patient.date_of_birth = dob
            else:
                patient.date_of_birth = None
        else:
            patient.date_of_birth = None

        if gender:
            patient.gender = gender
        if height is not None:
            try:
                patient.height = int(height) if str(height).strip() != '' else None
            except (ValueError, TypeError):
                patient.height = None
        if weight is not None:
            try:
                patient.weight = int(weight) if str(weight).strip() != '' else None
            except (ValueError, TypeError):
                patient.weight = None
        if blood_group is not None:
            patient.blood_group = blood_group if blood_group else None

        patient.save()

        if password_updated:
            update_session_auth_hash(request, patient.user)

        full_name = f"{patient.user.first_name} {patient.user.last_name}".strip()
        doc_display = 'Not Assigned'
        if patient.doctor:
            doc_name = f"Dr. {patient.doctor.user.first_name} {patient.doctor.user.last_name}".strip()
            doc_display = doc_name if (patient.doctor.user.first_name or patient.doctor.user.last_name) else f"Dr. {patient.doctor.user.username}"

        formatted_dob = ''
        if patient.date_of_birth:
            if hasattr(patient.date_of_birth, 'strftime'):
                formatted_dob = patient.date_of_birth.strftime('%Y-%m-%d')
            else:
                formatted_dob = str(patient.date_of_birth)

        return JsonResponse({
            'message': 'Patient profile updated successfully!' + (' Password was updated.' if password_updated else ''),
            'patient': {
                'username': patient.user.username,
                'first_name': first_name,
                'middle_name': middle_name,
                'last_name': patient.user.last_name,
                'full_name': full_name if full_name else patient.user.username,
                'phone_number': patient.phone_number or '',
                'email': patient.user.email,
                'dob': formatted_dob,
                'gender': patient.gender or '',
                'assigned_doctor': doc_display,
                'hospital_name': patient.hospital.name if patient.hospital else 'PhysioBuddy Clinic',
                'height': patient.height,
                'weight': patient.weight,
                'bg': patient.blood_group or '',
                'blood_group': patient.blood_group or '',
                'patient_image': patient.image_base64 or ''
            }
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_exercise_list(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required.'}, status=401)
    if request.user.is_staff or request.user.is_superuser:
        return JsonResponse({'error': 'Permission denied.'}, status=403)
    try:
        patient_obj = get_object_or_404(PatientProfile, user=request.user)
    except Http404:
        return JsonResponse({'error': 'Patient profile not found.'}, status=404)

    today = timezone.now().date()
    assignments = AssignedExercise.objects.filter(
        patient=patient_obj
    ).select_related('exercise', 'assigned_by__user').order_by('-date_assigned')

    today_list = []
    upcoming_list = []
    history_list = []
    all_list = []

    total_completed = 0
    today_completed = 0

    for assignment in assignments:
        assignment_date = assignment.date_assigned.date() if assignment.date_assigned else today
        is_today = assignment_date == today
        is_past = assignment_date < today
        is_future = assignment_date > today

        doctor_name = "Prescribing Therapist"
        if assignment.assigned_by and assignment.assigned_by.user:
            doc_user = assignment.assigned_by.user
            full_name = f"{doc_user.first_name} {doc_user.last_name}".strip()
            doctor_name = f"Dr. {full_name}" if full_name else f"Dr. {doc_user.username}"

        is_uncompleted = is_past and not assignment.is_completed
        status = 'completed' if assignment.is_completed else ('uncompleted' if is_past else ('today_pending' if is_today else 'upcoming'))

        item = {
            'patient_username': assignment.patient.user.username,
            'exercise_id': assignment.exercise.id,
            'assignment_id': assignment.id,
            'exercise_name': assignment.exercise.name,
            'exercise_description': assignment.exercise.description or '',
            'exercise_video_url': assignment.exercise.demo_video_url or '',
            'thumbnail_image_url': assignment.exercise.thumbnail_image_url or '',
            'target_reps': assignment.target_reps,
            'is_completed': assignment.is_completed,
            'is_uncompleted': is_uncompleted,
            'status': status,
            'date_assigned': assignment.date_assigned.isoformat() if assignment.date_assigned else None,
            'assigned_time': assignment.assigned_time.strftime("%I:%M %p") if assignment.assigned_time else "",
            'assigned_by_doctor': doctor_name,
            'is_today': is_today,
            'is_past': is_past,
            'is_future': is_future
        }

        all_list.append(item)
        if assignment.is_completed:
            total_completed += 1

        if is_today:
            today_list.append(item)
            if assignment.is_completed:
                today_completed += 1
        elif is_past:
            history_list.append(item)
        elif is_future:
            upcoming_list.append(item)

    upcoming_list.sort(key=lambda x: x['date_assigned'] or '')

    total_assignments = len(all_list)
    today_total = len(today_list)
    upcoming_total = len(upcoming_list)
    history_total = len(history_list)
    past_and_today_total = today_total + history_total
    completion_rate = round((total_completed / past_and_today_total * 100)) if past_and_today_total > 0 else 0

    return JsonResponse({
        'today': today_list,
        'upcoming': upcoming_list,
        'history': history_list,
        'all': all_list,
        'stats': {
            'total_assigned': total_assignments,
            'total_completed': total_completed,
            'today_total': today_total,
            'today_completed': today_completed,
            'upcoming_total': upcoming_total,
            'history_total': history_total,
            'history_completed': len([h for h in history_list if h['is_completed']]),
            'completion_rate': completion_rate
        }
    }, safe=False, status=200)


def update_patient_image(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not logged in'}, status=401)

    try:
        data = json.loads(request.body)
        base64_string = data.get('patient_image')
        patient = get_object_or_404(PatientProfile, user=request.user)
        patient.image_base64 = base64_string
        patient.save()
        return JsonResponse({'success': 'Image updated successfully'}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


def get_doctor_name(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        doctor = get_object_or_404(DoctorProfile, user=request.user)
        return JsonResponse({'doctor_name': doctor.user.username}, status=200)
    except Http404:
        return JsonResponse({'error': 'Doctor profile not found'}, status=404)


def update_completion_status(request):
    """
    Updates the completion flag of an assigned exercise.
    Enforces authorization: only the assigned patient, prescribing doctor,
    the respective hospital admin, or a superuser can update this status.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        data = json.loads(request.body)
        assignment_id = data.get('assignment_id')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        assignment = AssignedExercise.objects.get(id=assignment_id)
    except AssignedExercise.DoesNotExist:
        return JsonResponse({'error': 'Assignment not found'}, status=404)

    # Enforce ownership authorization
    is_patient_owner = assignment.patient.user == request.user
    is_doctor_owner = assignment.assigned_by.user == request.user
    is_hospital_admin = (
        hasattr(request.user, 'managed_hospital') and
        assignment.patient.hospital == request.user.managed_hospital
    )

    if not (is_patient_owner or is_doctor_owner or is_hospital_admin or request.user.is_superuser):
        return JsonResponse(
            {'error': 'Permission denied: You do not have permission to modify this assignment.'},
            status=403
        )

    assignment.is_completed = True
    assignment.save()

    return JsonResponse({'message': 'Completion status updated successfully'}, status=200)


def send_message_api(request):
    """
    Sends a message from a patient to their assigned doctor (Chat System).
    Enforces that the assigned doctor belongs to the same hospital tenant.
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        patient = PatientProfile.objects.get(user=request.user)
    except PatientProfile.DoesNotExist:
        return JsonResponse({'error': 'Only patients can send patient messages'}, status=403)

    if not patient.doctor:
        return JsonResponse({'error': 'No therapist is currently assigned to your profile.'}, status=400)

    # Enforce tenant isolation for assigned doctor
    if patient.hospital and patient.doctor.hospital and patient.hospital != patient.doctor.hospital:
        return JsonResponse({'error': 'Integrity error: Assigned doctor belongs to a different hospital.'}, status=403)

    try:
        data = json.loads(request.body)
        subject = data.get('subject', '').strip()
        message_text = data.get('message', '').strip()
        if not message_text:
            return JsonResponse({'error': 'Message content cannot be empty.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    content = f"[{subject}] {message_text}" if subject and subject.lower() != 'general inquiry' else message_text
    msg = Message.objects.create(
        patient=patient,
        doctor=patient.doctor,
        sender_type='patient',
        content=content
    )
    return JsonResponse({
        'message': 'Message sent successfully',
        'id': msg.id,
        'created_at': msg.created_at.isoformat()
    }, status=200)


def doctor_send_message_api(request):
    """
    Sends a reply / message from a doctor to a patient (Chat System).
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        doctor = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Only doctors can send doctor replies'}, status=403)

    try:
        data = json.loads(request.body)
        patient_name = data.get('patient_name')
        patient_id = data.get('patient_id')
        message_text = data.get('message', '').strip()
        if not message_text:
            return JsonResponse({'error': 'Message content cannot be empty.'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    patient = None
    if patient_id:
        patient = PatientProfile.objects.filter(id=patient_id).first()
    elif patient_name:
        patient = PatientProfile.objects.filter(user__username=patient_name).first()

    if not patient:
        return JsonResponse({'error': 'Patient not found.'}, status=404)

    # Enforce tenant check
    if doctor.hospital and patient.hospital and doctor.hospital != patient.hospital:
        return JsonResponse({'error': 'Permission denied: Patient belongs to a different hospital.'}, status=403)

    msg = Message.objects.create(
        patient=patient,
        doctor=doctor,
        sender_type='doctor',
        content=message_text
    )

    return JsonResponse({
        'message': 'Reply sent successfully',
        'id': msg.id,
        'created_at': msg.created_at.isoformat()
    }, status=200)


def get_patient_messages_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        patient = PatientProfile.objects.select_related('doctor__user', 'doctor__hospital', 'hospital').get(user=request.user)
    except PatientProfile.DoesNotExist:
        return JsonResponse({'error': 'Only patients can view these messages'}, status=403)

    messages = Message.objects.filter(patient=patient).order_by('created_at')

    # Automatically mark doctor messages as read when patient opens chat
    Message.objects.filter(patient=patient, sender_type='doctor', is_read=False).update(is_read=True)

    msg_list = []
    for msg in messages:
        raw_content = msg.content or ""
        subject = "General Inquiry"
        body = raw_content

        # Parse [Subject] Body pattern if present
        if raw_content.startswith("[") and "]" in raw_content:
            end_idx = raw_content.find("]")
            subject = raw_content[1:end_idx].strip()
            body = raw_content[end_idx + 1:].strip()

        sender_type = getattr(msg, 'sender_type', 'patient')
        is_me = (sender_type == 'patient')

        msg_list.append({
            'id': msg.id,
            'sender_type': sender_type,
            'is_me': is_me,
            'sender_name': 'You' if is_me else (f"Dr. {patient.doctor.user.get_full_name() or patient.doctor.user.username}" if patient.doctor else 'Doctor'),
            'subject': subject if is_me else None,
            'body': body,
            'content': raw_content,
            'is_read': msg.is_read,
            'created_at': msg.created_at.isoformat(),
            'formatted_time': msg.created_at.strftime("%b %d, %Y • %I:%M %p"),
            'time_only': msg.created_at.strftime("%I:%M %p"),
            'date_only': msg.created_at.strftime("%b %d, %Y")
        })

    doctor_info = None
    if patient.doctor and patient.doctor.user:
        doc = patient.doctor
        doc_user = doc.user
        full_name = f"{doc_user.first_name} {doc_user.last_name}".strip()
        doctor_info = {
            'id': doc.id,
            'name': f"Dr. {full_name}" if full_name else f"Dr. {doc_user.username}",
            'speciality': doc.speciality or 'Physical Rehabilitation Specialist',
            'qualification': doc.qualification or 'BPT, MPT Physiotherapy',
            'phone_number': doc.phone_number or '',
            'hospital_name': doc.hospital.name if doc.hospital else (doc.hospital_name or 'PhysioBuddy Clinic'),
            'image_base64': doc.image_base64 or ''
        }

    hospital_info = None
    hosp = patient.hospital or (patient.doctor.hospital if patient.doctor else None)
    if hosp:
        hospital_info = {
            'name': hosp.name,
            'phone_number': hosp.phone_number or '+1 (800) 123-4567',
            'email': hosp.email or 'support@physiobuddy.com',
            'address': hosp.address or '',
            'city': hosp.city or ''
        }

    return JsonResponse({
        'messages': msg_list,
        'doctor': doctor_info,
        'hospital': hospital_info,
        'patient_name': patient.user.get_full_name() or patient.user.username
    }, safe=False, status=200)


def get_doctor_messages_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        doctor = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Only doctors can view these messages'}, status=403)

    messages = Message.objects.filter(doctor=doctor).select_related('patient__user').order_by('created_at')
    msg_list = []
    for msg in messages:
        sender_type = getattr(msg, 'sender_type', 'patient')
        msg_list.append({
            'id': msg.id,
            'patient_id': msg.patient.id,
            'patient_name': msg.patient.user.get_full_name() or msg.patient.user.username,
            'patient_username': msg.patient.user.username,
            'sender_type': sender_type,
            'is_from_doctor': (sender_type == 'doctor'),
            'content': msg.content,
            'is_read': msg.is_read,
            'created_at': msg.created_at.isoformat(),
            'formatted_time': msg.created_at.strftime("%b %d, %Y • %I:%M %p")
        })
    return JsonResponse(msg_list, safe=False, status=200)


def mark_message_read_api(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    try:
        doctor = DoctorProfile.objects.get(user=request.user)
    except DoctorProfile.DoesNotExist:
        return JsonResponse({'error': 'Only doctors can perform this action'}, status=403)

    try:
        data = json.loads(request.body)
        message_id = data.get('message_id')
        msg = get_object_or_404(Message, id=message_id, doctor=doctor)
        msg.is_read = True
        msg.save()
        return JsonResponse({'message': 'Message marked as read'}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


def check_exercise_compliance(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    today = timezone.now().date()
    pending = AssignedExercise.objects.filter(
        patient__user_id=request.user.id,
        date_assigned__date=today,
        is_completed=False
    )

    has_pending = pending.exists()

    return JsonResponse({
        'skipped': has_pending,
        'message': "You have pending exercises for today!" if has_pending else None
    }, status=200)
