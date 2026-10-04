import os
import sys
import django
import random
from faker import Faker

if sys.platform.startswith('win'):
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'physioapp.settings')
django.setup()

from django.contrib.auth import get_user_model
from physioapp.models import Hospital, DoctorProfile, PatientProfile, Exercise, AssignedExercise, Message

User = get_user_model()
fake = Faker('en_IN')

def populate():
    print("Clearing old data and starting fresh population...")
    AssignedExercise.objects.all().delete()
    Message.objects.all().delete()
    PatientProfile.objects.all().delete()
    DoctorProfile.objects.all().delete()
    Hospital.objects.all().delete()
    Exercise.objects.all().delete()
    User.objects.all().delete()

    # 1. Create Super Admin
    print("Creating Super Admin...")
    super_admin = User.objects.create_superuser(
        username="superadmin",
        email="superadmin@physiobuddy.com",
        password="password123"
    )
    print("  -> Super Admin created: superadmin@physiobuddy.com (password123)")

    # 2. Create Hospital and Hospital Admin
    print("Creating Hospital & Hospital Admin...")
    hospital_admin_user = User.objects.create_user(
        username="hospitaladmin",
        email="hospitaladmin@physiobuddy.com",
        password="password123",
        is_staff=True,
        is_hospital_admin=True,
        is_user=True
    )

    hospital = Hospital.objects.create(
        name="CityCare Physiotherapy & Rehabilitation Center",
        admin=hospital_admin_user,
        address="Plot 42, Health City Avenue, Medical District",
        city="Mumbai",
        phone_number="+91 22 5550 1234",
        email="contact@citycarephysio.com"
    )
    print(f"  -> Hospital created: '{hospital.name}'")
    print("  -> Hospital Admin created: hospitaladmin@physiobuddy.com (password123)")

    # 3. Create Core Exercises (Created by Super Admin)
    print("Creating core exercise library...")
    exercises_data = [
        {
            "id": 1,
            "name": "Bicep Curls",
            "description": "A strength training exercise for the biceps. Keep your elbows close to your torso and curl the weights while contracting your biceps.",
            "demo_video_url": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
            "thumbnail_image_url": "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop"
        },
        {
            "id": 2,
            "name": "Quadriceps Stretches",
            "description": "Hold on to a wall or chair for balance, grab your ankle, and gently pull your heel up and back until you feel a stretch in the front of your thigh.",
            "demo_video_url": "https://www.youtube.com/watch?v=TzOlmPZ3Wpc",
            "thumbnail_image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=400&auto=format&fit=crop"
        },
        {
            "id": 3,
            "name": "Shoulder Exercises",
            "description": "Lateral raises and overhead arm movements to rehabilitate and strengthen the rotator cuff and shoulder muscles.",
            "demo_video_url": "https://www.youtube.com/watch?v=3VcKaX_yL-U",
            "thumbnail_image_url": "https://images.unsplash.com/photo-1597851065532-055f97d12e47?q=80&w=400&auto=format&fit=crop"
        },
        {
            "id": 4,
            "name": "Squats",
            "description": "Lower your hips from a standing position and then stand back up. Keep your back straight and knees behind your toes.",
            "demo_video_url": "https://www.youtube.com/watch?v=UXJrBgI2RxA",
            "thumbnail_image_url": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop"
        },
        {
            "id": 5,
            "name": "Standing Knee Lifts",
            "description": "Lift your knees one at a time towards your chest, maintaining a tall posture to strengthen hip flexors and core.",
            "demo_video_url": "https://www.youtube.com/watch?v=34wK7jWcK70",
            "thumbnail_image_url": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop"
        }
    ]

    exercises = []
    for ex_data in exercises_data:
        ex = Exercise.objects.create(
            id=ex_data["id"],
            name=ex_data["name"],
            description=ex_data["description"],
            demo_video_url=ex_data["demo_video_url"],
            thumbnail_image_url=ex_data["thumbnail_image_url"],
            created_by=super_admin
        )
        exercises.append(ex)

    # 4. Create Doctors (Linked to the Hospital)
    print("Creating doctors and linking them to hospital...")
    specialities = ['Orthopedic Physiotherapy', 'Sports Rehab Specialist', 'Neurological Physiotherapy', 'Pediatric Physio', 'Cardiopulmonary Physio']
    doctors = []

    for i in range(1, 6):
        username = f"doctor{i}"
        email = f"doctor{i}@example.com"
        user = User.objects.create_user(
            username=username,
            email=email,
            password='password123',
            is_staff=True,
            is_hospital_admin=False,
            is_user=True
        )

        summaries = [
            "Experienced orthopedic physiotherapist specializing in musculoskeletal rehabilitation, joint mobility, and post-surgical recovery.",
            "Sports rehab specialist focused on athletic injury recovery, biomechanics optimization, and return-to-play training.",
            "Dedicated neurological physiotherapist working with stroke recovery, Parkinson's disease, and balance restoration.",
            "Pediatric physiotherapist passionate about developmental motor milestones and child neuromuscular wellness.",
            "Cardiopulmonary rehab expert helping patients restore aerobic capacity and respiratory strength."
        ]
        doc = DoctorProfile.objects.create(
            user=user,
            hospital=hospital,
            hospital_name=hospital.name,
            qualification="BPT, MPT",
            speciality=specialities[i - 1],
            phone_number=fake.phone_number(),
            gender=random.choice(['male', 'female']),
            city=hospital.city,
            experience_years=random.randint(3, 18),
            professional_summary=summaries[i - 1]
        )
        doctors.append(doc)

    # 5. Create Patients (Linked to the Hospital & Assigned to Doctors)
    print("Creating patients and linking them to hospital and doctors...")
    patients = []
    for i in range(1, 16):
        username = f"patient{i}"
        email = f"patient{i}@example.com"
        user = User.objects.create_user(
            username=username,
            email=email,
            password='password123',
            is_staff=False,
            is_hospital_admin=False,
            is_user=True
        )
        assigned_doc = doctors[(i - 1) % len(doctors)]

        pat = PatientProfile.objects.create(
            user=user,
            hospital=hospital,
            doctor=assigned_doc,
            date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=75),
            gender=random.choice(['male', 'female']),
            height=random.randint(155, 188),
            weight=random.randint(50, 95),
            blood_group=random.choice(['A+', 'B+', 'O+', 'AB+']),
            phone_number=fake.phone_number()
        )
        patients.append(pat)

    # 6. Create Sample Exercise Assignments
    print("Creating sample exercise assignments...")
    for pat in patients:
        sampled_exercises = random.sample(exercises, 2)
        for ex in sampled_exercises:
            AssignedExercise.objects.create(
                patient=pat,
                exercise=ex,
                assigned_by=pat.doctor,
                target_reps=random.choice([10, 12, 15]),
                is_completed=random.choice([True, False])
            )

    print("\n=======================================================")
    print("  SEED DATA POPULATED SUCCESSFULLY!")
    print("=======================================================")
    print(f"  Hospital: {hospital.name}")
    print(f"  Doctors: {len(doctors)} (All linked to '{hospital.name}')")
    print(f"  Patients: {len(patients)} (All linked to '{hospital.name}')")
    print(f"  Exercises: {len(exercises)} (Created in Global Library)")
    print("\n  Ready Login Credentials (password for all is 'password123'):")
    print("  1. Super Admin:      superadmin@physiobuddy.com (or username 'superadmin')")
    print("  2. Hospital Admin:   hospitaladmin@physiobuddy.com (or username 'hospitaladmin')")
    print("  3. Doctor:           doctor1@example.com (or username 'doctor1')")
    print("  4. Patient:          patient1@example.com (or username 'patient1')")
    print("=======================================================\n")

if __name__ == "__main__":
    populate()
