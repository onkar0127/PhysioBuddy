import React, { useState, useEffect } from 'react';

// Single export function
export default function P_Profile() {
  const [theme, setTheme] = useState('light');

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

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const patient = {
    name: "Atharva",
    age: 45,
    gender: "Male",
    lastVisit: "2024-09-15",
    allergies: "Pollen, Penicillin"
  };

  // Base classes for the main container, changing based on the theme
  const mainContainerClasses = `min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`;
  
  // Base classes for cards, changing based on the theme
  const cardClasses = `shadow-lg rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`;

  // Base classes for list items, changing based on the theme
  const listItemClasses = `p-4 rounded-lg flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-indigo-50 text-gray-800'}`;

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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m-2-4h4m-4 0h.01M16 19v-2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {/* This text color is now conditional */}
              <span className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>Health Portal</span>
            </div>

            {/* Home Link and Theme Toggle Button */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <a href="#" className={`font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-indigo-400' : 'text-gray-600 hover:text-indigo-600'}`}>Home</a>
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

        {/* --- Main Content Area: Responsive Layout --- */}
        <main className="container mx-auto flex-1 p-4 md:p-8">
          <div className="flex flex-col md:flex-row gap-8">

            {/* --- Left Sidebar (Patient Details) --- */}
            <div className={`md:w-1/4 w-full h-fit ${cardClasses}`}>
              <div className="flex flex-col items-center">
                {/* Patient Image Circle - Now has a conditional border */}
                <div className={`w-32 h-32 rounded-full overflow-hidden mb-4 border-4 shadow-md ${theme === 'dark' ? 'border-indigo-600' : 'border-indigo-200'}`}>
                  <img src="https://placehold.co/128x128/999999/ffffff?text=Patient" alt="Patient" className="w-full h-full object-cover" />
                </div>

                {/* Patient Name */}
                <h2 className={`text-2xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>{patient.name}</h2>
                {/* Text color is now conditional */}
                <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Patient ID: 12345</p>

                {/* Patient Details List */}
                <div className="w-full space-y-4">
                  <div className={listItemClasses}>
                    <span className="text-sm font-medium">Age:</span>
                    <span className="font-bold">{patient.age}</span>
                  </div>
                  <div className={listItemClasses}>
                    <span className="text-sm font-medium">Gender:</span>
                    <span className="font-bold">{patient.gender}</span>
                  </div>
                  <div className={listItemClasses}>
                    <span className="text-sm font-medium">Last Visit:</span>
                    <span className="font-bold">{patient.lastVisit}</span>
                  </div>
                  <div className={listItemClasses}>
                    <span className="text-sm font-medium">Allergies:</span>
                    <span className="font-bold text-right">{patient.allergies}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Right Content Area (Placeholder) --- */}
            <div className={`flex-1 ${cardClasses}`}>
              <h1 className="text-2xl font-bold mb-4">Patient Dashboard</h1>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>This section can be used to display charts, reports, upcoming appointments, and other relevant information for the patient.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* These cards now have conditional borders and backgrounds */}
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <h3 className="font-semibold text-lg mb-2">Upcoming Appointment</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Dr. Smith on Oct 1, 2024 at 10:00 AM</p>
                </div>
                <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <h3 className="font-semibold text-lg mb-2">Recent Test Results</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Bloodwork and lab results are available.</p>
                </div>
                <div className={`p-6 rounded-lg border col-span-1 md:col-span-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <h3 className="font-semibold text-lg mb-2">Medical History</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Detailed medical history can be displayed here, including past diagnoses and treatments.</p>
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* --- Footer Section --- */}
        <footer className={`text-center p-4 mt-8 shadow-sm ${theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
          &copy; Your Physio Trainer is here!! 
        </footer>
      </div>
    </>
  );
}