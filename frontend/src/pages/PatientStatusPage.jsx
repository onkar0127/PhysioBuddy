import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Import shared component
import pb from "../assets/pb.png";

const API_BASE = 'http://127.0.0.1:8000';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

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
  const [activeTab, setActiveTab] = useState('compliance');
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

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

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/doctor/messages/`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/doctor/messages/mark-read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ message_id: messageId })
      });
      if (res.ok) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
      }
    } catch (err) {
      console.error("Failed to mark message as read", err);
    }
  };

  useEffect(() => { 
    fetchStatus();
    fetchMessages();
  }, []);

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

  const filteredMessages = messages.filter(m =>
    search.trim() === '' ? true :
    m.patient_name.toLowerCase().includes(search.toLowerCase()) ||
    m.content.toLowerCase().includes(search.toLowerCase())
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
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Manage clinical status and view direct messages.'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center gap-2 max-w-md mx-auto mb-8 p-1.5 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-white/40 dark:border-gray-700 rounded-2xl shadow-sm">
            <button
              onClick={() => { setActiveTab('compliance'); setSearch(''); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'compliance'
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-md scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              📈 Compliance Status
            </button>
            <button
              onClick={() => { setActiveTab('messages'); setSearch(''); }}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 relative ${
                activeTab === 'messages'
                  ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-md scale-[1.02]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              💬 Patient Inbox
              {messages.some(m => !m.is_read) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
              )}
            </button>
          </div>

          {activeTab === 'compliance' && (
            <>
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
            </>
          )}

          {/* Search Input */}
          <div className="flex flex-wrap gap-3 items-center w-full mb-8">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={activeTab === 'compliance' ? "Search patient or exercise…" : "Search sender or message content…"}
              className="w-full px-6 py-4 rounded-2xl bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-white/60 dark:border-gray-700 text-cyan-950 dark:text-gray-100 text-lg font-bold shadow-lg focus:ring-2 focus:ring-cyan-500 outline-none transition placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          {activeTab === 'compliance' ? (
            <>
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
            </>
          ) : (
            <>
              {messagesLoading && <div className="text-center p-12 text-cyan-700 dark:text-cyan-300 font-bold animate-pulse">Loading messages...</div>}
              
              <div className="space-y-4 w-full">
                {filteredMessages.length === 0 ? (
                  <div className="text-center p-12 text-gray-500 dark:text-gray-400 font-bold bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl">
                    No messages found in your inbox.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`backdrop-blur-xl border p-6 rounded-[1.5rem] flex flex-col gap-3 shadow-xl transition-all duration-300 ${
                          msg.is_read 
                            ? 'bg-white/50 dark:bg-gray-800/50 border-white/60 dark:border-gray-700' 
                            : 'bg-cyan-50/70 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800/60 shadow-cyan-900/5'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center text-lg border border-cyan-200 dark:border-cyan-800 shadow-inner">
                              👤
                            </div>
                            <div>
                              <h4 className="font-black text-cyan-950 dark:text-white text-base">{msg.patient_name}</h4>
                              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                {new Date(msg.created_at).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => !msg.is_read && markAsRead(msg.id)}
                            disabled={msg.is_read}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 ${
                              msg.is_read
                                ? 'bg-gray-150 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed shadow-none'
                                : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            }`}
                          >
                            {msg.is_read ? 'Read' : 'Mark as Read'}
                          </button>
                        </div>
                        
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white/30 dark:bg-gray-900/20 p-4 rounded-xl border border-white/20 dark:border-gray-800">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}