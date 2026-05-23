import React, { useState, useEffect } from 'react';
import pb from "../assets/pb.png"; // PhysioBuddy logo

const API_BASE = 'http://127.0.0.1:8000';

// ── Exercise Chip Component ───────────────────────────────
const ExerciseChip = ({ exercise, reps, isCompleted }) => {
  const styles = isCompleted
    ? "bg-emerald-100 border-emerald-600 text-emerald-700"
    : "bg-red-100 border-red-600 text-red-700";

  return (
    <div className={`px-4 py-2 rounded-xl font-semibold border-2 ${styles}`}>
      {exercise} — {reps} reps
    </div>
  );
};

// ── Navbar Component ──────────────────────────────────────
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
        <div className="flex items-center">
          <a href="/doctor-home">
            <img src={pb} alt="PhysioBuddy Logo"
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" />
          </a>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(link => {
            const isActive = currentPath === link.href;
            return (
              <a key={link.name} href={link.href}
                className={`text-xl font-bold tracking-tight transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? 'text-cyan-600 underline underline-offset-[12px] decoration-3'
                    : 'text-cyan-900 dark:text-gray-300 hover:text-cyan-600'
                }`}>
                {link.name}
              </a>
            );
          })}
          <button onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white/50 dark:bg-gray-800 border border-white/30 dark:border-gray-700 transition-all hover:bg-white dark:hover:bg-gray-700 shadow-sm">
            {theme === 'light' ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
};

// ── Main Page Component ─────────────────────────────────
export default function PatientStatusPage2() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/patient-status/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setPatients(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  // Flatten exercises for stats
  const allExercises = patients.flatMap(p => p.assigned_exercises);
  const total = allExercises.length;
  const completed = allExercises.filter(ex => ex.is_completed).length;
  const pending = total - completed;
  const rate = total ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total',      value: total,      bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-300' },
    { label: 'Completed',  value: completed,  bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { label: 'Pending',    value: pending,    bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300' },
    { label: 'Compliance', value: `${rate}%`, bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300' },
  ];

  // Filter patients by search
  const filtered = patients.filter(p =>
    search.trim() === '' ? true :
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.assigned_exercises.some(ex => ex.exercise_name.toLowerCase().includes(search.toLowerCase()))
  );


return (
  <div className="h-screen w-full flex flex-col bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 overflow-hidden font-[Inter]">
    <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />

    <main className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-6xl my-auto animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <h2 className="text-5xl font-black text-cyan-950 dark:text-white tracking-tight">Patient Status</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'All assigned exercises across your patients.'}
          </p>
        </div>

        {/* Quick Stat Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full mb-8">
          {stats.map(s => (
            <div key={s.label} className="backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl p-4 text-center shadow-lg">
              <div className={`mx-auto w-12 h-12 mb-3 rounded-xl flex items-center justify-center ${s.bg}`}>
                <span className={`text-xl font-black ${s.text}`}>{s.value}</span>
              </div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex flex-wrap gap-3 items-center w-full mb-8">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search patient or exercise…"
            className="w-full px-6 py-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/30 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold focus:ring-2 focus:ring-cyan-500 outline-none transition"
          />
        </div>

        {loading && <div className="text-center p-12 text-cyan-700 dark:text-cyan-300 font-bold animate-pulse">Refreshing data...</div>}
        {error && <div className="text-center p-12 text-red-600 dark:text-red-400 font-bold">{error}</div>}

        {/* Patient Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((patient, pIdx) => {
            const completed = patient.assigned_exercises.filter(ex => ex.is_completed).length;
            const total = patient.assigned_exercises.length;
            return (
              <div key={pIdx} className="rounded-2xl shadow-lg border border-gray-500 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 p-8 min-h-[350px] flex flex-col justify-between">
                <h3 className="text-2xl font-bold text-cyan-900 dark:text-white mb-6">👤 {patient.name}</h3>
                <div className="flex flex-wrap gap-3 mb-6">
                  {patient.assigned_exercises.map((ex, eIdx) => (
                    <ExerciseChip key={eIdx} exercise={ex.exercise_name} reps={ex.reps} isCompleted={ex.is_completed} />
                  ))}
                </div>
                <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                  Progress: {completed}/{total} completed
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  </div>
);
}