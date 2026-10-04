import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';
import pb from '../assets/pb.png';
import LegalModal from '../Components/LegalModal';

export default function SuperAdminForgotPassword() {
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
      setError('Please enter your registered Super Admin Email or Username.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(`${API_BASE}/api/superadmin/forgot-password/`, {
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
        setError(data.error || 'No Super Admin account matching this entry was found.');
      }
    } catch (err) {
      console.error('Super Admin password recovery error:', err);
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
    <div className="min-h-screen w-full flex items-center justify-center font-[Inter] bg-gradient-to-br from-slate-950 via-purple-950 to-gray-950 text-white p-4 sm:p-6 relative overflow-hidden">

      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10">
        <div className="backdrop-blur-2xl bg-gray-900/80 border border-purple-500/30 rounded-3xl shadow-2xl p-8 sm:p-10 relative overflow-hidden">

          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"></div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Link to="/">
              <img
                src={pb}
                alt="PhysioBuddy Logo"
                className="w-44 h-auto hover:opacity-90 transition brightness-110"
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x80/6b21a8/ffffff?text=PhysioBuddy"; }}
              />
            </Link>
          </div>

          {!successData ? (
            <>
              {/* Header */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-2">
                  <span>🛡️</span> Super Admin Recovery
                </span>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white text-xl shadow-lg shadow-purple-600/30 my-3">
                  🔑
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Root Password Recovery
                </h2>
                <p className="text-xs text-purple-200/70 mt-1 max-w-xs mx-auto">
                  Enter your Super Admin email or username to receive a temporary root password.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div
                  className="mb-5 p-3.5 border rounded-xl text-sm bg-red-950/50 border-red-500/50 text-red-200"
                  role="alert"
                >
                  <p className="font-semibold text-xs uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <span>⚠️</span> Recovery Error
                  </p>
                  <p className="mt-1 text-xs leading-relaxed">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="sa-identifier"
                    className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5"
                  >
                    Admin Email or Username
                  </label>
                  <input
                    id="sa-identifier"
                    name="identifier"
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="superadmin@physiobuddy.com"
                    className="block w-full rounded-xl bg-gray-800/80 text-white px-4 py-3 placeholder:text-gray-500 border border-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-500/40 focus:border-purple-400 transition shadow-inner text-sm"
                    disabled={loading}
                  />
                  <p className="mt-1.5 text-[11px] text-purple-300/60">
                    We'll locate your Super Admin account and send a temporary root password to your registered email.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/40 focus:outline-none focus:ring-4 focus:ring-purple-500/50 transition duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Locating Root Account...</span>
                    </>
                  ) : (
                    <>
                      <span>✉️</span>
                      <span>Send Root Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success Confirmation State */
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 text-3xl shadow-xl shadow-emerald-500/20 mb-2">
                ✅
              </div>

              <h2 className="text-2xl font-black text-white tracking-tight">
                Temporary Password Sent!
              </h2>

              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-left space-y-2">
                <p className="text-xs font-semibold text-emerald-300 leading-relaxed">
                  {successData.message}
                </p>
                <div className="pt-2 border-t border-emerald-800/40 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Account: <strong className="text-white">@{successData.username}</strong></span>
                  <span>Inbox: <strong className="text-white">{successData.masked_email}</strong></span>
                </div>
              </div>

              <p className="text-xs text-purple-300/60">
                Please check your inbox (and spam/junk folder) for your temporary root password, then return to sign in.
              </p>

              <div className="pt-2 space-y-2">
                <Link
                  to="/super-admin-login"
                  className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 px-4 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-purple-600/40 transition no-underline"
                >
                  <span>🚀</span> Proceed to Admin Login
                </Link>

                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="text-xs font-semibold text-purple-300 hover:text-purple-200 hover:underline p-2 cursor-pointer bg-transparent border-0"
                >
                  Try another email or username
                </button>
              </div>
            </div>
          )}

          {/* Back to Login Footer */}
          <div className="mt-8 pt-6 border-t border-purple-500/20 text-center">
            <p className="text-sm text-purple-300/70">
              Remember your password?{' '}
              <Link
                to="/super-admin-login"
                className="font-bold text-purple-300 hover:text-white hover:underline inline-flex items-center gap-1 transition"
              >
                <span>&larr;</span> Back to Admin Login
              </Link>
            </p>
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
