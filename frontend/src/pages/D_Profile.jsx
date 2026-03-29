import React, { useState, useEffect, useRef } from 'react';

// Single export function
export default function P_DoctorProfile() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  }); 
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State and ref for image upload
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Use useEffect to save the current theme to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch doctor data from backend
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/doctor/profile/', {
          method: 'GET',
          credentials: 'include',
        }); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch doctor data');
        }
        const data = await response.json();
        setDoctor({
          name: data.doctor_name,
          phone_number: data.phone_number,
          email: data.email,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience_years || 'Not specified',
          bio: data.bio || 'Dedicated healthcare professional',
          doctor_image: data.doctor_image || null,
          city: data.city || 'N/A',
          gender: data.gender || 'N/A', 
          hospital_name: data.hospital_name || 'N/A', 
        });
        setError(null);
      } catch (err) {
        setError("Could not load doctor profile. Please try again later.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Handle file selection and Base64 conversion
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        uploadImage(reader.result); // Send Base64 to backend
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Base64 string to Django
  const uploadImage = async (base64String) => {
    setIsUploading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/doctor/update-image/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_image: base64String }),
      });

      if (!response.ok) throw new Error('Failed to save image');

      // Update local state to reflect the new image immediately
      setDoctor((prev) => ({ ...prev, doctor_image: base64String }));
      
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Base classes for the main container, changing based on the theme
  const mainContainerClasses = `min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`;
  const cardClasses = `shadow-lg rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`;
  const listItemClasses = `p-4 rounded-lg flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-gray-800'}`;

  // Loading Screen
  if (loading) {
    return (
      <div className={mainContainerClasses}>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4">Loading doctor profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}>
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      <style>{`body { font-family: 'Inter', sans-serif; }`}</style>

      <div className={mainContainerClasses}>

        {/* --- Navbar Section --- */}
        <nav className={`shadow-sm p-4 sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="src/assets/pb.png" alt="Logo" className="h-14 w-18 text-indigo-600" />
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <a href="/home" className={`font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Home</a>
              </div>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* --- Main Content Area --- */}
        <main className="container mx-auto flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8">

            {/* --- Left Sidebar (Doctor Details) --- */}
            <div className={`md:w-1/4 w-full h-50 sticky top-0 ${cardClasses}`}>
              <div className="flex flex-col items-center">
                
                {/* Doctor Image Circle */}
                <div className={`w-32 h-32 rounded-full overflow-hidden mb-2 border-4 shadow-md ${theme === 'dark' ? 'border-indigo-600' : 'border-indigo-200'}`}>
                  <img src={doctor?.doctor_image || "https://placehold.co/128x128/4F46E5/ffffff?text=Doctor"} alt="Doctor" className="w-full h-full object-cover" />
                </div>

                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
                <button 
                  onClick={triggerFileInput} 
                  disabled={isUploading}
                  className={`mb-4 text-sm font-medium transition duration-200 ${isUploading ? 'text-gray-500 cursor-not-allowed' : 'text-indigo-500 hover:text-indigo-400'}`}
                >
                  {isUploading ? 'Uploading...' : 'Change Photo'}
                </button>

                <h2 className={`text-2xl font-semibold text-center my-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  Dr. {doctor?.name || 'Name'}
                </h2>

                <div className="w-full space-y-4">
                  {/* City */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">City:</span>
                      <span className="font-semibold break-words">{doctor?.city || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="font-semibold break-words">{doctor?.email || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="font-semibold">{doctor?.phone_number || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Gender:</span>
                      <span className="font-semibold">{doctor?.gender || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Content Area (Scrollable) --- */}
            <div className={`flex-1 ${cardClasses} max-h-fit  sticky top-32 `}>
              <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>
              <div className={`p-6 rounded-lg border mb-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className="font-semibold text-lg mb-2">Professional Bio</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {doctor?.bio || 'Dedicated healthcare professional with extensive experience in patient care and treatment.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="font-semibold text-lg">Specialization</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.specialization || 'N/A'}</p>
                </div>

                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    <h3 className="font-semibold text-lg">Qualification</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.qualification || 'N/A'}</p>
                </div>

                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="font-semibold text-lg">Experience</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.experience || 'N/A'}</p>
                </div>

                {/* --- NEW: Hospital Name Card --- */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    {/* Swapped the envelope icon for a building icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Hospital Name</h3>
                  </div>
                  <p className={`text-sm break-words font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {doctor?.hospital_name || 'N/A'}
                  </p>
                </div>
                {/* --------------------------------- */}

              </div>

              <div className={`p-6 rounded-lg border col-span-1 md:col-span-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className="font-semibold text-lg mb-3">Additional Information</h3>
                <div className={`space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <div>
                    <p className="text-sm font-medium mb-1">Professional Summary:</p>
                    <p className="text-sm">Experienced healthcare professional dedicated to providing comprehensive medical services and patient care with a focus on excellence and innovation.</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Availability:</p>
                    <p className="text-sm">Available for consultations Monday through Friday, 9:00 AM to 5:00 PM. Emergency consultations available upon request.</p>
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