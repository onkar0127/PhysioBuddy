import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // 1. Import the shared component
import pb from "../assets/pb.png";

const API_BASE = 'http://127.0.0.1:8000';

// HomeContent Component (Moved outside to clean up)
function HomeContent({ stats, doctorName }) {
  const features = [
    { icon: '🩺', title: 'Patient Insights', desc: 'Track every patient\'s rehab progress in real time.' },
    { icon: '📝', title: 'Quick Assignments', desc: 'Create new exercise plans in seconds.' },
    { icon: '📈', title: 'Outcome Analytics', desc: 'Compliance, recovery rates, and trends at a glance.' },
    { icon: '💬', title: 'Direct Messaging', desc: 'Stay connected with your patients securely.' },
    { icon: '🛡️', title: 'HIPAA Compliant', desc: 'All patient data is encrypted end-to-end.' },
    { icon: '⏱️', title: 'Save Time', desc: 'Automated reminders and progress tracking.' },
  ];

  return (
    <div className="space-y-0">
      <section className="pt-24 pb-28 text-center px-4">
        <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-700">
          <h1 className="text-5xl sm:text-7xl font-black text-cyan-950 dark:text-white tracking-tighter leading-tight">
            Welcome back, <br /> {doctorName ? `Dr. ${doctorName}` : 'Doctor'}.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
            Manage your patients, assign exercises, and track recovery — all from one elegant workspace.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a href="/patient-status" className="px-10 py-4 text-lg font-bold rounded-2xl text-white bg-cyan-600 shadow-xl shadow-cyan-500/40 hover:bg-cyan-700 transition-all duration-300 hover:scale-105 text-center">
              View Patient Status
            </a>
            <a href="/new-assignment" className="px-10 py-4 text-lg font-bold rounded-2xl text-cyan-700 dark:text-cyan-400 border-2 border-cyan-400 dark:border-cyan-600 hover:bg-white/50 dark:hover:bg-cyan-900/20 transition-all duration-300 text-center">
              + New Assignment
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard value={stats.total} label="Patients" icon="👥" />
          <StatCard value={stats.completed} label="Completed" icon="✅" />
          <StatCard value={stats.pending} label="Pending" icon="⏳" />
          <StatCard value={`${stats.rate}%`} label="Compliance" icon="📊" />
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ value, label, icon }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="text-3xl font-black text-cyan-700 dark:text-cyan-400">{value}</h3>
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 text-center uppercase tracking-widest">{label}</p>
  </div>
);

export default function DoctorHome() {
  const [records, setRecords] = useState([]);
  const [doctorName, setDoctorName] = useState('');

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/doctor/get-name/`, { credentials: 'include' });
        const data = await response.json();
        setDoctorName(data.doctor_name || '');
      } catch (err) { console.error(err); }
    };
    fetchDoctorData();
  }, []);

  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    pending: records.filter(r => r.status !== 'completed').length,
    rate: records.length ? Math.round((records.filter(r => r.status === 'completed').length / records.length) * 100) : 0,
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      
      {/* 2. Implementation: Using the new shared component */}
      <Navbar role="doctor" />

      <main className="flex-1">
        <HomeContent stats={stats} doctorName={doctorName} />
      </main>

      <footer className="bg-white/40 dark:bg-gray-950 py-10 mt-10 border-t border-white/30 dark:border-gray-800 text-center">
        <p className="text-cyan-600 uppercase text-xs font-bold tracking-widest">PhysioBuddy · Doctor Portal</p>
      </footer>
    </div>
  );
}