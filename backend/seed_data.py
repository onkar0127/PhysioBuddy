import os
import django
import random
from faker import Faker

# 1. Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'physioapp.settings')
django.setup()

from django.contrib.auth.models import User
from physioapp.models import DoctorProfile, PatientProfile, Exercise

fake = Faker('en_IN')  # Indian locale for realistic data

def populate():
    print("Clearing old data and starting population...")
    # Optional: Clear existing data if you want a fresh start
    # AssignedExercise.objects.all().delete()
    # PatientProfile.objects.all().delete()
    # DoctorProfile.objects.all().delete()
    # User.objects.filter(is_superuser=False).delete()

    # 2. Create Doctors
    specialities = ['Orthopedic', 'General Physio', 'Sports Specialist', 'Neurological Physio']
    doctors = []
    
    for i in range(5):
        username = f"doc_{i}_{fake.user_name()}"
        user = User.objects.create_user(username=username, password='password123')
        
        doc = DoctorProfile.objects.create(
            user=user,
            qualification="BPT, MPT",
            speciality=random.choice(specialities),
            phone_number=fake.phone_number(),
            city=fake.city(),
            hospital_name=fake.company(),
            experience_years=random.randint(2, 20),
            professional_summary=fake.text(max_nb_chars=200)
        )
        doctors.append(doc)

    # 3. Create Patients
    for i in range(15):
        username = f"pat_{i}_{fake.user_name()}"
        user = User.objects.create_user(username=username, password='password123')
        
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
            
    print("Database populated successfully with 5 Doctors and 15 Patients!")

if __name__ == "__main__":
    populate()