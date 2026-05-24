import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 

// ─── Skeleton Loader (Responsive) ─────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl border border-white/30 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 shadow-lg backdrop-blur-md">
    <div className="flex-1 space-y-3 w-full">
      <div className="h-5 sm:h-6 bg-white/60 dark:bg-gray-700 rounded-md w-3/4 sm:w-1/2" />
      <div className="h-3 sm:h-4 bg-white/60 dark:bg-gray-700 rounded-md w-1/3 sm:w-1/4" />
      <div className="flex gap-2 mt-2">
        <div className="h-6 sm:h-7 bg-white/60 dark:bg-gray-700 rounded-md w-16 sm:w-20" />
        <div className="h-6 sm:h-7 bg-white/60 dark:bg-gray-700 rounded-md w-24 sm:w-28" />
      </div>
    </div>
    <div className="h-12 sm:h-11 w-full sm:w-32 bg-white/60 dark:bg-gray-700 rounded-xl mt-2 sm:mt-0" />
  </div>
);

// ─── Exercise Card (Responsive) ───────────────────────────────────
const ExerciseCard = ({ exercise }) => {
  const { exercise_id, assignment_id, exercise_name, target_reps, is_completed, date_assigned } = exercise;

  const formattedDate = date_assigned
    ? new Date(date_assigned).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div 
      className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
        is_completed 
        ? 'bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm opacity-80' 
        : 'bg-white/60 dark:bg-gray-800/60 border-white/60 dark:border-gray-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
        
        {/* Info Section */}
        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight leading-tight ${is_completed ? 'text-emerald-900 dark:text-emerald-400 line-through decoration-emerald-500/30' : 'text-cyan-950 dark:text-white'}`}>
              {exercise_name}
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
            <span className="px-2.5 py-1 sm:py-1.5 bg-white/60 dark:bg-gray-900/50 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider text-cyan-800 dark:text-cyan-300 border border-white/40">
              🔁 {target_reps} Reps
            </span>
            {formattedDate && (
              <span className="px-2.5 py-1 sm:py-1.5 bg-white/60 dark:bg-gray-900/50 rounded-md text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-400 border border-white/40">
                📅 {formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* Action Button - Full width on mobile, auto on desktop */}
        {!is_completed ? (
          <a 
            href={`/live?exercise_id=${exercise_id}&assignment_id=${assignment_id}&name=${encodeURIComponent(exercise_name)}&reps=${target_reps}`}
            className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-center transition-all duration-200 active:scale-95 shadow-md bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-600/40 block"
          >
            ▶ Start
          </a>
        ) : (
          <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-6 py-3 sm:py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-center border border-emerald-200 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400">
            ✅ Done
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty State (Responsive) ─────────────────────────────────────
const EmptyState = () => (
  <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-md mx-2 sm:mx-0">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center mb-4 sm:mb-5 border border-cyan-200 dark:border-cyan-800">
      <span className="text-2xl sm:text-3xl">🎉</span>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-cyan-900 dark:text-cyan-400 mb-2">
      No Exercises Today
    </h3>
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium max-w-sm leading-relaxed px-4">
      You have no exercises assigned for today. Your therapist will update your plan soon.
    </p>
  </div>
);

// ─── Error State (Responsive) ─────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-md mx-2 sm:mx-0">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4 sm:mb-5 border border-red-200 dark:border-red-800">
      <span className="text-2xl sm:text-3xl">⚠️</span>
    </div>
    <h3 className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400 mb-2">Something Went Wrong</h3>
    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium max-w-sm mb-5 sm:mb-6 px-4">{message}</p>
    <button
      onClick={onRetry}
      className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-cyan-600 hover:bg-cyan-700 transition-all hover:-translate-y-0.5 shadow-md shadow-cyan-500/30 active:scale-95"
    >
      Try Again
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────
export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/get-exercise-list/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
      });

      if (res.status === 403) throw new Error('You do not have permission to view this page.');
      if (res.status === 404) throw new Error('Patient profile not found.');
      if (!res.ok)            throw new Error(`Server error (${res.status}). Please try again.`);

      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExercises(); }, []);

  const completedCount  = exercises.filter(e => e.is_completed).length;
  const total           = exercises.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const filtered = exercises.filter(e => {
    if (activeTab === 'pending') return !e.is_completed;
    if (activeTab === 'done')    return  e.is_completed;
    return true;
  });

  const tabs = [
    { key: 'all',     label: `All (${total})` },
    { key: 'pending', label: `Pending (${total - completedCount})` },
    { key: 'done',    label: `Done (${completedCount})` },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      
      <Navbar role="patient" />

      {/* Balanced max-width (3xl) keeps it from getting too wide on desktop */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {loading ? (
          <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-500 mt-2">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5 sm:space-y-6">
            
            {/* Header & Refresh */}
            <div className="flex justify-between items-center px-1">
              <h1 className="text-3xl sm:text-4xl font-black text-cyan-950 dark:text-white tracking-tight">Today's Plan</h1>
              <button
                onClick={fetchExercises}
                disabled={loading}
                className="p-2 sm:p-2.5 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700 text-cyan-700 dark:text-cyan-400 backdrop-blur-sm transition-all active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {!error && total > 0 && (
              <>
                {/* Modern Progress Card */}
                <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl p-5 sm:p-8 shadow-md">
                  <div className="flex justify-between items-end mb-3 sm:mb-4">
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-cyan-900 dark:text-cyan-400">Progress</h2>
                      <p className="text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
                        {completedCount} of {total} Completed
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl font-black text-cyan-600 dark:text-cyan-400">
                      {progressPercent}%
                    </div>
                  </div>
                  <div className="w-full h-3 sm:h-4 bg-white/50 dark:bg-gray-900 rounded-full overflow-hidden shadow-inner border border-white/30 dark:border-gray-800">
                    <div 
                      className="h-full bg-cyan-500 dark:bg-cyan-400 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 sm:gap-2 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 p-1.5 rounded-xl border border-white/40 dark:border-gray-700 shadow-sm overflow-x-auto hide-scrollbar">
                  {tabs.map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 min-w-[80px] py-2.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                        activeTab === tab.key
                          ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-sm transform scale-[1.01]'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {error && <ErrorState message={error} onRetry={fetchExercises} />}
            {!error && total === 0 && <EmptyState />}

            {/* Exercise Stack */}
            {!error && total > 0 && (
              <div className="space-y-4 pb-12 sm:pb-20">
                {filtered.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-gray-400 font-medium text-sm">
                    No exercises in this tab.
                  </div>
                ) : (
                  filtered.map((exercise, idx) => (
                    <ExerciseCard key={idx} exercise={exercise} />
                  ))
                )}

                {completedCount === total && total > 0 && (
                  <div className="text-center py-8 sm:py-10 backdrop-blur-xl bg-emerald-50/60 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-sm mt-6">
                    <div className="text-4xl sm:text-5xl mb-3">🎉</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-800 dark:text-emerald-400">All Done for Today!</h3>
                    <p className="text-sm sm:text-base font-medium text-emerald-600 dark:text-emerald-500 mt-1.5 px-4">
                      Great work! Your therapist will review your progress.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}