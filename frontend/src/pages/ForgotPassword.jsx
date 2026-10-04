import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';
import pb from '../assets/pb.png';
import doctorGif from '../assets/doc.gif';
import LegalModal from '../Components/LegalModal';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const openLegal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegal = () => setLegalModal({ isOpen: false, type: 'privacy' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your registered Email, Username, or Mobile Number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(`${API_BASE}/api/auth/forgot-password/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSuccessData(data);
      } else {
        setError(data.error || 'No account matching this entry was found. Please check your details or contact your administrator.');
      }
    } catch (err) {
      console.error('Password recovery error:', err);
      setError('Failed to connect to authentication server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSuccessData(null);
    setError(null);
    setIdentifier('');
  };

  return (
    <div className="min-h-screen w-full lg:flex font-[Inter] bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Left Side: Marketing and Branding Banner */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-10 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
        <h1 className="text-6xl font-black drop-shadow-lg mb-8 tracking-tight">
          PhysioBuddy
        </h1>
        <img
          src={doctorGif}
          alt="Doctor illustration"
          className="w-full max-w-xs h-auto rounded-2xl shadow-2xl transition duration-300 hover:scale-[1.02] border border-white/20"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/15779e/ffffff?text=PhysioBuddy"; }}
        />
        <p className="mt-8 text-center text-lg font-medium opacity-90 max-w-md">
          Fast and secure account recovery for Hospital Administrators, Doctors, and Patients.
        </p>

        {/* Security badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span>🛡️</span> Instant Credentials Dispatch
          </span>
          <span className="px-3.5 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold flex items-center gap-1.5">
            <span>🔐</span> Secure Temporary Password
          </span>
        </div>
      </div>

      {/* Right Side: Recovery Form */}
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/50 dark:border-gray-800 rounded-3xl shadow-2xl transition p-8 sm:p-10">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Link to="/">
                <img
                  src={pb}
                  alt="PhysioBuddy Logo"
                  className="w-48 h-auto hover:opacity-90 transition"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x80/0e7490/ffffff?text=PB"; }}
                />
              </Link>
            </div>

            {!successData ? (
              <>
                <div className="text-center space-y-1 mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white text-xl shadow-lg shadow-cyan-600/30 mb-2">
                    🔑
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-cyan-950 dark:text-cyan-100 tracking-tight">
                    Forgot Password?
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                    Enter your registered email, username, or phone number to receive a temporary login password.
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div
                    className="mb-5 p-3.5 border rounded-xl text-sm bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-700 dark:text-red-300"
                    role="alert"
                  >
                    <p className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚠️</span> Account Search Error
                    </p>
                    <p className="mt-1 text-xs leading-relaxed">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label
                      htmlFor="identifier"
                      className="block text-sm font-semibold text-cyan-950 dark:text-cyan-200 mb-1.5"
                    >
                      Email, Username, or Mobile Number
                    </label>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      required
                      autoFocus
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="e.g. sarah@hospital.com, sarah_jenkins, or +15550144"
                      className="mt-1 block w-full rounded-xl bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 focus:border-cyan-600 transition shadow-sm text-sm"
                      disabled={loading}
                    />
                    <p className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                      We'll locate your account and send a new temporary password to your email.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition duration-200 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching Account...</span>
                      </>
                    ) : (
                      <>
                        <span>✉️</span>
                        <span>Send Temporary Password</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success Confirmation State */
              <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-3xl shadow-xl shadow-emerald-500/20 mb-2">
                  ✅
                </div>

                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  Temporary Password Sent!
                </h2>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-left space-y-2">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {successData.message}
                  </p>
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/40 text-[11px] text-gray-600 dark:text-gray-400 flex items-center justify-between">
                    <span>Account: <strong className="text-gray-900 dark:text-white">@{successData.username}</strong></span>
                    <span>Inbox: <strong className="text-gray-900 dark:text-white">{successData.masked_email}</strong></span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Please check your inbox (and spam/junk folder) for your temporary password, then return to sign in.
                </p>

                <div className="pt-2 space-y-2">
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition"
                  >
                    <span>🚀</span> Proceed to Sign In
                  </Link>

                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 hover:underline p-2 cursor-pointer bg-transparent border-0"
                  >
                    Try another email or username
                  </button>
                </div>
              </div>
            )}

            {/* Back to Login Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-bold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>&larr;</span> Back to Login
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Pop-up Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegal}
        type={legalModal.type}
      />
    </div>
  );
}
