import React, { useState, useEffect } from 'react';
import pb from "../assets/pb.png"; // Importing the image as done in your landing page

const API_BASE = 'http://127.0.0.1:8000';

// ── Navbar Component (Synced with Landing Page Logo) ──────────────
// ── Navbar Component (Logo Image Only) ──────────────
const Navbar = ({ theme, toggleTheme }) => {
  const currentPath = window.location.pathname;

  const navLinks = [
    { name: 'Home', href: '/doctor-home' },
    { name: 'Patient Status', href: '/patient-status' },
    { name: 'New Assignment', href: '/new-assignment' },
    { name: 'Doctor Profile', href: '/doctor-profile' },
  ];

  return (
    <nav className="flex-none backdrop-blur-xl bg-white/40 dark:bg-gray-900/60 border-b border-white/30 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* Branding: Logo Image only (Text removed) */}
        <div className="flex items-center">
          <a href="/doctor-home">
            <img 
              src={pb} 
              alt="PhysioBuddy Logo" 
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" 
            />
          </a>
        </div>

        {/* Navigation Links - text-xl font size */}
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
          
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-700 shadow-sm"
          >
            {theme === 'light' ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
};
// ── Dashboard Stat Card ───────────────────────────────────────────
const StatCard = ({ value, label, icon }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    <div className="text-4xl mb-2">{icon}</div>
    <h3 className="text-3xl font-black text-cyan-700 dark:text-cyan-400">{value}</h3>
    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 text-center uppercase tracking-widest">{label}</p>
  </div>
);

// ── Feature Card ──────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-400 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

function HomeContent({ stats }) {
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
            Welcome back, <br /> Dr. Sharma.
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

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value={stats.total} label="Patients" icon="👥" />
            <StatCard value={stats.completed} label="Completed" icon="✅" />
            <StatCard value={stats.pending} label="Pending" icon="⏳" />
            <StatCard value={`${stats.rate}%`} label="Compliance" icon="📊" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-500 mb-2">System Tools</p>
            <h2 className="text-4xl font-black text-cyan-950 dark:text-white">Everything You Need</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DoctorHome() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/doctor/get-my-patients/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) { 
        console.error("Stats fetch failed:", err); 
        setRecords([]); 
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    pending: records.filter(r => r.status !== 'completed').length,
    rate: records.length ? Math.round((records.filter(r => r.status === 'completed').length / records.length) * 100) : 0,
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter] overflow-x-hidden">
      <Navbar theme={theme} toggleTheme={toggleTheme} />

      <main className="flex-1">
        <HomeContent stats={stats} />
      </main>

      <footer className="bg-white/40 dark:bg-gray-950 py-10 mt-10 transition-colors duration-500 text-center border-t border-white/30 dark:border-gray-800">
        <p className="font-bold text-cyan-600 mb-1 tracking-widest uppercase text-xs">PhysioBuddy · Doctor Portal</p>
        <p className="text-gray-500 dark:text-gray-400 text-[10px]">© {new Date().getFullYear()} PhysioBuddy. All rights reserved.</p>
      </footer>
    </div>
  );
}