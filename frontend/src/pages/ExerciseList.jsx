import React, { useState, useEffect } from 'react';

// ─── Status Badge ─────────────────────────────────────────────────
const StatusBadge = ({ completed }) =>
  completed ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Exercise Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
      <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500" />
      Incomplete
    </span>
  );

// ─── Skeleton Loader ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
    <div className="flex-1 space-y-3 w-full">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
    </div>
    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
  </div>
);

// ─── Exercise Card ────────────────────────────────────────────────
const ExerciseCard = ({ exercise }) => {
  const { exercise_id, assignment_id, exercise_name, target_reps, is_completed, date_assigned } = exercise;

  const formattedDate = date_assigned
    ? new Date(date_assigned).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
        is_completed
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {is_completed && (
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${
            is_completed
              ? 'text-emerald-800 dark:text-emerald-300 line-through decoration-emerald-400'
              : 'text-cyan-900 dark:text-cyan-300'
          }`}
        >
          {exercise_name}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {target_reps} reps
          {formattedDate && (
            <span className="ml-3 text-xs text-gray-400 dark:text-gray-500">
              · Assigned {formattedDate}
            </span>
          )}
        </p>

        <div className="mt-3">
          <StatusBadge completed={is_completed} />
        </div>
      </div>

      {/* Native <a> tag instead of React Router <Link> */}
      {!is_completed && (
        <a
          href={`/live?exercise_id=${exercise_id}&assignment_id=${assignment_id}&name=${encodeURIComponent(exercise_name)}&reps=${target_reps}`}
          className="flex-shrink-0 text-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          ▶ Start
        </a>
      )}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-cyan-300 dark:text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-cyan-900 dark:text-cyan-400 mb-2">
      No Exercises Today
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
      You have no exercises assigned for today. Your therapist will update your plan soon.
    </p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-red-400 dark:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400 mb-2">Something Went Wrong</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
    >
      Try Again
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────
export default function AssignedExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // ── Fetch from Django API ──────────────────────────────────────
  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/get-exercise-list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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

  // ── Derived stats ──────────────────────────────────────────────
  const completedCount  = exercises.filter(e => e.is_completed).length;
  const total           = exercises.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // ── Tab filtering ──────────────────────────────────────────────
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter] transition-colors duration-500">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-extrabold text-cyan-900 dark:text-cyan-400 tracking-tight">
              My Exercises
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Today's Plan</span>
            <button
              onClick={fetchExercises}
              disabled={loading}
              title="Refresh"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <ErrorState message={error} onRetry={fetchExercises} />
        )}

        {!loading && !error && total === 0 && <EmptyState />}

        {!loading && !error && total > 0 && (
          <>
            {/* Progress Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-900 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest mb-1">Today's Progress</p>
                  <p className="text-4xl font-extrabold">
                    {completedCount}
                    <span className="text-2xl font-semibold text-cyan-200">/{total}</span>
                  </p>
                  <p className="text-cyan-100 text-sm mt-1">exercises completed</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke="white" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Exercise Cards */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600 font-semibold">
                  No exercises in this category.
                </div>
              ) : (
                filtered.map((exercise, idx) => (
                  <ExerciseCard key={idx} exercise={exercise} />
                ))
              )}
            </div>

            {/* All done banner */}
            {completedCount === total && (
              <div className="text-center py-10 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">All Done for Today!</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                  Great work! Your therapist will review your progress.
                </p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}