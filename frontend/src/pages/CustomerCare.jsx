import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 

const API_BASE = 'http://127.0.0.1:8000';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

export default function CustomerCare() {
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [messages, setMessages] = useState([]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/patient/messages/`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    
    try {
      const res = await fetch(`${API_BASE}/api/patient/send-message/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message
        })
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ subject: '', message: '' });
        fetchMessages();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("Connection to backend failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    { icon: '💬', title: 'Live Chat', desc: 'Usually replies in 5 mins', action: 'Start Chat' },
    { icon: '📞', title: 'Phone Support', desc: '+1 (800) 123-4567', action: 'Call Now' },
    { icon: '✉️', title: 'Email Us', desc: 'support@physiobuddy.com', action: 'Send Email' },
  ];

  // Shared input styling for the compact look
  const inputStyles = "w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-900/50 border border-white/40 dark:border-gray-700/50 text-sm font-medium text-cyan-950 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all shadow-inner";

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 transition-colors duration-500 font-[Inter]">
      
      <Navbar role="patient" />

      {/* Restricted to max-w-3xl for a perfectly balanced center column */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          
          {/* 1. Header Section - Scaled Down Text */}
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-cyan-950 dark:text-white tracking-tight">
              How can we help?
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium max-w-sm mx-auto">
              Our support team and your therapist are here to ensure your recovery goes smoothly.
            </p>
          </div>

          {/* 2. Quick Contact Grid - Compact Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contactMethods.map((method, idx) => (
              <div key={idx} className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                <div className="w-12 h-12 mx-auto bg-cyan-100 dark:bg-cyan-900/50 rounded-xl flex items-center justify-center text-xl mb-3 shadow-sm border border-cyan-200 dark:border-cyan-800 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-sm font-bold text-cyan-950 dark:text-gray-100">{method.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-4">{method.desc}</p>
                <button className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition-colors">
                  {method.action} →
                </button>
              </div>
            ))}
          </div>

          {/* 3. Direct Message Form - Compact Padding & Inputs */}
          <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-400 tracking-tight">Message your Therapist</h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                Having trouble with an exercise? Let them know.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-cyan-800 dark:text-cyan-500 mb-1.5 ml-1">
                  Subject
                </label>
                <select 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className={`${inputStyles} appearance-none cursor-pointer`}
                >
                  <option value="" disabled>Select a topic...</option>
                  <option value="pain">Pain during exercises</option>
                  <option value="schedule">Change my routine</option>
                  <option value="app_issue">App technical issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-cyan-800 dark:text-cyan-500 mb-1.5 ml-1">
                  Message
                </label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe what you're experiencing..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className={`${inputStyles} resize-none`}
                ></textarea>
              </div>

              {/* Status & Submit Button */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  {success && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Message sent successfully!
                    </span>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white bg-cyan-600 hover:bg-cyan-700 transition-all hover:-translate-y-0.5 shadow-md shadow-cyan-500/30 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                  {!isSubmitting && <span>↗</span>}
                </button>
              </div>
            </form>
          </div>

          {/* 4. Message History */}
          <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700 rounded-3xl p-6 sm:p-8 shadow-md">
            <h2 className="text-xl font-bold text-cyan-900 dark:text-cyan-400 tracking-tight mb-4">Message History</h2>
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">No message history yet.</p>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-white/60 dark:bg-gray-900/40 border border-white/30 dark:border-gray-700 rounded-2xl flex flex-col gap-2">
                    <p className="text-sm font-medium text-cyan-950 dark:text-gray-100 whitespace-pre-line">{msg.content}</p>
                    <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                      <span>{new Date(msg.created_at).toLocaleString('en-IN')}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${msg.is_read ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                        {msg.is_read ? 'Read' : 'Sent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick FAQ Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Experiencing a medical emergency? <span className="font-bold text-red-500 dark:text-red-400">Call 112 immediately.</span>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}