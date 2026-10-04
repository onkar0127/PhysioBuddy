import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Components/Navbar';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';

// ── Icons (matching ExerciseList SVG style) ───────────────────────
const Icons = {
  Send: () => (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),
  Refresh: ({ spinning }) => (
    <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-6 h-6 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Warning: () => (
    <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
};

export default function CustomerCare() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General Consultation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const messagesContainerRef = useRef(null);

  const quickTopics = [
    { label: 'Sharp Pain', value: 'Pain during exercises' },
    { label: 'Too Difficult', value: 'Exercise difficulty adjustment' },
    { label: 'Schedule Change', value: 'Routine adjustment' },
    { label: 'Camera Issue', value: 'Camera or tracking issue' },
    { label: 'General', value: 'General Consultation' },
  ];

  const faqs = [
    {
      q: "What should I do if an exercise causes sharp pain?",
      a: "Stop the movement immediately. Mild muscular fatigue is normal, but sharp, shooting, or joint pain is a sign to rest. Send a direct message to your therapist using the chat above describing the pain location."
    },
    {
      q: "How does the AI camera track my repetitions?",
      a: "Our computer vision engine uses MediaPipe pose tracking locally on your device to analyze key body joint angles (elbows, shoulders, hips, knees). It checks your alignment in real-time and registers completed reps."
    },
    {
      q: "Can I practice exercises outside my daily scheduled time?",
      a: "Yes! You can review past exercises and launch practice sessions anytime from your Exercise Sessions tab under the 'Rehab History' section."
    },
    {
      q: "When will my therapist reply to my message?",
      a: "Therapists typically review patient inquiries during regular clinical consultation hours (9:00 AM – 6:00 PM). For urgent clinical concerns, contact your hospital clinic desk directly."
    }
  ];

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetch(`${API_BASE}/api/patient/messages/`, {
        method: 'GET',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages(data.messages || []);
          setDoctorInfo(data.doctor || null);
          setHospitalInfo(data.hospital || null);
        }
      }
    } catch (err) {
      console.error("Failed to load customer care chat messages", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Scroll window to top on initial page mount
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMessages();
  }, []);

  // Only scroll the inner message container to bottom, preventing window viewport jumping
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSubmitting) return;

    const messageText = inputMessage.trim();
    const topic = selectedTopic;
    setIsSubmitting(true);

    try {
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/patient/send-message/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ subject: topic, message: messageText })
      });

      if (res.ok) {
        setInputMessage('');
        await fetchMessages(true);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Failed to send message to therapist.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to authentication server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const clinicPhone = doctorInfo?.phone_number || hospitalInfo?.phone_number || "+1 (800) 123-4567";
  const therapistName = doctorInfo?.name || "Your Therapist";

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">

      <Navbar role="patient" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">

        {/* ─── Page Header (matches ExerciseList) ───────────────────── */}
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Message Your Therapist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {therapistName} · Replies during clinic hours (9 AM – 6 PM)
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchMessages(false)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Icons.Refresh spinning={loading} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ─── Emergency Notice (matches card style) ────────────────── */}
        <div className="bg-white dark:bg-slate-800/90 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icons.Warning />
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-300">
              <span className="font-semibold">Medical Alert:</span> For acute emergencies, call <span className="font-semibold">112 / 911</span> immediately.
            </p>
          </div>
          <a
            href={`tel:${clinicPhone}`}
            className="shrink-0 hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-semibold hover:bg-red-100 transition"
          >
            <Icons.Phone />
            Clinic Desk
          </a>
        </div>

        {/* ─── Chat Card (matches ExerciseList card style) ──────────── */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-xs overflow-hidden flex flex-col" style={{ height: '560px' }}>

          {/* Chat Header */}
          <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center overflow-hidden">
                  {doctorInfo?.image_base64 ? (
                    <img src={doctorInfo.image_base64} alt={therapistName} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{therapistName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {doctorInfo?.speciality || 'Physical Rehabilitation Specialist'}
                  {doctorInfo?.hospital_name ? ` · ${doctorInfo.hospital_name}` : ''}
                </p>
              </div>
            </div>

            <a
              href={`tel:${clinicPhone}`}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-semibold transition"
            >
              <Icons.Phone />
              <span className="hidden md:inline">Call Clinic</span>
            </a>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-3 text-slate-400">
                <div className="animate-spin h-5 w-5 border-2 border-cyan-500 border-t-transparent rounded-full" />
                <span className="text-xs font-medium">Loading conversation…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-6">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                  <Icons.Chat />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Start a conversation
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 max-w-xs">
                    Ask about exercise difficulty, pain, recovery, or your prescribed routine.
                  </p>
                </div>
                {/* Quick topic shortcuts */}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {quickTopics.slice(0, 3).map((topic, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedTopic(topic.value);
                        setInputMessage(`Hi Doctor, I wanted to ask about: ${topic.value}`);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-cyan-400 dark:hover:border-cyan-500 transition cursor-pointer"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.is_me || (msg.sender_type === 'patient');
                const showDateDivider = idx === 0 || msg.date_only !== messages[idx - 1]?.date_only;

                return (
                  <React.Fragment key={msg.id || idx}>

                    {/* Date Divider */}
                    {showDateDivider && msg.date_only && (
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-2">
                          {msg.date_only}
                        </span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-0.5`}>

                      {/* Sender label + subject tag */}
                      <div className="flex items-center gap-1.5 px-1">
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          {isMe ? 'You' : (msg.sender_name || therapistName)}
                        </span>
                        {isMe && msg.subject && msg.subject !== 'General Consultation' && (
                          <span className="px-1.5 rounded text-[9px] font-semibold uppercase tracking-wide bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/50">
                            {msg.subject}
                          </span>
                        )}
                      </div>

                      {/* Bubble box */}
                      <div className={`max-w-[80%] sm:max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                        isMe
                          ? 'bg-cyan-600 text-white rounded-br-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-sm'
                      }`}>
                        {msg.body || msg.content}
                      </div>

                      {/* Timestamp + read receipt */}
                      <div className={`flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.time_only || msg.formatted_time || new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && (
                          <span className={msg.is_read ? 'text-cyan-500' : ''}>
                            {msg.is_read ? '✓✓ Read' : '✓ Sent'}
                          </span>
                        )}
                      </div>

                    </div>

                  </React.Fragment>
                );
              })
            )}
          </div>

          {/* Topic Selector */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">Topic:</span>
            {quickTopics.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSelectedTopic(t.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedTopic === t.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="px-3 py-3 border-t border-slate-200 dark:border-slate-700/60 flex items-end gap-2 shrink-0 bg-white dark:bg-slate-800/90"
          >
            <textarea
              rows={1}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Type a message to ${therapistName}… (Enter to send)`}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none overflow-hidden"
              style={{ minHeight: '42px' }}
            />
            <button
              type="submit"
              disabled={isSubmitting || !inputMessage.trim()}
              className="h-10 w-10 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isSubmitting
                ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                : <Icons.Send />
              }
            </button>
          </form>

        </div>

        {/* ─── FAQ Card (matches ExerciseList card style) ───────────── */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-xs overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Common rehabilitation questions</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {faqs.map((faq, idx) => (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{faq.q}</span>
                  <span className={`text-slate-400 transition-transform duration-200 shrink-0 ${openFaqIndex === idx ? 'rotate-180' : ''}`}>
                    <Icons.ChevronDown />
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-4 pt-0 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
}
