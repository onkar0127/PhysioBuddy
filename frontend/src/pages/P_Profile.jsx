import React, { useState, useEffect, useRef } from 'react'; // Added useRef

export default function P_Profile() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // New state for upload status

  const fileInputRef = useRef(null); // Reference to the hidden file input

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/patient/profile/', {
          method: 'GET',
          credentials: 'include', 
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setPatient(data);
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // --- NEW: Handle file selection and Base64 conversion ---
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      // When the file is done reading, this runs
      reader.onloadend = () => {
        const base64String = reader.result; 
        uploadImage(base64String); // Send to backend
      };
      
      // Tell the reader to convert the file to a Base64 Data URL
      reader.readAsDataURL(file);
    }
  };

  // --- NEW: Send Base64 string to Django ---
  const uploadImage = async (base64String) => {
    setIsUploading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/patient/update-image/', {
        method: 'POST', // Using POST to send data
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_image: base64String }),
      });

      if (!response.ok) throw new Error('Failed to save image');

      // Update the local state so the image changes instantly on screen!
      setPatient((prev) => ({ ...prev, patient_image: base64String }));
      
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click(); // Programmatically click the hidden input
  };

  // Base classes
  const mainContainerClasses = `min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`;
  const cardClasses = `shadow-lg rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`;
  const listItemClasses = `p-4 rounded-lg flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-gray-800'}`;

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}><p className="text-xl font-semibold">Loading profile...</p></div>;
  if (error) return <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'}`}><p className="text-xl font-semibold">{error}</p></div>;

  return (
    <>
      <div className={mainContainerClasses}>
        {/* Navbar Section */}
        <nav className={`shadow-sm p-4 sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
           {/* ... Navbar content stays exactly the same ... */}
           <div className="container mx-auto flex justify-between items-center">
             <div className="flex items-center space-x-2">
               <img src="src/assets/pb.png" alt="Logo" className="h-14 w-18 text-indigo-600" />
             </div>
             <div className="flex items-center space-x-4">
               <div className="hidden sm:block"><a href="/patient-home" className={`font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Home</a></div>
               <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                 {theme === 'light' ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                 ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                 )}
               </button>
             </div>
           </div>
        </nav>

        <main className="container mx-auto flex-1 p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">

            {/* --- Left Sidebar (Patient Details) --- */}
            <div className={`md:w-1/4 w-full h-fit ${cardClasses}`}>
              <div className="flex flex-col items-center">
                
                <div className={`w-32 h-32 rounded-full overflow-hidden mb-2 border-4 shadow-md ${theme === 'dark' ? 'border-indigo-600' : 'border-indigo-200'}`}>
                  <img src={patient?.patient_image || "https://placehold.co/128x128/999999/ffffff?text=Patient"} alt="Patient" className="w-full h-full object-cover" />
                </div>

                {/* --- NEW: Hidden file input and visible button --- */}
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
                {/* ------------------------------------------------ */}

                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  {patient?.patient_name || 'N/A'}
                </h2>
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Email: {patient?.email || 'N/A'}
                </p>

                <div className="w-full space-y-4">
                  <div className={listItemClasses}><span className="text-sm font-medium">DOB:</span><span className="font-bold">{patient?.dob || 'N/A'}</span></div>
                  <div className={listItemClasses}><span className="text-sm font-medium">Gender:</span><span className="font-bold">{patient?.gender || 'N/A'}</span></div>
                  <div className={listItemClasses}><span className="text-sm font-medium">Blood Group:</span><span className="font-bold text-right">{patient?.bg || 'N/A'}</span></div>
                  <div className={listItemClasses}><span className="text-sm font-medium">Doctor:</span><span className="font-bold text-right">Dr. {patient?.assigned_doctor || 'N/A'}</span></div>
                </div>
              </div>
            </div>

            {/* --- Right Content Area --- */}
            <div className={`flex-1 ${cardClasses}`}>
              <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This section can be used to display charts, reports, upcoming appointments, and other relevant information for the patient.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <h3 className="font-semibold text-lg mb-2">Physical Stats</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Height: {patient?.height || '-'} <br/>Weight: {patient?.weight || '-'}</p>
                </div>
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <h3 className="font-semibold text-lg mb-2">Contact Info</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone: {patient?.phone_number || '-'}</p>
                </div>
              </div>
            </div>

          </div>
        </main>

        <footer className={`text-center p-4 mt-8 shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
          &copy; Your Physio Trainer is here!! 
        </footer>
      </div>
    </>
  );
}