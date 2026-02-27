// import React, { useEffect, useState } from "react";

// export default function D_Profile() {
//   const [doctor, setDoctor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchDoctorProfile = async () => {
//       try {
//         const response = await fetch("http://127.0.0.1:8000/api/doctor/profile/", {
//           method: "GET",
//           credentials: "include", // important: send session cookie
//         });

//         if (response.ok) {
//           const result = await response.json();
//           if (result.success) {
//             setDoctor(result.data);
//           } else {
//             setError(result.error || "Failed to load doctor profile");
//           }
//         } else {
//           setError(`Server error: ${response.status}`);
//         }
//       } catch (err) {
//         console.error("Error fetching doctor profile:", err);
//         setError("Network error while fetching doctor profile");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDoctorProfile();
//   }, []);

//   if (loading) {
//     return <div className="p-6">Loading doctor profile...</div>;
//   }

//   if (error) {
//     return <div className="p-6 text-red-600">Error: {error}</div>;
//   }

//   if (!doctor) {
//     return <div className="p-6">No doctor profile found.</div>;
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-200">
//         <h1 className="text-3xl font-bold text-blue-700 mb-4">Doctor Profile</h1>
//         <div className="space-y-4">
//           <h2 className="text-2xl font-semibold">{doctor.name}</h2>
//            <p className="text-gray-700"><strong>Name:</strong> {doctor.doctor_name}</p>
//           <p className="text-gray-700"><strong>Specialty:</strong> {doctor.specialization}</p>
//           <p className="text-gray-700"><strong>Qualification:</strong> {doctor.qualification}</p>
//           <p className="text-gray-700"><strong>Email:</strong> {doctor.email}</p>
//           <p className="text-gray-700"><strong>Phone:</strong> {doctor.phone_number}</p>
//           <div className="mt-4">
//             <h3 className="text-xl font-semibold mb-2">About</h3>
//             <p className="text-gray-600">{doctor.bio}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';

// Single export function
export default function P_DoctorProfile() {
  const [theme, setTheme] = useState('light');
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use useEffect to check for a saved theme in local storage on initial load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Use useEffect to save the current theme to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch doctor data from backend
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch('/api/doctor/profile'); // Update with your backend URL
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
          experience: data.experience || 'Not specified', // Optional field
          bio: data.bio || 'Dedicated healthcare professional', // Optional field
        });
        setError(null);
      } catch (err) {
        setError(err.message);
        // Fallback data for development
        setDoctor({
          name: "Dr. Onkar Gite",
          phone_number: "+91 9876543210",
          email: "giteomkar0127@gmail.com",
          specialization: "Orthopedic Surgery",
          qualification: "MD, Board Certified",
          experience: "12 years",
          bio: "Specialist in joint replacement and sports medicine"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Base classes for the main container, changing based on the theme
  const mainContainerClasses = `min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`;
  
  // Base classes for cards, changing based on the theme
  const cardClasses = `shadow-lg rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`;

  // Base classes for list items, changing based on the theme
  const listItemClasses = `p-4 rounded-lg flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-gray-800'}`;

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

  return (
    <>
      {/* Tailwind CSS CDN */}
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

      {/* Tailwind Configuration for Inter font */}
      <style>
        {`
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>

      <div className={mainContainerClasses}>

        {/* --- Navbar Section --- */}
        <nav className={`shadow-sm p-4 sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo and App Name */}
            <div className="flex items-center space-x-2">
              <img src="src/assets/pb.png" alt="Logo" className="h-14 w-18 text-indigo-600" />
            </div>

            {/* Home Link and Theme Toggle Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <a href="/" className={`font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Home</a>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                {theme === 'light' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* --- Main Content Area: Responsive & Scrollable Layout --- */}
        <main className="container mx-auto flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8">

            {/* --- Left Sidebar (Doctor Details) --- */}
            <div className={`md:w-1/4 w-full h-fit sticky top-32 ${cardClasses}`}>
              <div className="flex flex-col items-center">
                {/* Doctor Image Circle - Now has a conditional border */}
                <div className={`w-32 h-32 rounded-full overflow-hidden mb-4 border-4 shadow-md ${theme === 'dark' ? 'border-indigo-600' : 'border-indigo-200'}`}>
                  <img src="https://placehold.co/128x128/4F46E5/ffffff?text=Doctor" alt="Doctor" className="w-full h-full object-cover" />
                </div>

                {/* Doctor Name */}
                <h2 className={`text-2xl font-semibold text-center ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
                  {doctor?.name || 'Dr. Name'}
                </h2>
                
                {/* Specialization as Subtitle */}
                <p className={`text-sm mb-6 text-center ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {doctor?.specialization || 'Specialization'}
                </p>

                {/* Doctor Details List */}
                <div className="w-full space-y-4">
                  {/* Email */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="font-semibold text-sm break-words">{doctor?.email || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Phone:</span>
                      <span className="font-semibold">{doctor?.phone_number || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Specialization:</span>
                      <span className="font-semibold">{doctor?.specialization || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Qualification */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Qualification:</span>
                      <span className="font-semibold text-sm">{doctor?.qualification || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className={listItemClasses}>
                    <div className="flex flex-col w-full">
                      <span className="text-sm font-medium">Experience:</span>
                      <span className="font-semibold">{doctor?.experience || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Content Area (Scrollable) --- */}
            <div className={`flex-1 ${cardClasses} max-h-[calc(113vh-200px)] overflow-y-auto`}>
              <h1 className="text-3xl font-bold mb-6">Doctor Profile</h1>

             

              {/* Bio Section */}
              <div className={`p-6 rounded-lg border mb-6 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <h3 className="font-semibold text-lg mb-2">Professional Bio</h3>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {doctor?.bio || 'Dedicated healthcare professional with extensive experience in patient care and treatment.'}
                </p>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Specialization Card */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Specialization</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.specialization || 'N/A'}</p>
                </div>

                {/* Qualification Card */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <h3 className="font-semibold text-lg">Qualification</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.qualification || 'N/A'}</p>
                </div>

                {/* Experience Card */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-purple-50 border-purple-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Experience</h3>
                  </div>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.experience || 'N/A'}</p>
                </div>

                {/* Contact Info Card */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="font-semibold text-lg">Contact Email</h3>
                  </div>
                  <p className={`text-sm break-words ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{doctor?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Additional Information Section */}
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