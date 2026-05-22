import React, { useState, useEffect, useRef } from 'react';
import pb from "../assets/pb.png"; // Import the logo image

const API_BASE = 'http://127.0.0.1:8000';

export default function P_DoctorProfile() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  }); 
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Logic to detect which page we are on for the underline
  const currentPath = window.location.pathname;

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/doctor/profile/`, {
          method: 'GET',
          credentials: 'include',
        }); 
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setDoctor({
          name: data.doctor_name,
          phone_number: data.phone_number,
          email: data.email,
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience_years || 'Not specified',
          professional_summary: data.professional_summary || 'Dedicated healthcare professional',
          doctor_image: data.doctor_image || null,
          city: data.city || 'N/A',
          gender: data.gender || 'N/A', 
          hospital_name: data.hospital_name || 'N/A', 
        });
      } catch (err) {
        setError("Could not load doctor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorData();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => uploadImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64String) => {
    setIsUploading(true);
    try {
      const response = await fetch(`${API_BASE}/api/doctor/update-image/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_image: base64String }),
      });
      if (!response.ok) throw new Error('Failed to save image');
      setDoctor((prev) => ({ ...prev, doctor_image: base64String }));
    } catch (err) {
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const navLinks = [
    { name: 'Home', href: '/doctor-home' },
    { name: 'Patient Status', href: '/patient-list' },
    { name: 'New Assignment', href: '/new-assignment' },
    { name: 'Doctor Profile', href: '/doctor-profile' },
  ];

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-cyan-50 dark:bg-gray-900">
      <div className="animate-spin h-10 w-10 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="h-screen w-full font-[Inter] bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 transition-colors duration-500 overflow-hidden flex flex-col">
      
      {/* ── Updated Navbar: Logo Image only, Text removed ── */}
      <nav className="flex-none backdrop-blur-xl bg-white/40 dark:bg-gray-900/60 border-b border-white/30 dark:border-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/doctor-home">
              <img 
                src={pb} 
                alt="PhysioBuddy Logo" 
                className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" 
              />
            </a>
          </div>
          
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => {
              const isActive = currentPath === link.href;
              return (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className={`text-xl font-bold tracking-tight transition-all duration-300 hover:scale-105 ${
                    isActive 
                      ? 'text-cyan-600 underline underline-offset-[12px] decoration-3' 
                      : 'text-cyan-900 dark:text-gray-300 hover:text-cyan-600'
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
            
            <button onClick={toggleTheme} className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800 text-cyan-800 dark:text-yellow-400 border border-white/30 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-700 shadow-sm">
              {theme === 'light' ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch h-full">

          {/* Left Sidebar */}
          <aside className="lg:col-span-4 h-full">
            <div className="h-full backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-8 text-center flex flex-col justify-center">
              
              <div className="relative inline-block mx-auto group mb-4">
                <img
                  src={doctor?.doctor_image || "https://placehold.co/150/0891b2/ffffff?text=Doctor"}
                  alt="Doctor"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-cyan-600 shadow-xl"
                />
                <button 
                  onClick={triggerFileInput} 
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full shadow-lg hover:bg-cyan-700 transition transform hover:scale-110 active:scale-95 border-2 border-white dark:border-gray-800"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              
              <h2 className="text-2xl font-black text-cyan-950 dark:text-cyan-400 tracking-tight mb-6">
                Dr. {doctor?.name || 'Doctor Name'}
              </h2>
              
              <div className="space-y-3 text-left">
                {[
                  { label: 'Email', value: doctor?.email },
                  { label: 'Phone', value: doctor?.phone_number },
                  { label: 'Gender', value: doctor?.gender },
                  { label: 'City', value: doctor?.city }
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
            <div className="h-full backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl shadow-2xl p-6 sm:p-10 flex flex-col">
              <h1 className="text-3xl font-black text-cyan-950 dark:text-cyan-400 mb-6 tracking-tight">Doctor Profile</h1>

              <div className="bg-cyan-600 dark:bg-cyan-900/80 rounded-2xl p-5 text-white flex items-center gap-6 shadow-xl shadow-cyan-600/20 mb-6">
                <div className="p-4 bg-white/20 rounded-full text-2xl">🏢</div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Hospital Name</p>
                  <p className="text-2xl font-black truncate max-w-md">{doctor?.hospital_name || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Specialization', value: doctor?.specialization, color: 'text-blue-600' },
                  { label: 'Qualification', value: doctor?.qualification, color: 'text-cyan-600' },
                  { label: 'Experience', value: doctor?.experience, color: 'text-purple-600' }
                ].map((m, i) => (
                  <div key={i} className="p-4 bg-white/50 dark:bg-gray-700/40 rounded-xl border border-white/60 dark:border-gray-600 shadow-sm text-center">
                    <p className="text-[10px] font-black uppercase text-cyan-800 dark:text-cyan-500 tracking-wider mb-1">{m.label}</p>
                    <p className={`text-lg font-black ${m.color} dark:text-gray-100 truncate`}>{m.value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/40 dark:border-gray-700 pt-6 flex-1 flex flex-col justify-between">
              
                <div>
                  <h3 className="text-xl font-bold text-cyan-950 dark:text-cyan-400 mb-3 tracking-tight uppercase tracking-widest text-sm">
                    Professional Summary
                  </h3>
                  <p className="text-sm text-cyan-900 dark:text-gray-200 leading-relaxed font-semibold opacity-90">
                    {doctor?.professional_summary || 'No professional summary provided.'} 
                  </p>
                </div>

                <div className="p-4 bg-cyan-600/10 dark:bg-cyan-400/5 border-l-4 border-cyan-600 rounded-r-xl mt-4">
                  <p className="text-xs font-bold text-cyan-700 dark:text-cyan-400 italic">
                    Availability: Available for consultations Monday through Friday, 9:00 AM to 5:00 PM.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}