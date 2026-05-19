import React, { useState, useEffect } from 'react';
import pb from "../assets/pb.png"; // Importing the brand logo image

const API_BASE = 'http://127.0.0.1:8000';

// ── Status Badge Component ──────────────────────────────────────
const StatusBadge = ({ status }) => (
  status === 'completed'
    ? <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">● Completed</span>
    : <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">○ Incomplete</span>
);

// ── Navbar Component (Synced with Patient Profile Font & Logo) ──
const Navbar = ({ theme, toggleTheme }) => {
  const currentPath = window.location.pathname;

  const navLinks = [
    { name: 'Home', href: '/doctor-home' },
    { name: 'Patient Status', href: '/patient-list' },
    { name: 'New Assignment', href: '/new-assignment' },
    { name: 'Doctor Profile', href: '/doctor-profile' },
  ];

  return (
    <nav className="flex-none backdrop-blur-xl bg-white/40 dark:bg-gray-900/60 border-b border-white/30 dark:border-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* Branding: Logo Image Only (Synced with Profile) */}
        <div className="flex items-center">
          <a href="/doctor-home">
            <img 
              src={pb} 
              alt="PhysioBuddy Logo" 
              className="h-14 w-auto object-contain hover:scale-105 transition-transform duration-300" 
            />
          </a>
        </div>

        {/* Navigation Links - Updated to text-xl to match Profile Page */}
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

// ── Main Page Component ───────────────────────────────────────────
export default function PatientStatusPage() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [records, setRecords]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);
  const [filter,  setFilter]    = useState('all');
  const [search,  setSearch]    = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/patient-status/`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const mapped = [];
      data.forEach((patient, pIdx) => {
        patient.assigned_exercises.forEach((ex, eIdx) => {
          mapped.push({
            id: `${pIdx}-${eIdx}`,
            patient: patient.name,
            exercise: ex.exercise_name,
            reps: ex.reps,
            status: ex.is_completed ? 'completed' : 'incomplete',
          });
        });
      });
      setRecords(mapped);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const filtered = records
    .filter(r => filter === 'all' ? true : r.status === filter)
    .filter(r => search.trim() === '' ? true : r.patient.toLowerCase().includes(search.toLowerCase()) || r.exercise.toLowerCase().includes(search.toLowerCase()));

  const total     = records.length;
  const completed = records.filter(r => r.status === 'completed').length;
  const pending   = records.filter(r => r.status !== 'completed').length;
  const rate      = total ? Math.round((completed / total) * 100) : 0;

  const stats = [
    { label: 'Total',      value: total,      bg: 'bg-cyan-100 dark:bg-cyan-900/30',    text: 'text-cyan-700 dark:text-cyan-300' },
    { label: 'Completed',  value: completed,  bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { label: 'Pending',    value: pending,    bg: 'bg-amber-100 dark:bg-amber-900/30',  text: 'text-amber-700 dark:text-amber-300' },
    { label: 'Compliance', value: `${rate}%`, bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-700 dark:text-blue-300' },
  ];

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 overflow-hidden font-[Inter]">
      <Navbar theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />

      <main className="flex-1 overflow-y-auto flex flex-col items-center py-10 px-6">
        <div className="w-full max-w-4xl my-auto animate-in fade-in zoom-in duration-700">
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

          {/* Desktop Table View */}
          {!loading && !error && (
            <div className="hidden md:block w-full backdrop-blur-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-white/30 dark:bg-gray-900/30">
                  <tr>
                    {['Patient', 'Exercise', 'Reps', 'Status'].map(h => (
                      <th key={h} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/30 dark:divide-gray-700">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-white/30 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4 font-bold text-cyan-950 dark:text-white">{r.patient}</td>
                      <td className="px-6 py-4 text-sm text-cyan-900 dark:text-cyan-200">{r.exercise}</td>
                      <td className="px-6 py-4 font-bold text-cyan-800 dark:text-cyan-200">🔁 {r.reps} reps</td>
                      <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {loading && <div className="text-center p-12 text-cyan-700 dark:text-cyan-300 font-bold animate-pulse">Refreshing data...</div>}
        </div>
      </main>
    </div>
  );
}