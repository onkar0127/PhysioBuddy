import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';

// ─── SVG Icons ─────────────────────────────────────────────────────
const Icons = {
  Patient: () => (
    <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Exercise: () => (
    <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Reps: () => (
    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  Back: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4 text-rose-500 hover:text-rose-700 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
};

const PRESET_REPS = [5, 10, 12, 15, 20, 25, 30];
const PRESET_DAYS = [
  { label: '1 Day', days: 1 },
  { label: '3 Days', days: 3 },
  { label: '5 Days', days: 5 },
  { label: '7 Days (1 Wk)', days: 7 },
  { label: '14 Days (2 Wks)', days: 14 },
  { label: '30 Days (1 Mo)', days: 30 },
];

export default function NewAssignmentForm({ onCreated }) {
  const navigate = useNavigate();

  // Selected Patient state
  const [selectedPatient, setSelectedPatient] = useState('');

  // Exercise assignments list (supports multiple exercises with individual reps and days)
  const [assignments, setAssignments] = useState([
    { id: 1, exercise: '', reps: '15', days: '7' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState(null);

  // Available data from doctor's tenant
  const [patientList, setPatientList] = useState([]);
  const [patientDetails, setPatientDetails] = useState([]);
  const [exerciseList, setExerciseList] = useState([]);
  const [exerciseDetails, setExerciseDetails] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadFormData = async () => {
      setDataLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/doctor/get-my-patients/`, { credentials: 'include' });
        if (!res.ok) throw new Error("Failed to load clinical records.");
        const data = await res.json();
        setPatientList(data.patients || []);
        setPatientDetails(data.patient_details || []);
        setExerciseList(data.exercises || []);
        setExerciseDetails(data.exercise_details || []);
      } catch (err) {
        setError("Connection failed. Please ensure the backend server is reachable.");
      } finally {
        setDataLoading(false);
      }
    };
    loadFormData();
  }, []);

  // Calculate schedule end date text for a given number of days
  const getEndDateText = (daysCount) => {
    const num = parseInt(daysCount, 10) || 1;
    const d = new Date();
    d.setDate(d.getDate() + (num - 1));
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Add another exercise item to the prescription plan
  const handleAddExerciseRow = () => {
    const nextId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) + 1 : 1;
    // Suggest first unassigned exercise if available
    const assignedExercises = assignments.map(a => a.exercise);
    const availableEx = exerciseList.find(e => !assignedExercises.includes(e)) || '';

    setAssignments(prev => [
      ...prev,
      { id: nextId, exercise: availableEx, reps: '15', days: '7' }
    ]);
  };

  // Remove an exercise item
  const handleRemoveExerciseRow = (idToRemove) => {
    if (assignments.length <= 1) return;
    setAssignments(prev => prev.filter(a => a.id !== idToRemove));
  };

  // Update a field in a specific assignment row
  const handleUpdateAssignment = (id, field, value) => {
    setAssignments(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Quick action: apply duration to all exercises
  const handleApplyDaysToAll = (days) => {
    setAssignments(prev => prev.map(item => ({ ...item, days: String(days) })));
  };

  // Quick action: apply reps to all exercises
  const handleApplyRepsToAll = (reps) => {
    setAssignments(prev => prev.map(item => ({ ...item, reps: String(reps) })));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedPatient) {
      setError("Please select a patient.");
      return;
    }

    // Validation
    for (let i = 0; i < assignments.length; i++) {
      const item = assignments[i];
      if (!item.exercise) {
        setError(`Please select an exercise for Routine #${i + 1}.`);
        return;
      }
      const reps = parseInt(item.reps, 10);
      if (!reps || reps <= 0) {
        setError(`Please enter a valid repetition count for "${item.exercise}" (Routine #${i + 1}).`);
        return;
      }
      const days = parseInt(item.days, 10);
      if (!days || days <= 0) {
        setError(`Please specify a valid duration for "${item.exercise}" (Routine #${i + 1}).`);
        return;
      }
    }

    // Check duplicate exercise selections
    const selectedExNames = assignments.map(a => a.exercise);
    const uniqueExNames = new Set(selectedExNames);
    if (uniqueExNames.size !== selectedExNames.length) {
      setError("You have selected duplicate exercises in this plan. Combine repetitions or select different exercises.");
      return;
    }

    setSubmitting(true);

    try {
      const csrftoken = await ensureCsrfToken();
      const payload = {
        patient_name: selectedPatient,
        assignments: assignments.map(a => ({
          exercise_name: a.exercise,
          repetitions: parseInt(a.reps, 10),
          days: parseInt(a.days, 10) || 1
        }))
      };

      const res = await fetch(`${API_BASE}/api/submit-assignment/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to schedule exercise assignments.");
      }

      setSuccess(true);
      setSuccessMsg(data.message || `Successfully assigned ${assignments.length} exercises to @${selectedPatient}.`);

      // Reset form
      setSelectedPatient('');
      setAssignments([{ id: 1, exercise: '', reps: '15', days: '7' }]);

      if (onCreated) onCreated();
      setTimeout(() => setSuccess(false), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatientObj = patientDetails.find(p => p.username === selectedPatient);
  const totalSessionsCount = assignments.reduce((acc, a) => acc + (parseInt(a.days, 10) || 0), 0);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      <Navbar role="doctor" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">

        {/* ─── Page Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyan-900/10 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 border border-cyan-600/20 text-xs font-bold mb-2">
              <Icons.Sparkles />
              <span>Multi-Exercise Regimen Builder</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Prescribe Exercise Routine
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Assign multiple exercises at once with custom repetitions and individual daily durations.
            </p>
          </div>
        </div>

        {/* ─── Notification Alerts ────────────────────────────────────── */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs sm:text-sm text-rose-800 dark:text-rose-300 font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 font-bold ml-2 cursor-pointer">✕</button>
          </div>
        )}

        {success && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <Icons.Check />
              </div>
              <span>{successMsg || "Exercise routine successfully scheduled and assigned!"}</span>
            </div>
            <Link to="/patient-status" className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition no-underline">
              View Status
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ─── Step 1: Patient Selection Card ─────────────────────────── */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <Icons.Patient />
                <span>1. Select Patient</span>
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                {patientList.length} patients under care
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                required
                disabled={dataLoading || submitting}
                className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition cursor-pointer"
              >
                <option value="">Choose a patient from your roster…</option>
                {patientList.map(username => {
                  const detail = patientDetails.find(p => p.username === username);
                  return (
                    <option key={username} value={username}>
                      {detail?.full_name ? `${detail.full_name} (@${username})` : `@${username}`}
                    </option>
                  );
                })}
              </select>

              {/* Patient Quick Preview Card */}
              {selectedPatientObj ? (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {(selectedPatientObj.full_name || selectedPatientObj.username)[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {selectedPatientObj.full_name || selectedPatientObj.username}
                    </p>
                    <p className="text-[11px] text-cyan-700 dark:text-cyan-400 truncate">
                      @{selectedPatientObj.username} {selectedPatientObj.phone_number ? `· 📞 ${selectedPatientObj.phone_number}` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic pl-1">
                  Select a patient to prescribe their customized exercise therapy plan.
                </p>
              )}
            </div>
          </div>

          {/* ─── Step 2: Multi-Exercise Prescription List ────────────────── */}
          <div className="space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Icons.Exercise />
                  <span>2. Prescribed Exercises ({assignments.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure specific repetitions and active day durations for each exercise.
                </p>
              </div>

              {/* Bulk Presets Tools */}
              {assignments.length > 1 && (
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span>Quick All:</span>
                    <button
                      type="button"
                      onClick={() => handleApplyDaysToAll(7)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      7d
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleApplyDaysToAll(14)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      14d
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => handleApplyRepsToAll(15)}
                      className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                    >
                      15 reps
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Exercise Row Cards */}
            <div className="space-y-4">
              {assignments.map((item, index) => {
                const parsedDays = parseInt(item.days, 10) || 1;
                const exDetail = exerciseDetails.find(e => e.name === item.exercise);

                return (
                  <div
                    key={item.id}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-lg relative transition-all hover:shadow-xl space-y-5"
                  >
                    {/* Header of Exercise Card */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-cyan-600 text-white text-xs font-black flex items-center justify-center shadow-xs">
                          {index + 1}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {item.exercise ? item.exercise : `Select Exercise #${index + 1}`}
                        </h3>
                      </div>

                      {/* Remove Button */}
                      {assignments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/60 text-xs font-bold transition cursor-pointer"
                          title="Remove this exercise from routine"
                        >
                          <Icons.Trash />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      )}
                    </div>

                    {/* Inputs Grid: Exercise Select, Reps, and Days */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                      {/* Exercise Selection (5 cols) */}
                      <div className="lg:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Icons.Exercise />
                          <span>Exercise Movement</span>
                        </label>
                        <select
                          value={item.exercise}
                          onChange={(e) => handleUpdateAssignment(item.id, 'exercise', e.target.value)}
                          required
                          disabled={submitting || dataLoading}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                        >
                          <option value="">Select from catalog…</option>
                          {exerciseList.map(exName => {
                            // Check if selected in another row
                            const isSelectedElsewhere = assignments.some(a => a.id !== item.id && a.exercise === exName);
                            return (
                              <option key={exName} value={exName} disabled={isSelectedElsewhere}>
                                {exName} {isSelectedElsewhere ? '(Already in plan)' : ''}
                              </option>
                            );
                          })}
                        </select>

                        {exDetail?.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed pl-1">
                            {exDetail.description}
                          </p>
                        )}
                      </div>

                      {/* Repetitions (3 cols) */}
                      <div className="lg:col-span-3 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Icons.Reps />
                          <span>Reps / Session</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={item.reps}
                          onChange={(e) => handleUpdateAssignment(item.id, 'reps', e.target.value)}
                          placeholder="e.g. 15"
                          required
                          disabled={submitting}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />

                        {/* Quick Rep Presets */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {[5, 10, 15, 20, 30].map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => handleUpdateAssignment(item.id, 'reps', String(preset))}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${String(item.reps) === String(preset)
                                  ? 'bg-cyan-600 text-white border-cyan-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Duration / Days (4 cols) */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Icons.Calendar />
                            <span>Duration</span>
                          </label>
                          <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
                            {parsedDays} {parsedDays === 1 ? 'day' : 'days'}
                          </span>
                        </div>

                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={item.days}
                          onChange={(e) => handleUpdateAssignment(item.id, 'days', e.target.value)}
                          placeholder="Days"
                          required
                          disabled={submitting}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />

                        {/* Quick Day Presets */}
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {PRESET_DAYS.map(p => (
                            <button
                              key={p.days}
                              type="button"
                              onClick={() => handleUpdateAssignment(item.id, 'days', String(p.days))}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${String(item.days) === String(p.days)
                                  ? 'bg-cyan-600 text-white border-cyan-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                                }`}
                            >
                              {p.label.split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Schedule date range badge */}
                    {item.exercise && (
                      <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          📅 Scheduled daily: <strong>Today</strong> → <strong>{getEndDateText(parsedDays)}</strong>
                        </span>
                        <span className="text-cyan-700 dark:text-cyan-400 font-bold">
                          {item.reps} reps/day × {parsedDays} {parsedDays === 1 ? 'day' : 'days'}
                        </span>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* + Add Exercise Button */}
            <button
              type="button"
              onClick={handleAddExerciseRow}
              className="w-full py-3.5 px-4 rounded-3xl border-2 border-dashed border-cyan-300 dark:border-cyan-700 hover:border-cyan-500 bg-white/40 dark:bg-slate-900/40 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs hover:shadow-md"
            >
              <Icons.Plus />
              <span>+ Add Another Exercise to Regimen</span>
            </button>

          </div>

          {/* ─── Step 3: Prescription Summary & Action Submit ──────────── */}
          {selectedPatient && assignments.some(a => a.exercise) && (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 animate-in fade-in">
              <div>
                <span className="text-[10px] font-black text-cyan-700 dark:text-cyan-400 uppercase tracking-widest block">
                  Prescription Summary Review
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  Routine for @{selectedPatient}
                </h3>
              </div>

              {/* Chips of exercises */}
              <div className="flex flex-wrap gap-2.5">
                {assignments.filter(a => a.exercise).map((a, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0" />
                    <span>{a.exercise}</span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-semibold">({a.reps} reps · {a.days}d)</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total of <strong>{assignments.length} exercises</strong> scheduled across <strong>{totalSessionsCount} total daily sessions</strong>.
                </p>

                <button
                  type="submit"
                  disabled={submitting || dataLoading}
                  className="px-8 py-4 rounded-2xl font-black text-sm text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 shadow-xl shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 text-center cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting Prescription…</span>
                    </>
                  ) : (
                    <>
                      <Icons.Check />
                      <span>Confirm & Schedule {assignments.length} Exercises</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>

      </main>

      <footer className="bg-white/40 dark:bg-gray-950 py-8 mt-12 border-t border-white/30 dark:border-gray-800 text-center">
        <p className="text-cyan-600 uppercase text-xs font-bold tracking-widest">
          PhysioBuddy · Doctor Clinical Workspace
        </p>
      </footer>
    </div>
  );
}
