import React, { useState, useEffect, useRef } from 'react';
import './PatientsList.css';

export default function P_PatientProfile() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch patient data from backend
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/patient/profile/', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch patient data');
        const data = await response.json();
        setPatient({
          name: data.patient_name,
          phone_number: data.phone_number,
          email: data.email,
          dob: data.dob || 'N/A',
          gender: data.gender || 'N/A',
          assigned_doctor: data.assigned_doctor || 'N/A',
          height: data.height || 'N/A',
          weight: data.weight || 'N/A',
          blood_group: data.bg || 'N/A',
          patient_image: data.patient_image || null,
        });
        setError(null);
      } catch (err) {
        setError('Could not load patient profile. Please try again later.');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  // Handle file selection and Base64 conversion
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => uploadImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Send Base64 string to Django
  const uploadImage = async (base64String) => {
    setIsUploading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/update-image/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_image: base64String }),
      });
      if (!response.ok) throw new Error('Failed to save image');
      setPatient((prev) => ({ ...prev, patient_image: base64String }));
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob || dob === 'N/A') return 'N/A';
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return dob;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return `${age} years`;
  };

  // Format date nicely
  const formatDate = (dob) => {
    if (!dob || dob === 'N/A') return 'N/A';
    const date = new Date(dob);
    if (isNaN(date)) return dob;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // BMI calculation
  const getBMI = () => {
    if (!patient || patient.height === 'N/A' || patient.weight === 'N/A') return null;
    const heightM = parseFloat(patient.height) / 100;
    const weightKg = parseFloat(patient.weight);
    if (!heightM || !weightKg) return null;
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);
    let label = '';
    let colorClass = '';
    if (bmi < 18.5)    { label = 'Underweight'; colorClass = theme === 'dark' ? 'text-blue-dark'   : 'text-blue-light'; }
    else if (bmi < 25) { label = 'Normal';       colorClass = theme === 'dark' ? 'text-green-dark'  : 'text-green-light'; }
    else if (bmi < 30) { label = 'Overweight';   colorClass = theme === 'dark' ? 'text-yellow-dark' : 'text-yellow-light'; }
    else               { label = 'Obese';         colorClass = theme === 'dark' ? 'text-red-dark'    : 'text-red-light'; }
    return { bmi, label, colorClass };
  };

  const t = theme;

  // --- Loading Screen ---
  if (loading) {
    return (
      <div className={`main-container ${t}`}>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <div className="loading-screen">
          <div className="loading-inner">
            <div className="spinner"></div>
            <p className="loading-text">Loading patient profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Error Screen ---
  if (error) {
    return (
      <div className="error-screen">
        <p className={`error-text ${t}`}>{error}</p>
      </div>
    );
  }

  const bmiData = getBMI();

  return (
    <>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

      <div className={`main-container ${t}`}>

        {/* --- Navbar --- */}
        <nav className={`navbar ${t}`}>
          <div className="navbar-inner">
            <img src="src/assets/pb.png" alt="Logo" className="navbar-logo" />

            <div className="navbar-links">
              <a href="/home" className={`navbar-home-link ${t}`}>Home</a>

              <button onClick={toggleTheme} className={`theme-toggle-btn ${t}`}>
                {t === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem', color: '#4b5563' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem', color: '#facc15' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* --- Main Content --- */}
        <main className="main-content">
          <div className="content-grid">

            {/* --- Left Sidebar --- */}
            <div className={`sidebar card ${t}`}>
              <div className="sidebar-inner">

                <div className={`avatar-wrapper ${t}`}>
                  <img
                    src={patient?.patient_image || 'https://placehold.co/128x128/4F46E5/ffffff?text=Patient'}
                    alt="Patient"
                    className="avatar-img"
                  />
                </div>

                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  className={`change-photo-btn ${isUploading ? 'uploading' : 'active'}`}
                >
                  {isUploading ? 'Uploading...' : 'Change Photo'}
                </button>

                <h2 className={`patient-name ${t}`}>
                  {patient?.name || 'Patient Name'}
                </h2>

                <div className="sidebar-list">
                  {[
                    { label: 'Email',         value: patient?.email },
                    { label: 'Phone',         value: patient?.phone_number },
                    { label: 'Gender',        value: patient?.gender },
                    { label: 'Date of Birth', value: formatDate(patient?.dob) },
                  ].map(({ label, value }) => (
                    <div key={label} className={`list-item ${t}`}>
                      <div className="list-item-inner">
                        <span className="list-item-label">{label}:</span>
                        <span className="list-item-value">{value || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* --- Right Panel --- */}
            <div className={`right-panel card ${t}`}>
              <h1 className="profile-title">Patient Profile</h1>

              {/* Assigned Doctor Banner */}
              <div className={`doctor-banner ${t}`}>
                <div className={`doctor-banner-icon-wrap ${t}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon-indigo" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="doctor-banner-label">Assigned Doctor</p>
                  <p className={`doctor-banner-name ${t}`}>Dr. {patient?.assigned_doctor || 'N/A'}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">

                {/* Blood Group */}
                <div className={`stat-card ${t === 'dark' ? 'dark' : 'light-red'}`}>
                  <div className="stat-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-red" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="stat-card-title">Blood Group</h3>
                  </div>
                  <p className={`stat-card-value blood-group ${t === 'dark' ? 'text-red-dark' : 'text-red-light'}`}>
                    {patient?.blood_group || 'N/A'}
                  </p>
                </div>

                {/* Age */}
                <div className={`stat-card ${t === 'dark' ? 'dark' : 'light-blue'}`}>
                  <div className="stat-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-blue" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="stat-card-title">Age</h3>
                  </div>
                  <p className={`stat-card-value ${t}`}>{calculateAge(patient?.dob)}</p>
                </div>

                {/* Height */}
                <div className={`stat-card ${t === 'dark' ? 'dark' : 'light-green'}`}>
                  <div className="stat-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-green" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <h3 className="stat-card-title">Height</h3>
                  </div>
                  <p className={`stat-card-value ${t}`}>
                    {patient?.height !== 'N/A' ? `${patient?.height} cm` : 'N/A'}
                  </p>
                </div>

                {/* Weight */}
                <div className={`stat-card ${t === 'dark' ? 'dark' : 'light-purple'}`}>
                  <div className="stat-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-purple" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                    <h3 className="stat-card-title">Weight</h3>
                  </div>
                  <p className={`stat-card-value ${t}`}>
                    {patient?.weight !== 'N/A' ? `${patient?.weight} kg` : 'N/A'}
                  </p>
                </div>

              </div>

              {/* BMI Card */}
              {bmiData && (
                <div className={`stat-card ${t === 'dark' ? 'dark' : 'light-orange'}`} style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-card-header">
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon-orange" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="stat-card-title">BMI (Body Mass Index)</h3>
                  </div>
                  <p className={`bmi-value ${bmiData.colorClass}`}>{bmiData.bmi}</p>
                  <p className={`bmi-label ${bmiData.colorClass}`}>{bmiData.label}</p>
                </div>
              )}

              {/* Additional Information */}
              <div className={`info-box ${t}`}>
                <h3 className="info-box-title">Additional Information</h3>
                <div className={`info-section ${t}`}>
                  <div>
                    <p className="info-item-label">Health Notes:</p>
                    <p className="info-item-text">Ensure regular check-ups with your assigned doctor. Keep your medical records up to date for better care.</p>
                  </div>
                  <div>
                    <p className="info-item-label">Consultation Hours:</p>
                    <p className="info-item-text">Your doctor is available Monday through Friday, 9:00 AM to 5:00 PM. Contact the clinic for emergency consultations.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>

      </div>
    </>
  );
}