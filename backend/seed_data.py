import os
import django
import random
from faker import Faker

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'physioapp.settings')
django.setup()

from django.contrib.auth.models import User
from physioapp.models import DoctorProfile, PatientProfile, Exercise, AssignedExercise

fake = Faker('en_IN')  # Indian locale for realistic data

def populate():
    print("Clearing old data and starting population...")
    AssignedExercise.objects.all().delete()
    PatientProfile.objects.all().delete()
    DoctorProfile.objects.all().delete()
    Exercise.objects.all().delete()
    User.objects.all().delete()

    # 2. Create Core Exercises
    print("Creating core exercises...")
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
            thumbnail_image_url=ex_data["thumbnail_image_url"]
        )
        exercises.append(ex)

    # 3. Create Doctors
    print("Creating doctors...")
    specialities = ['Orthopedic', 'General Physio', 'Sports Specialist', 'Neurological Physio']
    doctors = []
    
    for i in range(1, 6):
        username = f"doctor{i}"
        email = f"doctor{i}@example.com"
        user = User.objects.create_user(username=username, email=email, password='password123')
        user.is_staff = True
        user.save()
        
        doc = DoctorProfile.objects.create(
            user=user,
            qualification="BPT, MPT",
            speciality=random.choice(specialities),
            phone_number=fake.phone_number(),
            gender=random.choice(['male', 'female']),
            city=fake.city(),
            hospital_name=fake.company(),
            experience_years=random.randint(2, 20),
            professional_summary=fake.text(max_nb_chars=200)
        )
        doctors.append(doc)

    # 4. Create Patients
    print("Creating patients...")
    for i in range(1, 16):
        username = f"patient{i}"
        email = f"patient{i}@example.com"
        user = User.objects.create_user(username=username, email=email, password='password123')
        
        PatientProfile.objects.create(
            user=user,
            date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=80),
            gender=random.choice(['male', 'female']),
            height=random.randint(150, 190),
            weight=random.randint(45, 100),
            blood_group=random.choice(['A+', 'B+', 'O+', 'AB+']),
            phone_number=fake.phone_number(),
            doctor=random.choice(doctors) # Assign to one of the doctors created above
        )
            
    print(f"Database populated successfully with {len(exercises)} Exercises, {len(doctors)} Doctors, and 15 Patients!")

if __name__ == "__main__":
    populate()