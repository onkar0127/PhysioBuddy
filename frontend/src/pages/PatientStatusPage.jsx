import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import shared component
import pb from "../assets/pb.png";

const API_BASE = 'http://127.0.0.1:8000';

// ── Exercise Chip Component ───────────────────────────────
const ExerciseChip = ({ exercise, reps, isCompleted }) => {
  const styles = isCompleted
    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400"
    : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400";

  return (
    <div className={`px-3 py-1 rounded-lg text-sm font-medium border ${styles} transition-all duration-300 hover:scale-105 shadow-sm`}>
      {exercise} — {reps} reps
    </div>
  );
};

// ── Main Page Component ─────────────────────────────────
export default function PatientStatusPage2() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

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
    { label: 'Total', value: total, bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
    { label: 'Completed', value: completed, bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
    { label: 'Pending', value: pending, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
    { label: 'Compliance', value: `${rate}%`, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  ];

  const filtered = patients.filter(p =>
    search.trim() === '' ? true :
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.assigned_exercises.some(ex => ex.exercise_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 overflow-hidden font-[Inter]">
      
      {/* Shared Navbar Implementation */}
      <Navbar role="doctor" />

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
              <div key={s.label} className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/60 dark:border-gray-700 rounded-2xl p-4 text-center shadow-xl hover:shadow-cyan-900/10 transition-all duration-300">
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
              className="w-full px-6 py-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-white/60 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold shadow-lg focus:ring-2 focus:ring-cyan-500 outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {loading && <div className="text-center p-12 text-cyan-700 dark:text-cyan-300 font-bold animate-pulse">Refreshing data...</div>}
          {error && <div className="text-center p-12 text-red-600 dark:text-red-400 font-bold">{error}</div>}

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filtered.map((patient, pIdx) => {
              const completed = patient.assigned_exercises.filter(ex => ex.is_completed).length;
              const total = patient.assigned_exercises.length;
              return (
                <div key={pIdx} className="group backdrop-blur-xl bg-gradient-to-br from-white/70 via-cyan-50/60 to-blue-50/70 dark:from-gray-800/70 dark:via-gray-800/60 dark:to-slate-900/70 border border-cyan-100/80 dark:border-gray-700 rounded-[1.5rem] p-6 flex flex-col h-full shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-xl border border-cyan-200 dark:border-cyan-800 shadow-inner">
                      👤
                    </div>
                    <h3 className="text-xl font-black text-cyan-950 dark:text-white">{patient.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {patient.assigned_exercises.map((ex, eIdx) => (
                      <ExerciseChip key={eIdx} exercise={ex.exercise_name} reps={ex.reps} isCompleted={ex.is_completed} />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 mt-auto pt-3 border-t border-cyan-100/80 dark:border-gray-700">
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