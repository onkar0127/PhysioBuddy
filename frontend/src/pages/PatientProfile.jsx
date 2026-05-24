import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar'; 

const API_BASE = 'http://127.0.0.1:8000';

export default function P_PatientProfile() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/patient/profile/`, {
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const calculateBMI = () => {
    if (patient?.height && patient?.weight) {
      const heightInMeters = patient.height / 100;
      return (patient.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  return (
    <div className="min-h-screen w-full font-[Inter] bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 flex flex-col">
      
      <Navbar role="patient" />

      <main className="flex-1 flex flex-col px-4 py-6">
        {loading ? (
           <div className="flex-1 flex items-center justify-center">
             <div className="animate-spin h-8 w-8 border-4 border-cyan-600 border-t-transparent rounded-full"></div>
           </div>
        ) : (
          <div className="max-w-4xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Sidebar - Scales elegantly to full width on mobile */}
            <aside className="lg:col-span-4">
              <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl shadow-md p-6 text-center flex flex-col items-center">
                
                <div className="relative group mt-2">
                  <img
                    src={patient?.patient_image || "https://placehold.co/150/0891b2/ffffff?text=Patient"}
                    alt="Patient"
                    className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-cyan-800 shadow-md"
                  />
                  <button 
                    onClick={() => fileInputRef.current.click()} 
                    className="absolute bottom-0 right-0 bg-cyan-600 text-white p-2 rounded-full shadow-md hover:bg-cyan-700 transition transform hover:scale-110"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" />
                </div>
                
                <h2 className="mt-4 text-xl font-black text-cyan-950 dark:text-cyan-100">{patient?.name || 'Patient'}</h2>
                
                <div className="mt-6 w-full space-y-3 text-left">
                  {[
                    { label: 'Email', value: patient?.email },
                    { label: 'Phone', value: patient?.phone_number },
                    { label: 'Gender', value: patient?.gender },
                    { label: 'DOB', value: patient?.dob }
                  ].map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-white/40 dark:border-gray-700/50 flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-800 dark:text-cyan-500 mb-0.5">{item.label}</span>
                      <span className="text-sm font-semibold text-cyan-950 dark:text-gray-200 truncate">{item.value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content - Scales to fill remaining space */}
            <section className="lg:col-span-8 flex flex-col">
              <div className="flex-1 backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl shadow-md p-6 sm:p-8 flex flex-col">
                
                <h1 className="text-2xl font-black text-cyan-950 dark:text-cyan-100 mb-6">Patient Overview</h1>

                <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 dark:from-cyan-800 dark:to-cyan-900 rounded-xl p-5 text-white flex items-center gap-5 shadow-sm mb-6">
                  <div className="p-3 bg-white/20 rounded-full text-xl shadow-inner">🩺</div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-100 mb-0.5">Assigned Specialist</p>
                    <p className="text-lg font-black">Dr. {patient?.assigned_doctor || 'Unassigned'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { label: 'Height', value: patient?.height ? `${patient.height} cm` : 'N/A' },
                    { label: 'Weight', value: patient?.weight ? `${patient.weight} kg` : 'N/A' },
                    { label: 'Blood Group', value: patient?.blood_group || 'N/A' },
                    { label: 'BMI Score', value: bmi || 'N/A' }
                  ].map((m, i) => (
                    <div key={i} className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-white/60 dark:border-gray-700 shadow-sm text-center">
                      <p className="text-[10px] font-black uppercase text-cyan-800 dark:text-cyan-500 tracking-widest mb-1">{m.label}</p>
                      <p className="text-base font-black text-cyan-950 dark:text-cyan-100">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-cyan-900/10 dark:border-white/10 pt-6 mt-auto">
                  <h3 className="text-xs font-black text-cyan-950 dark:text-cyan-400 mb-3 uppercase tracking-widest">Clinic Notes</h3>
                  <div className="p-4 bg-cyan-600/5 dark:bg-cyan-900/20 border-l-2 border-cyan-600 rounded-r-lg">
                    <p className="text-xs font-semibold text-cyan-800 dark:text-cyan-300/80 leading-relaxed">
                      Recovery milestones are updated regularly by your specialist to ensure the highest standard of care.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}