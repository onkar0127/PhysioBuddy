import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar'; 

const API_BASE = 'http://127.0.0.1:8000';

export default function PatientHome() {
  const [patientName, setPatientName] = useState(''); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/patient/profile/`, { 
          method: 'GET',
          credentials: 'include' 
        });
        
        if (response.ok) {
          const data = await response.json();
          setPatientName(data.patient_name || data.name || 'Patient');
        } else {
          setPatientName('Patient'); 
        }
      } catch (err) {
        setPatientName('Patient'); 
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      
      <Navbar role="patient" />

      {/* Balanced max-width (3xl) to look great on desktop without stretching */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        
        {loading ? (
           <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
           </div>
        ) : (
          <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 sm:space-y-8">

            {/* 1. Hero Section - Fluid Typography */}
            <div className="text-center space-y-3 mb-6 sm:mb-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-cyan-950 dark:text-white tracking-tight leading-tight">
                Ready to move, <br className="sm:hidden" /> <span className="text-cyan-700 dark:text-cyan-400">{patientName}</span>?
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 font-medium max-w-lg mx-auto px-2">
                "Movement is medicine." Let's knock out today's routine and get back to full strength.
              </p>
            </div>

            {/* 2. Main Action Card - Responsive Padding */}
            <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-[2rem] p-8 sm:p-12 shadow-xl flex flex-col items-center justify-center text-center transform transition-all duration-300 hover:shadow-cyan-900/10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cyan-100 dark:bg-cyan-900/50 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl mb-6 shadow-inner border border-cyan-200 dark:border-cyan-800">
                🏃
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-cyan-900 dark:text-cyan-100 mb-2">Today's Routine</h2>
              <p className="text-sm sm:text-base text-cyan-800 dark:text-cyan-400 font-medium mb-8">
                Your therapist has updated your exercises.
              </p>
              
              <Link to="/exercise-list" className="inline-block w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-black uppercase tracking-widest rounded-2xl text-white bg-cyan-600 shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all duration-200 hover:-translate-y-1 active:scale-95">
                Go to Exercises
              </Link>
            </div>

            {/* 3. Secondary Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full">
                <Link to="/patient-profile" className="group backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-white/60 dark:hover:bg-gray-700/60 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 sm:gap-5">
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-cyan-200 dark:border-cyan-800">
                    👤
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-cyan-950 dark:text-gray-100 tracking-tight">My Profile</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Personal Details</p>
                  </div>
                </Link>

                <Link to="/customer-care" className="group backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 hover:bg-white/60 dark:hover:bg-gray-700/60 shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-4 sm:gap-5">
                  <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 border border-blue-200 dark:border-blue-800">
                    💬
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-cyan-950 dark:text-gray-100 tracking-tight">Need Help?</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Chat with support</p>
                  </div>
                </Link>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}