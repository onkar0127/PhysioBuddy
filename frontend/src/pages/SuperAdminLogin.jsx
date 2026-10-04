import React, { useState } from "react";
import { API_BASE } from "../config";
import pb from "../assets/pb.png";
import { useNavigate, Link } from "react-router-dom";
import LegalModal from "../Components/LegalModal";

// Helper function to get CSRF token from cookies
const getCookie = (name) => {
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
};

const ensureCsrfToken = async () => {
  let csrfToken = getCookie('csrftoken');
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE}/api/csrf/`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.csrfToken) return data.csrfToken;
    }
  } catch (err) {
    console.warn("CSRF bootstrap warning:", err);
  }

  return getCookie('csrftoken') || '';
};

export default function SuperAdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: "privacy" });

  const openLegal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegal = () => setLegalModal({ isOpen: false, type: "privacy" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { email, password } = form;
    const loginUrl = `${API_BASE}/api/superadmin/login/`;

    try {
      const csrfToken = await ensureCsrfToken();

      const response = await fetch(loginUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Super Admin login successful:", result);
        navigate("/super-admin");
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Invalid Super Admin credentials.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-[Inter] bg-gradient-to-br from-slate-950 via-purple-950 to-gray-950 text-white p-4 sm:p-6 relative overflow-hidden">

      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

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

          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[11px] font-black uppercase tracking-wider mb-2">
              <span>🛡️</span> Super Admin Console
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Root Administration
            </h2>
            <p className="text-xs text-purple-200/70 mt-1">
              Restricted portal for platform administrators and system operators
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-6 p-3.5 border rounded-xl text-sm bg-red-950/50 border-red-500/50 text-red-200"
              role="alert"
            >
              <p className="font-semibold text-xs uppercase tracking-wider text-red-400">Authentication Failed</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username or Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5"
              >
                Admin Username or Email
              </label>
              <input
                id="email"
                name="email"
                type="text"
                required
                autoComplete="username email"
                value={form.email}
                onChange={handleChange}
                placeholder="superadmin@physiobuddy.com"
                className="block w-full rounded-xl bg-gray-800/80 text-white px-4 py-3 placeholder:text-gray-500 border border-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-500/40 focus:border-purple-400 transition shadow-inner text-sm"
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-1.5"
              >
                Root Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="block w-full rounded-xl bg-gray-800/80 text-white px-4 py-3 placeholder:text-gray-500 border border-purple-500/30 focus:outline-none focus:ring-4 focus:ring-purple-500/40 focus:border-purple-400 transition shadow-inner text-sm"
                disabled={loading}
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/super-admin-forgot-password"
                  className="text-xs font-semibold text-purple-300 hover:text-purple-200 hover:underline transition"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  Verifying Root Access...
                </>
              ) : (
                "Authenticate as Super Admin"
              )}
            </button>

            {/* Terms and Privacy Agreement */}
            <p className="text-center text-xs text-purple-300/70 leading-relaxed mt-3">
              By accessing the administrative terminal, you agree to PhysioBuddy's{' '}
              <button
                type="button"
                onClick={() => openLegal("terms")}
                className="text-purple-300 underline font-semibold hover:text-white p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Terms of Service</button>{' '}
              and acknowledge our{' '}
              <button
                type="button"
                onClick={() => openLegal("privacy")}
                className="text-purple-300 underline font-semibold hover:text-white p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Privacy Policy</button>.
            </p>
          </form>
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
