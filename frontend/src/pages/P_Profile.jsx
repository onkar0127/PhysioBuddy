import React, { useState, useEffect, useRef } from 'react';
import pb from "../assets/pb.png";

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
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/patient/profile/', {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setPatient({
          name: data.patient_name,
          phone_number: data.phone_number,
          email: data.email,
          dob: data.dob,
          gender: data.gender,
          assigned_doctor: data.assigned_doctor,
          height: data.height,
          weight: data.weight,
          blood_group: data.bg,
          patient_image: data.patient_image || null,
        });
      } catch (err) {
        setError("Could not load patient profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const triggerFileInput = () => fileInputRef.current.click();
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const calculateBMI = () => {
    if (patient?.height && patient?.weight) {
      const heightInMeters = patient.height / 100;
      return (patient.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-cyan-50 dark:bg-gray-900">
      <div className="animate-spin h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="h-screen w-full font-[Inter] bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 transition-colors duration-500 overflow-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="flex-none backdrop-blur-xl bg-white/40 dark:bg-gray-900/60 border-b border-white/30 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <img src={pb} alt="Logo" className="h-12 w-auto" />
          <div className="flex items-center gap-6">
            <a href="/home" className="text-sm font-bold text-cyan-900 dark:text-cyan-400 hover:text-cyan-600 transition">Home</a>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-gray-800 text-cyan-800 dark:text-yellow-400 shadow-inner">
              {theme === 'light' ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">

          {/* Left Sidebar */}
          <aside className="lg:col-span-4 h-full">
            <div className="h-full backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-8 text-center flex flex-col justify-center">
              
              {/* FIXED: Camera Icon Positioning container */}
              <div className="relative inline-block mx-auto group">
                <img
                  src={patient?.patient_image || "https://placehold.co/150/0891b2/ffffff?text=Patient"}
                  alt="Patient"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-cyan-600 shadow-xl"
                />
                <button 
                  onClick={triggerFileInput} 
                  className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full shadow-lg hover:bg-cyan-700 transition transform hover:scale-110 active:scale-95 border-2 border-white dark:border-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" />
              
              <h2 className="mt-6 text-2xl font-black text-cyan-950 dark:text-cyan-400 tracking-tight">{patient?.name || 'Patient Name'}</h2>
              
              <div className="mt-8 space-y-4 text-left">
                {[
                  { label: 'Email', value: patient?.email },
                  { label: 'Phone', value: patient?.phone_number },
                  { label: 'Gender', value: patient?.gender },
                  { label: 'DOB', value: patient?.dob }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/30 dark:bg-gray-900/30 rounded-xl border border-white/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700 dark:text-cyan-500">{item.label}</p>
                    <p className="text-sm font-semibold text-cyan-950 dark:text-gray-200 truncate">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Content */}
          <section className="lg:col-span-8 h-full">
            <div className="h-full backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col justify-start">
              <h1 className="text-3xl font-black text-cyan-950 dark:text-cyan-400 mb-8 tracking-tight">Patient Profile</h1>

              <div className="bg-cyan-600 dark:bg-cyan-900/80 rounded-2xl p-6 text-white flex items-center gap-6 shadow-xl shadow-cyan-600/20 mb-8">
                <div className="p-4 bg-white/20 rounded-full text-2xl">🩺</div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Assigned Doctor</p>
                  <p className="text-2xl font-black">Dr. {patient?.assigned_doctor || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Height', value: `${patient?.height} cm`, color: 'text-blue-600' },
                  { label: 'Weight', value: `${patient?.weight} kg`, color: 'text-cyan-600' },
                  { label: 'Blood Group', value: patient?.blood_group, color: 'text-rose-600' },
                  { label: 'BMI Score', value: bmi || 'N/A', color: 'text-purple-600' }
                ].map((m, i) => (
                  <div key={i} className="p-4 bg-white/50 dark:bg-gray-700/40 rounded-xl border border-white/60 dark:border-gray-600 shadow-sm text-center">
                    <p className="text-[10px] font-black uppercase text-cyan-800 dark:text-cyan-500 tracking-wider mb-1">{m.label}</p>
                    <p className={`text-xl font-black ${m.color} dark:text-gray-100`}>{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/40 dark:border-gray-700 pt-8 flex-grow">
                <h3 className="text-xl font-bold text-cyan-950 dark:text-cyan-400 mb-4 tracking-tight uppercase tracking-widest text-sm">
                  Additional Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-cyan-900 dark:text-gray-200 leading-relaxed font-semibold opacity-90">
                      Comprehensive health profile maintained for accurate medical record keeping and continuity of care. This summary reflects progress and highlights areas of focus for rehabilitation.
                    </p>
                  </div>

                  <div className="p-4 bg-cyan-600/10 dark:bg-cyan-400/5 border-l-4 border-cyan-600 rounded-r-xl">
                    <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 italic">
                      Note: Your recovery milestones are updated regularly by your specialist to ensure the highest standard of care.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}