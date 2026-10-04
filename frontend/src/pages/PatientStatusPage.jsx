import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Navbar from '../Components/Navbar';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';

// ── SVG Icons ─────────────────────────────────────────────────────
const Icons = {
  Send: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
    </svg>
  ),
  Refresh: ({ spinning }) => (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Back: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  History: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  ),
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  PatientIcon: ({ name }) => {
    const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?';
    const colors = [
      'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300',
      'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',
      'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
      'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    ];
    const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;
    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${colors[colorIdx]}`}>
        {initials}
      </div>
    );
  },
};

// ── Exercise Chip ─────────────────────────────────────────────────
const ExerciseChip = ({ exercise, reps, isCompleted, time }) => (
  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
    isCompleted
      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    <span>{exercise}</span>
    <span className="opacity-75">({reps} reps)</span>
    {time && <span className="text-[10px] opacity-60 ml-0.5">• {time}</span>}
  </div>
);

// ── Format timestamp ──────────────────────────────────────────────
const formatTime = (isoStr) => {
  const d = new Date(isoStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now - 86400000).toDateString() === d.toDateString();
  const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  if (isToday) return timeStr;
  if (isYesterday) return `Yesterday ${timeStr}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + timeStr;
};

const formatDateDivider = (isoStr) => {
  const d = new Date(isoStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (new Date(now - 86400000).toDateString() === d.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// ── Patient History & Schedule Pop-up Modal ─────────────────────────
function PatientHistoryModal({ patient, onClose, initialTab = 'history' }) {
  const [modalTab, setModalTab] = useState(initialTab); // 'history' | 'upcoming'
  const [dateFilter, setDateFilter] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'pending'

  const activeList = modalTab === 'history' ? (patient?.history || []) : (patient?.upcoming || []);

  // Extract all unique exercises from patient's history & upcoming list
  const uniqueExercises = useMemo(() => {
    const set = new Set();
    const source = [...(patient?.history || []), ...(patient?.upcoming || [])];
    source.forEach(day => {
      day.exercises.forEach(ex => set.add(ex.exercise_name));
    });
    return Array.from(set).sort();
  }, [patient]);

  // Filter the groups according to user selection
  const filteredGroups = useMemo(() => {
    return activeList
      .map(day => {
        // Date filter check
        if (dateFilter && day.date !== dateFilter) {
          return null;
        }

        // Exercise & Status filters
        const matchingExercises = day.exercises.filter(ex => {
          if (exerciseFilter !== 'all' && ex.exercise_name !== exerciseFilter) {
            return false;
          }
          if (statusFilter === 'completed' && !ex.is_completed) {
            return false;
          }
          if (statusFilter === 'pending' && ex.is_completed) {
            return false;
          }
          return true;
        });

        if (matchingExercises.length === 0) return null;

        return {
          ...day,
          exercises: matchingExercises,
          filteredCompleted: matchingExercises.filter(e => e.is_completed).length,
          filteredTotal: matchingExercises.length,
        };
      })
      .filter(Boolean);
  }, [activeList, dateFilter, exerciseFilter, statusFilter]);

  // Stats for the currently filtered view
  const totalExercisesCount = filteredGroups.reduce((sum, d) => sum + d.exercises.length, 0);
  const totalCompletedCount = filteredGroups.reduce((sum, d) => sum + d.exercises.filter(e => e.is_completed).length, 0);
  const overallRate = totalExercisesCount ? Math.round((totalCompletedCount / totalExercisesCount) * 100) : 0;

  const hasActiveFilters = dateFilter !== '' || exerciseFilter !== 'all' || statusFilter !== 'all';

  const resetFilters = () => {
    setDateFilter('');
    setExerciseFilter('all');
    setStatusFilter('all');
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!patient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3.5 min-w-0">
            <Icons.PatientIcon name={patient.full_name || patient.name} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {patient.full_name || patient.name}
                </h2>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border shrink-0 ${
                  modalTab === 'upcoming'
                    ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
                    : 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/60'
                }`}>
                  {modalTab === 'upcoming' ? 'Upcoming Schedule' : 'Assignment History'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                @{patient.name} • {patient.history?.length || 0} past {patient.history?.length === 1 ? 'day' : 'days'} • {patient.upcoming?.length || 0} upcoming {patient.upcoming?.length === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
            title="Close (Esc)"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Modal Tab Switcher (Past History vs Upcoming Sessions) */}
        <div className="px-4 sm:px-6 pt-2.5 pb-0 bg-slate-50/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => { setModalTab('history'); resetFilters(); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              modalTab === 'history'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icons.History />
            <span>Past History</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              modalTab === 'history'
                ? 'bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {patient.history?.length || 0}d
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setModalTab('upcoming'); resetFilters(); }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              modalTab === 'upcoming'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Icons.Calendar />
            <span>Upcoming Sessions</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
              modalTab === 'upcoming'
                ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {patient.upcoming?.length || 0}d
            </span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Filter by Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Filter by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                />
                {dateFilter && (
                  <button
                    type="button"
                    onClick={() => setDateFilter('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
                    title="Clear date filter"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter by Exercise */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Filter by Exercise
              </label>
              <select
                value={exerciseFilter}
                onChange={(e) => setExerciseFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Exercises ({uniqueExercises.length})</option>
                {uniqueExercises.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Completion Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed Only</option>
                <option value="pending">{modalTab === 'upcoming' ? 'Scheduled Only' : 'Uncompleted Only'}</option>
              </select>
            </div>
          </div>

          {/* Quick Active Filter Badges & Summary */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                Found: <strong className="text-slate-800 dark:text-slate-200">{totalExercisesCount}</strong> exercises across <strong className="text-slate-800 dark:text-slate-200">{filteredGroups.length}</strong> {filteredGroups.length === 1 ? 'day' : 'days'}
              </span>
              {totalExercisesCount > 0 && (
                <span className="px-2 py-0.5 rounded-md font-semibold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {totalCompletedCount}/{totalExercisesCount} ({overallRate}%) done
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Exercise Groups */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                {modalTab === 'upcoming' ? <Icons.Calendar /> : <Icons.History />}
              </div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {modalTab === 'upcoming' ? 'No matching upcoming sessions' : 'No matching assignment history'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {hasActiveFilters 
                  ? 'No exercise records match the selected date or exercise filter.'
                  : modalTab === 'upcoming'
                  ? 'This patient has no future scheduled exercises assigned yet.'
                  : 'This patient has no recorded past assigned exercises yet.'}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 shadow-2xs transition cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            filteredGroups.map((dayGroup, idx) => {
              const done = dayGroup.filteredCompleted;
              const total = dayGroup.filteredTotal;
              const isAllDone = done === total && total > 0;
              const pct = total ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-2xs space-y-3"
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        modalTab === 'upcoming'
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'
                      }`}>
                        <Icons.Calendar />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatDateDivider(dayGroup.date)}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {dayGroup.date}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                      modalTab === 'upcoming'
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50'
                        : isAllDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                    }`}>
                      {modalTab === 'upcoming' ? `${total} Scheduled` : `${done}/${total} Done (${pct}%)`}
                    </span>
                  </div>

                  {/* Exercises List for this Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dayGroup.exercises.map((ex, eIdx) => (
                      <div
                        key={eIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          ex.is_completed
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                            : modalTab === 'upcoming'
                            ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/50 text-slate-800 dark:text-slate-200'
                            : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 text-rose-950 dark:text-rose-200'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              ex.is_completed ? 'bg-emerald-500' : modalTab === 'upcoming' ? 'bg-indigo-500' : 'bg-rose-500'
                            }`} />
                            <h5 className="text-xs font-bold truncate">{ex.exercise_name}</h5>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 pl-4">
                            Target: <span className="font-semibold">{ex.reps} repetitions</span>
                            {ex.time && <span className="ml-1.5 opacity-75">• Assigned {ex.time}</span>}
                          </p>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          ex.is_completed
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            : modalTab === 'upcoming'
                            ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                            : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
                        }`}>
                          {ex.is_completed ? 'Completed' : modalTab === 'upcoming' ? 'Upcoming' : 'Uncompleted'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">Esc</kbd> to close
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ──────────────────────────────────────────
export default function PatientStatusPage2() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('compliance');
  const [historyModalPatient, setHistoryModalPatient] = useState(null);

  // Chat state
  const [allMessages, setAllMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatSearch, setChatSearch] = useState('');

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // ── Data Fetching ────────────────────────────────────────────
  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/patient-status/`, { credentials: 'include' });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setPatients(data);
      // If modal is currently open, keep its patient reference updated
      setHistoryModalPatient(prev => {
        if (!prev) return null;
        const currentP = prev.patient || prev;
        const updated = data.find(p => (p.id || p.name) === (currentP.id || currentP.name));
        return updated ? { patient: updated, initialTab: prev.initialTab || 'history' } : null;
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctor/messages/`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAllMessages(data);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchMessages();
  }, [fetchMessages]);

  // ── Scroll to bottom on new message ─────────────────────────
  useEffect(() => {
    if (selectedPatientId && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages, selectedPatientId]);

  // ── Auto-focus input when patient selected ────────────────────
  useEffect(() => {
    if (selectedPatientId && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedPatientId]);

  // ── Send Reply ───────────────────────────────────────────────
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedPatientId) return;
    setIsSending(true);
    const patientName = selectedPatient?.patientName;

    try {
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/doctor/send-message/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ patient_name: patientName, message: replyText.trim() })
      });

      if (res.ok) {
        setReplyText('');
        await fetchMessages();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // ── Mark all unread from patient as read ─────────────────────
  const markPatientMessagesRead = useCallback(async (msgs) => {
    const unread = msgs.filter(m => !m.is_read && m.sender_type !== 'doctor');
    if (!unread.length) return;

    const csrfToken = await ensureCsrfToken();
    for (const msg of unread) {
      try {
        await fetch(`${API_BASE}/api/doctor/messages/mark-read/`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
          body: JSON.stringify({ message_id: msg.id })
        });
      } catch (_) {}
    }
    setAllMessages(prev => prev.map(m =>
      unread.find(u => u.id === m.id) ? { ...m, is_read: true } : m
    ));
  }, []);

  // ── Build conversation map: patient_id → { patientName, messages[] } ──
  const conversationMap = useMemo(() => {
    const map = {};
    for (const msg of allMessages) {
      const pid = msg.patient_id;
      if (!map[pid]) {
        map[pid] = { patientId: pid, patientName: msg.patient_name, messages: [] };
      }
      map[pid].messages.push(msg);
    }
    for (const pid in map) {
      map[pid].messages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return map;
  }, [allMessages]);

  // ── Sorted patient conversation list (most recent first) ─────
  const patientList = useMemo(() => {
    return Object.values(conversationMap)
      .sort((a, b) => {
        const aLast = a.messages[a.messages.length - 1]?.created_at || '';
        const bLast = b.messages[b.messages.length - 1]?.created_at || '';
        return new Date(bLast) - new Date(aLast);
      })
      .filter(p => !chatSearch.trim() || p.patientName.toLowerCase().includes(chatSearch.toLowerCase()));
  }, [conversationMap, chatSearch]);

  const selectedPatient = selectedPatientId ? conversationMap[selectedPatientId] : null;

  const handleSelectPatient = useCallback((patientId) => {
    setSelectedPatientId(patientId);
    const convo = conversationMap[patientId];
    if (convo) markPatientMessagesRead(convo.messages);
  }, [conversationMap, markPatientMessagesRead]);

  // ── Date dividers in conversation ────────────────────────────
  const messagesWithDividers = useMemo(() => {
    if (!selectedPatient) return [];
    const result = [];
    let lastDate = null;
    for (const msg of selectedPatient.messages) {
      const d = new Date(msg.created_at).toDateString();
      if (d !== lastDate) {
        result.push({ type: 'divider', date: msg.created_at, id: `divider-${msg.created_at}` });
        lastDate = d;
      }
      result.push({ type: 'message', ...msg });
    }
    return result;
  }, [selectedPatient]);

  // ── Stats ────────────────────────────────────────────────────
  const allTodayExercises = patients.flatMap(p => p.assigned_exercises || []);
  const totalEx = allTodayExercises.length;
  const completedEx = allTodayExercises.filter(ex => ex.is_completed).length;
  const rate = totalEx ? Math.round((completedEx / totalEx) * 100) : 0;
  const totalHistoricalCount = patients.reduce((sum, p) => sum + (p.total_history_count || 0), 0);

  const unreadCount = useMemo(
    () => allMessages.filter(m => !m.is_read && m.sender_type !== 'doctor').length,
    [allMessages]
  );

  const filteredPatients = patients.filter(p => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.full_name?.toLowerCase().includes(q) ||
      (p.assigned_exercises && p.assigned_exercises.some(ex => ex.exercise_name.toLowerCase().includes(q))) ||
      (p.history && p.history.some(h => h.exercises.some(ex => ex.exercise_name.toLowerCase().includes(q))))
    );
  });

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 overflow-hidden font-[Inter]">
      <Navbar role="doctor" />

      <main className="flex-1 overflow-hidden flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 gap-4">

        {/* ─── Page Header ────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Patient Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Monitor exercise compliance, view assignment history pop-up, and chat with patients'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { fetchStatus(); fetchMessages(); }}
            disabled={loading || messagesLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Icons.Refresh spinning={loading || messagesLoading} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ─── Tab Bar ─────────────────────────────────────────── */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('compliance'); setSearch(''); }}
            className={`pb-3 px-5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'compliance'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Patient Compliance & History</span>
            {patients.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {patients.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('messages'); setChatSearch(''); }}
            className={`pb-3 px-5 text-sm font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Patient Inbox</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ─── Compliance Tab ───────────────────────────────────── */}
        {activeTab === 'compliance' && (
          <div className="flex-1 overflow-y-auto min-h-0 space-y-5 pb-6">

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              {[
                { label: "Today's Exercises", value: totalEx, color: 'text-cyan-600 dark:text-cyan-400' },
                { label: 'Completed Today', value: completedEx, color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Today Compliance', value: `${rate}%`, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Past Recorded Tasks', value: totalHistoricalCount, color: 'text-violet-600 dark:text-violet-400' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                  <div className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Patient Search */}
            <div className="relative shrink-0">
              <span className="absolute left-3 top-2.5 pointer-events-none text-slate-400">
                <Icons.Search />
              </span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by patient name, exercise, or history…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition shadow-xs"
              />
            </div>

            {loading && <div className="text-center py-12 text-slate-500 text-sm font-medium">Loading patients…</div>}
            {error && <div className="text-center py-8 text-rose-500 text-sm font-medium">{error}</div>}

            {!loading && filteredPatients.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Icons.History />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No patients found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {search ? 'Try adjusting your search query or filter.' : 'No patients have been assigned to your profile yet.'}
                </p>
              </div>
            )}

            {/* Patient Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {filteredPatients.map((patient, idx) => {
                const pKey = patient.id || patient.name || idx;
                const todayExercises = patient.assigned_exercises || [];
                const done = todayExercises.filter(ex => ex.is_completed).length;
                const total = todayExercises.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const historyList = patient.history || [];

                return (
                  <div
                    key={pKey}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    {/* Patient Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Icons.PatientIcon name={patient.full_name || patient.name} />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {patient.full_name || patient.name}
                          </h3>
                          {patient.full_name && patient.full_name !== patient.name && (
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">@{patient.name}</p>
                          )}
                        </div>
                      </div>

                      {/* Today & Upcoming Status Pills */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {patient.upcoming && patient.upcoming.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setHistoryModalPatient({ patient, initialTab: 'upcoming' })}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 hover:bg-indigo-100 transition cursor-pointer"
                            title="View upcoming scheduled sessions"
                          >
                            📅 {patient.total_upcoming_count} upcoming
                          </button>
                        )}
                        {total > 0 ? (
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            pct === 100
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40'
                          }`}>
                            {done}/{total} done
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            No tasks today
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Today's Exercises Section */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        <span>Today's Exercises</span>
                        {total > 0 && <span className="text-[11px] font-normal text-slate-400">{pct}%</span>}
                      </div>

                      {total > 0 ? (
                        <>
                          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2.5">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {todayExercises.map((ex, eIdx) => (
                              <ExerciseChip
                                key={eIdx}
                                exercise={ex.exercise_name}
                                reps={ex.reps}
                                isCompleted={ex.is_completed}
                                time={ex.time}
                              />
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
                          No exercises assigned for today
                        </div>
                      )}
                    </div>

                    {/* Old Assigned History & Schedule Modal Trigger */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium flex-wrap">
                        <span className="flex items-center gap-1">
                          <Icons.History />
                          <span>{historyList.length} past {historyList.length === 1 ? 'day' : 'days'}</span>
                        </span>
                        {patient.upcoming && patient.upcoming.length > 0 && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-0.5">
                            • <span>{patient.upcoming.length} upcoming</span>
                          </span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => setHistoryModalPatient({ patient, initialTab: 'history' })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800 dark:hover:bg-cyan-950/40 text-slate-700 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 text-xs font-semibold shadow-2xs transition cursor-pointer"
                      >
                        <Icons.History />
                        <span>History & Schedule</span>
                        <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ─── Patient History Pop-up Modal ────────────────────── */}
        {historyModalPatient && (
          <PatientHistoryModal
            patient={historyModalPatient.patient || historyModalPatient}
            initialTab={historyModalPatient.initialTab || 'history'}
            onClose={() => setHistoryModalPatient(null)}
          />
        )}

        {/* ─── Messages / Patient Inbox Tab ────────────────────── */}
        {activeTab === 'messages' && (
          <div className="flex-1 min-h-0 flex gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">

            {/* ── Left Sidebar: Patient Conversation List ── */}
            <div className={`w-full sm:w-72 lg:w-80 flex flex-col border-r border-slate-200 dark:border-slate-800 shrink-0 ${selectedPatientId ? 'hidden sm:flex' : 'flex'}`}>

              {/* Sidebar Header */}
              <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Patient Messages</h2>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 pointer-events-none text-slate-400">
                    <Icons.Search />
                  </span>
                  <input
                    type="text"
                    value={chatSearch}
                    onChange={e => setChatSearch(e.target.value)}
                    placeholder="Search patients…"
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Patient List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {messagesLoading && (
                  <div className="p-6 text-center text-xs text-slate-500">Loading conversations…</div>
                )}

                {!messagesLoading && patientList.length === 0 && (
                  <div className="p-8 text-center">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">No patient messages yet.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Messages from patients will appear here.</p>
                  </div>
                )}

                {patientList.map(convo => {
                  const lastMsg = convo.messages[convo.messages.length - 1];
                  const unread = convo.messages.filter(m => !m.is_read && m.sender_type !== 'doctor').length;
                  const isActive = selectedPatientId === convo.patientId;

                  return (
                    <button
                      key={convo.patientId}
                      type="button"
                      onClick={() => handleSelectPatient(convo.patientId)}
                      className={`w-full px-4 py-3.5 flex items-start gap-3 text-left border-b border-slate-100 dark:border-slate-800/60 transition cursor-pointer ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="relative">
                        <Icons.PatientIcon name={convo.patientName} />
                        {unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className={`text-xs font-semibold truncate ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-white'}`}>
                            {convo.patientName}
                          </span>
                          {lastMsg && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                              {formatTime(lastMsg.created_at)}
                            </span>
                          )}
                        </div>
                        {lastMsg && (
                          <p className={`text-[11px] truncate ${unread > 0 ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                            {lastMsg.sender_type === 'doctor' ? 'You: ' : ''}{lastMsg.content}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Right Panel: Chat Window ── */}
            <div className={`flex-1 min-w-0 flex flex-col ${selectedPatientId ? 'flex' : 'hidden sm:flex'}`}>

              {!selectedPatient ? (
                /* Empty state when no patient selected */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select a conversation</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                    Choose a patient from the left panel to read their messages and reply.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shrink-0 bg-white dark:bg-slate-900">
                    {/* Back button (mobile) */}
                    <button
                      type="button"
                      onClick={() => setSelectedPatientId(null)}
                      className="sm:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Icons.Back />
                    </button>

                    <Icons.PatientIcon name={selectedPatient.patientName} />

                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {selectedPatient.patientName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedPatient.messages.length} messages in conversation
                      </p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4 space-y-1">
                    {messagesWithDividers.map(item => {
                      if (item.type === 'divider') {
                        return (
                          <div key={item.id} className="flex items-center gap-3 py-3">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium px-2">
                              {formatDateDivider(item.date)}
                            </span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                          </div>
                        );
                      }

                      const isDoctor = item.sender_type === 'doctor';
                      return (
                        <div key={item.id} className={`flex items-end gap-2 ${isDoctor ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isDoctor && (
                            <div className="mb-1 shrink-0">
                              <Icons.PatientIcon name={selectedPatient.patientName} />
                            </div>
                          )}

                          <div className={`max-w-[72%] ${isDoctor ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
                              isDoctor
                                ? 'bg-cyan-600 text-white rounded-br-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200 dark:border-slate-700'
                            }`}>
                              {item.content}
                            </div>
                            <div className="flex items-center gap-1.5 px-1">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {formatTime(item.created_at)}
                              </span>
                              {isDoctor && item.is_read && (
                                <span className="text-[10px] text-cyan-400 dark:text-cyan-500 font-medium">
                                  Read
                                </span>
                              )}
                            </div>
                          </div>

                          {isDoctor && (
                            <div className="mb-1 shrink-0 w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center">
                              <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">Dr</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* ── Reply Input ── */}
                  <div className="px-4 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-end gap-2.5">
                      <div className="flex-1 relative">
                        <textarea
                          ref={inputRef}
                          rows={1}
                          value={replyText}
                          onChange={(e) => {
                            setReplyText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendReply();
                            }
                          }}
                          placeholder={`Reply to ${selectedPatient.patientName}…`}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none overflow-hidden"
                          style={{ minHeight: '42px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={isSending || !replyText.trim()}
                        className="h-10 w-10 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition shadow-sm disabled:cursor-not-allowed cursor-pointer shrink-0"
                        title="Send message (Enter)"
                      >
                        <Icons.Send />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 pl-1">
                      Press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[9px]">Shift+Enter</kbd> for new line
                    </p>
                  </div>
                </>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
