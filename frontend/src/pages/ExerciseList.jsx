import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../Components/Navbar'; 
import { API_BASE } from '../config'; 

// ─── SVG Icons (Clean & Professional) ──────────────────────────────
const Icons = {
  Play: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  Video: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Cross: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Doctor: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Reps: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Refresh: ({ spinning }) => (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Empty: () => (
    <svg className="w-12 h-12 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

// ─── Skeleton Loader ───────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-5 sm:p-6 space-y-4">
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
        <div className="h-3.5 bg-slate-100 dark:bg-slate-700/60 rounded-md w-2/3" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 bg-slate-100 dark:bg-slate-700/60 rounded-md w-20" />
          <div className="h-6 bg-slate-100 dark:bg-slate-700/60 rounded-md w-28" />
        </div>
      </div>
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-32 shrink-0" />
    </div>
  </div>
);

// ─── Video Demo Modal ──────────────────────────────────────────────
const VideoModal = ({ isOpen, onClose, exercise }) => {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden p-5 sm:p-6 space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {exercise.exercise_name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prescribed exercise video demonstration
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
          {exercise.exercise_video_url ? (
            exercise.exercise_video_url.includes('youtube') || exercise.exercise_video_url.includes('youtu.be') ? (
              <iframe
                src={exercise.exercise_video_url.replace('watch?v=', 'embed/')}
                title={exercise.exercise_name}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={exercise.exercise_video_url}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Icons.Video />
              <p className="text-sm font-medium mt-2">No video demonstration available.</p>
            </div>
          )}
        </div>

        {exercise.exercise_description && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong className="block text-slate-900 dark:text-white font-semibold mb-1">
              Instructions:
            </strong>
            {exercise.exercise_description}
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Close
          </button>
          <a
            href={`/live?exercise_id=${exercise.exercise_id}&assignment_id=${exercise.assignment_id}&name=${encodeURIComponent(exercise.exercise_name)}&reps=${exercise.target_reps}`}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition shadow-sm flex items-center gap-1.5 no-underline"
          >
            <Icons.Play />
            <span>Start Exercise</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// ─── Format Date Header ───────────────────────────────────────────
const formatDateHeader = (dateStr) => {
  if (!dateStr || dateStr === 'undated') return 'Unscheduled Date';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

    let prefix = '';
    if (target.getTime() === today.getTime()) prefix = 'Today • ';
    else if (target.getTime() === tomorrow.getTime()) prefix = 'Tomorrow • ';
    else if (target.getTime() === yesterday.getTime()) prefix = 'Yesterday • ';

    return prefix + d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
};

// ─── Exercise Card (Clean, Medical & Human) ─────────────────────────
const ExerciseCard = ({ exercise, onWatchDemo }) => {
  const {
    exercise_id,
    assignment_id,
    exercise_name,
    exercise_description,
    exercise_video_url,
    target_reps,
    is_completed,
    is_uncompleted,
    date_assigned,
    assigned_time,
    assigned_by_doctor,
    is_today,
    is_future,
  } = exercise;

  const isPastUncompleted = is_uncompleted || (!is_today && !is_future && !is_completed);

  const dateObj = date_assigned ? new Date(date_assigned) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className={`border rounded-2xl p-3.5 sm:p-6 transition-all duration-200 overflow-hidden ${
      is_completed
        ? 'bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200/70 dark:border-emerald-800/40'
        : isPastUncompleted
        ? 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-900/40 shadow-xs'
        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/60 shadow-xs hover:border-cyan-300 dark:hover:border-cyan-700'
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        
        {/* Left Side: Exercise Details */}
        <div className="flex-1 min-w-0 space-y-2">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {exercise_name}
            </h3>

            {is_completed ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300">
                <Icons.Check /> Completed
              </span>
            ) : isPastUncompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                <Icons.Cross /> Uncompleted
              </span>
            ) : is_today ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                Today
              </span>
            ) : is_future ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                <Icons.Calendar /> Upcoming
              </span>
            ) : null}
          </div>

          {is_today && exercise_description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
              {exercise_description}
            </p>
          )}

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 pt-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
              <Icons.Reps />
              <strong>{target_reps}</strong> reps
            </span>

            {assigned_by_doctor && (
              <span className="flex items-center gap-1">
                <Icons.Doctor />
                <span>Dr. {assigned_by_doctor.replace(/^Dr\.\s*/i, '')}</span>
              </span>
            )}

            {formattedDate && !is_today && (
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium truncate max-w-[180px] sm:max-w-none">
                <Icons.Calendar />
                <span className="truncate">{formattedDate} {assigned_time ? `• ${assigned_time}` : ''}</span>
              </span>
            )}

            {exercise_video_url && (
              <button
                type="button"
                onClick={() => onWatchDemo(exercise)}
                className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold cursor-pointer transition hover:underline"
              >
                <Icons.Video />
                <span>Watch demo</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Side: Action Button (Only for Today's scheduled routine) */}
        {is_today && (
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/50">
            {!is_completed ? (
              <a 
                href={`/live?exercise_id=${exercise_id}&assignment_id=${assignment_id}&name=${encodeURIComponent(exercise_name)}&reps=${target_reps}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-700 active:bg-cyan-800 transition-colors shadow-xs flex items-center justify-center gap-1.5 no-underline cursor-pointer"
              >
                <Icons.Play />
                <span>Start Exercise</span>
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Icons.Check /> Done
                </span>
                <a
                  href={`/live?exercise_id=${exercise_id}&assignment_id=${assignment_id}&name=${encodeURIComponent(exercise_name)}&reps=${target_reps}`}
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition hover:underline no-underline"
                >
                  Practice again
                </a>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// ─── Main Page Component ───────────────────────────────────────────
export default function ExerciseList() {
  const [dataPayload, setDataPayload] = useState({ today: [], upcoming: [], history: [], all: [], stats: null });
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  
  // Navigation & Filtering
  const [activeTab, setActiveTab]     = useState('today'); // 'today' | 'upcoming' | 'history'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Video Modal
  const [activeVideoExercise, setActiveVideoExercise] = useState(null);

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/get-exercise-list/`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', 
      });

      if (res.status === 401) throw new Error('Please sign in to view your prescribed exercises.');
      if (res.status === 403) throw new Error('You do not have permission to view this page.');
      if (res.status === 404) throw new Error('Patient profile not found.');
      if (!res.ok)            throw new Error(`Server error (${res.status}). Please try again.`);

      const data = await res.json();
      
      if (Array.isArray(data)) {
        const today = data.filter(e => e.is_today || false);
        const upcoming = data.filter(e => e.is_future || false);
        const history = data.filter(e => e.is_past || (!e.is_today && !e.is_future));
        setDataPayload({
          today,
          upcoming,
          history,
          all: data,
          stats: {
            total_assigned: data.length,
            total_completed: data.filter(e => e.is_completed).length,
            today_total: today.length,
            today_completed: today.filter(e => e.is_completed).length,
            upcoming_total: upcoming.length,
            history_total: history.length,
            history_completed: history.filter(e => e.is_completed).length,
            completion_rate: data.length ? Math.round((data.filter(e => e.is_completed).length / data.length) * 100) : 0
          }
        });
      } else {
        setDataPayload({
          today: data.today || [],
          upcoming: data.upcoming || [],
          history: data.history || [],
          all: data.all || [],
          stats: data.stats || null,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchExercises(); 
  }, []);

  // Filtered exercises based on tab, status, and search
  const filteredExercises = useMemo(() => {
    let list = [];
    if (activeTab === 'today') list = dataPayload.today;
    else if (activeTab === 'upcoming') list = dataPayload.upcoming;
    else list = dataPayload.history;

    return list.filter(item => {
      if (statusFilter === 'pending' && item.is_completed) return false;
      if (statusFilter === 'completed' && !item.is_completed) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.exercise_name?.toLowerCase().includes(q);
        const matchesDoctor = item.assigned_by_doctor?.toLowerCase().includes(q);
        const matchesDesc = item.exercise_description?.toLowerCase().includes(q);
        if (!matchesName && !matchesDoctor && !matchesDesc) return false;
      }

      return true;
    });
  }, [dataPayload, activeTab, statusFilter, searchQuery]);

  // Group exercises by date for history and upcoming tabs
  const groupedExercises = useMemo(() => {
    if (activeTab === 'today') {
      return null;
    }

    const groups = {};
    filteredExercises.forEach(item => {
      let dateKey = 'undated';
      if (item.date_assigned) {
        dateKey = item.date_assigned.split('T')[0];
      }
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date: dateKey,
          items: []
        };
      }
      groups[dateKey].items.push(item);
    });

    const sortedGroups = Object.values(groups);
    if (activeTab === 'upcoming') {
      // Ascending (nearest date first)
      sortedGroups.sort((a, b) => (a.date > b.date ? 1 : -1));
    } else {
      // Descending (most recent past date first)
      sortedGroups.sort((a, b) => (a.date < b.date ? 1 : -1));
    }

    return sortedGroups;
  }, [filteredExercises, activeTab]);

  const todayCount = dataPayload.today.length;
  const upcomingCount = dataPayload.upcoming.length;
  const historyCount = dataPayload.history.length;
  const todayCompleted = dataPayload.today.filter(e => e.is_completed).length;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter] overflow-x-hidden">
      
      <Navbar role="patient" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-3 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 overflow-x-hidden">

        {/* ─── Page Header ─────────────────────────────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
              My Physical Therapy Plan
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • Follow your prescribed routine
            </p>
          </div>

          <button
            type="button"
            onClick={fetchExercises}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
          >
            <Icons.Refresh spinning={loading} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ─── Natural Daily Progress Bar (Clean & Helpful) ────────── */}
        {!loading && !error && todayCount > 0 && (
          <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-3.5 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-[11px] sm:text-sm gap-2">
              <span className="font-semibold text-slate-900 dark:text-white truncate">
                Today's Progress: {todayCompleted}/{todayCount} done
              </span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                {Math.round((todayCompleted / todayCount) * 100)}%
              </span>
            </div>
            
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(todayCompleted / todayCount) * 100}%` }}
              />
            </div>

            {todayCompleted === todayCount && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium pt-0.5">
                ✓ Great work! You have finished all prescribed exercises for today.
              </p>
            )}
          </div>
        )}

        {/* ─── Navigation Tabs & Filters ───────────────────────────── */}
        <div className="space-y-3">
          
          {/* Main Tabs (Today / Upcoming / History) */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-700/80 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <button
              type="button"
              onClick={() => { setActiveTab('today'); setStatusFilter('all'); }}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 rounded-none bg-transparent cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'today'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="sm:hidden">Today</span>
              <span className="hidden sm:inline">Today's Exercises</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                activeTab === 'today'
                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {todayCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('upcoming'); setStatusFilter('all'); }}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 rounded-none bg-transparent cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'upcoming'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="sm:hidden">Upcoming</span>
              <span className="hidden sm:inline">Upcoming Sessions</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                activeTab === 'upcoming'
                  ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {upcomingCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('history'); setStatusFilter('all'); }}
              className={`pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold transition-all border-b-2 rounded-none bg-transparent cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                activeTab === 'history'
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span className="sm:hidden">History</span>
              <span className="hidden sm:inline">Past Sessions</span>
              <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                activeTab === 'history'
                  ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {historyCount}
              </span>
            </button>
          </div>

          {/* Sub Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2.5 items-stretch sm:items-center justify-between pt-1">
            
            {/* Status Pills */}
            <div className="flex gap-1.5">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: activeTab === 'history' ? 'Uncompleted' : 'To Do' },
                { key: 'completed', label: 'Completed' }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    statusFilter === f.key
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Clean Search Input */}
            <div className="relative w-full sm:min-w-[200px] sm:w-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              />
              <span className="absolute left-2.5 top-2 pointer-events-none">
                <Icons.Search />
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

        </div>

        {/* ─── Main Content / Exercise Cards ───────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 rounded-2xl p-8 text-center space-y-3">
            <h3 className="text-base font-bold text-red-900 dark:text-red-300">
              Unable to load exercises
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              {error}
            </p>
            <button
              type="button"
              onClick={fetchExercises}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : filteredExercises.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-10 sm:p-14 text-center space-y-3">
            <div className="flex justify-center">
              <Icons.Empty />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200">
              {activeTab === 'today'
                ? (statusFilter === 'all' ? 'No exercises scheduled for today' : `No ${statusFilter} exercises for today`)
                : activeTab === 'upcoming'
                ? (statusFilter === 'all' ? 'No upcoming sessions scheduled' : `No upcoming ${statusFilter} exercises`)
                : (statusFilter === 'all' ? 'No past sessions recorded' : `No past ${statusFilter} exercises`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {activeTab === 'today'
                ? "You're all set! If your therapist prescribes new routines, they will appear here automatically."
                : activeTab === 'upcoming'
                ? "You do not have any future sessions scheduled at the moment."
                : "Your past physical therapy sessions and exercise logs will be preserved here."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Clear search filter
              </button>
            )}
          </div>
        ) : groupedExercises ? (
          /* Grouped Exercise List by Date for Past and Upcoming */
          <div className="space-y-6 pb-12">
            {groupedExercises.map((group) => {
              const total = group.items.length;
              const completed = group.items.filter(i => i.is_completed).length;
              const pct = total ? Math.round((completed / total) * 100) : 0;
              const isAllDone = completed === total && total > 0;

              return (
                <div key={group.date} className="space-y-3">
                  {/* Date Group Header */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-2xs overflow-hidden">
                    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-xl shrink-0 ${
                        activeTab === 'upcoming'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                          : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400'
                      }`}>
                        <Icons.Calendar />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-[11px] sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {formatDateHeader(group.date)}
                        </h2>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                          {group.date}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border shrink-0 whitespace-nowrap ${
                      activeTab === 'upcoming'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
                        : isAllDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                    }`}>
                      {activeTab === 'upcoming' 
                        ? `${total} Scheduled` 
                        : `${completed}/${total} (${pct}%)`}
                    </span>
                  </div>

                  {/* Exercises for this Date */}
                  <div className="space-y-3 pl-2 sm:pl-3 border-l-2 border-slate-200/70 dark:border-slate-700/50">
                    {group.items.map((ex) => (
                      <ExerciseCard 
                        key={ex.assignment_id} 
                        exercise={ex} 
                        onWatchDemo={(item) => setActiveVideoExercise(item)} 
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Exercise List for Today */
          <div className="space-y-3.5 pb-12">
            {filteredExercises.map((ex) => (
              <ExerciseCard 
                key={ex.assignment_id} 
                exercise={ex} 
                onWatchDemo={(item) => setActiveVideoExercise(item)} 
              />
            ))}
          </div>
        )}

      </main>

      {/* ─── Video Demonstration Modal ─────────────────────────────── */}
      <VideoModal
        isOpen={Boolean(activeVideoExercise)}
        onClose={() => setActiveVideoExercise(null)}
        exercise={activeVideoExercise}
      />

    </div>
  );
}