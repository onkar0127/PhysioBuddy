import React, { useState, useEffect } from 'react';
import pb from "../assets/pb.png"; // Importing the brand logo image

const API_BASE = 'http://127.0.0.1:8000';

// ── Helper: Get CSRF Token ───────────────────────────────────────
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// ── Navbar Component (Synced with Patient Profile Style) ──────────
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
        
        {/* Branding: Logo Image Only */}
        <div className="flex items-center">
          <a href="/doctor-home">
            <img 
              src={pb} 
              alt="PhysioBuddy Logo" 
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" 
            />
          </a>
        </div>

        {/* Navigation Links - Synced with Profile Page Font (text-xl) */}
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

// ── Main Page Content ─────────────────────────────────────────────
export default function NewAssignmentContent({ onCreated }) {
  const [form, setForm] = useState({ patient: '', exercise: '', reps: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Fetch initial data
  useEffect(() => {
    const loadFormData = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/doctor/get-my-patients/`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to load clinical records.");
        const data = await res.json();
        setPatients(data.patients || []);
        setExercises(data.exercises || []);
      } catch (err) {
        setError("Connection failed. Check if backend is running.");
      } finally {
        setDataLoading(false);
      }
    };
    loadFormData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const csrftoken = getCookie('csrftoken'); 
      const res = await fetch(`${API_BASE}/api/submit-assignment/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken 
        },
        body: JSON.stringify({
          patient_name: form.patient,
          exercise_name: form.exercise,
          repetitions: parseInt(form.reps, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Failed to save assignment.");

      setSuccess(true);
      setForm({ patient: '', exercise: '', reps: '' });
      if (onCreated) onCreated();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = "w-full pl-12 pr-10 py-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/30 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold focus:ring-2 focus:ring-cyan-500 outline-none appearance-none transition-all cursor-pointer";

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 overflow-hidden font-[Inter]">
      <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />

      <main className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-2xl my-auto animate-in fade-in zoom-in duration-700">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black text-cyan-950 dark:text-white tracking-tight">Assign New Task</h2>
          </div>

          <form onSubmit={handleSubmit} className="backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl space-y-8">
            <div className="space-y-6">
              {/* Patient Select */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👤</span>
                <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required className={selectClass}>
                  <option value="">Select a patient</option>
                  {patients.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Exercise Select */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🏋️</span>
                <select value={form.exercise} onChange={(e) => setForm({ ...form, exercise: e.target.value })} required className={selectClass}>
                  <option value="">Select an exercise</option>
                  {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                </select>
              </div>

              {/* Reps Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔁</span>
                <input 
                  type="number" 
                  value={form.reps} 
                  onChange={(e) => setForm({ ...form, reps: e.target.value })} 
                  placeholder="Enter total reps" 
                  required 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/30 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold outline-none" 
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-black bg-red-500/10 p-3 rounded-xl border border-red-500/20">⚠️ {error}</div>}
            {success && <div className="text-emerald-500 text-xs font-black bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">✅ Assignment logged successfully!</div>}

            <button type="submit" disabled={submitting || dataLoading} className="w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-700 shadow-xl transition-all disabled:opacity-50">
              {submitting ? 'Syncing...' : 'Confirm Assignment →'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}