import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // 1. Import shared Navbar

const API_BASE = 'http://127.0.0.1:8000';

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

export default function NewAssignmentForm({ onCreated }) {
  const [form, setForm] = useState({ patient: '', exercise: '', reps: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

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

      if (!res.ok) throw new Error("Failed to save assignment.");
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

  // Trendy form styles
  const inputStyle = "w-full pl-14 pr-6 py-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all duration-300";

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      <Navbar role="doctor" /> {/* 2. Implementation: Shared Navbar */}

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <h2 className="text-5xl font-black text-cyan-950 dark:text-white tracking-tighter">Assign Task</h2>
            <p className="text-gray-500 mt-2 font-medium">Create a new rehab plan for your patient.</p>
          </div>

          <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 border border-white/20 dark:border-gray-700 rounded-[2.5rem] p-8 shadow-2xl space-y-6">

            {/* Patient Select */}
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-60 group-hover:scale-110 transition-transform">👤</span>
              <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required className={`${inputStyle} appearance-none`}>
                <option value="">Select a patient</option>
                {patients.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            {/* Exercise Select */}
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-60 group-hover:scale-110 transition-transform">🏋️</span>
              <select value={form.exercise} onChange={(e) => setForm({ ...form, exercise: e.target.value })} required className={`${inputStyle} appearance-none`}>
                <option value="">Select an exercise</option>
                {exercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </select>
            </div>

            {/* Reps Input - Manual Entry */}
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl opacity-60">🔁</span>
              <input
                type="number"
                min="1"
                value={form.reps}
                onChange={(e) => {
                  const val = e.target.value;
                  // Prevent manual entry of negative numbers
                  if (val === "" || parseInt(val, 10) >= 0) {
                    setForm({ ...form, reps: val });
                  }
                }}
                placeholder="Enter total reps "
                required
                className={`${inputStyle} pl-14`}
              />
            </div>

            {error && <div className="text-red-500 text-sm font-bold bg-red-500/10 p-4 rounded-xl border border-red-500/20">⚠️ {error}</div>}
            {success && <div className="text-emerald-500 text-sm font-bold bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">✅ Assignment logged successfully!</div>}

            <button type="submit" disabled={submitting || dataLoading} className="w-full py-5 rounded-2xl text-lg font-black uppercase tracking-widest text-white bg-cyan-600 hover:bg-cyan-700 shadow-xl shadow-cyan-600/20 hover:shadow-cyan-600/40 transition-all active:scale-[0.98]">
              {submitting ? 'Syncing...' : 'Confirm Assignment'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}