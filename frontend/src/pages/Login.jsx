import React, { useState } from "react";
import { API_BASE } from "../config";
import doctorGif from "../assets/doc.gif";
import pb from "../assets/pb.png";
import { useNavigate, Link } from "react-router-dom";
import LegalModal from "../Components/LegalModal";

// Utility function to get CSRF token from cookies
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

export default function Login() {
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
    const loginUrl = `${API_BASE}/api/login/`;

    try {
      let csrfToken = getCookie('csrftoken');
      if (!csrfToken) {
        await fetch(loginUrl, {
          method: "GET",
          credentials: "include",
        });
        csrfToken = getCookie('csrftoken');
      }

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
        console.log("Login response:", result);

        if (result.user === "hospital_admin") {
          navigate("/hospital-admin");
        } else if (result.user === "doctor") {
          navigate("/doctor-home");
        } else if (result.user === "patient") {
          window.location.href = "/patient-home";
        } else {
          setError(result.error || "Invalid credentials. Please check your email and password.");
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "Invalid credentials. Please check your email and password.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:flex font-[Inter] bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Left Side: Marketing and Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-10 bg-gradient-to-br from-cyan-700 via-cyan-600 to-blue-700 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>
        <h1 className="text-6xl font-black drop-shadow-lg mb-8 tracking-tight">
          PhysioBuddy
        </h1>
        <img
          src={doctorGif}
          alt="Doctor animation"
          className="w-full max-w-xs h-auto rounded-2xl shadow-2xl transition duration-300 hover:scale-[1.02] border border-white/20"
          onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/15779e/ffffff?text=PhysioBuddy"; }}
        />
        <p className="mt-8 text-center text-lg font-medium opacity-90 max-w-md">
          Intelligent physical rehabilitation platform connecting Hospitals, Physiotherapists, and Patients.
        </p>

        {/* Quick pill showing multi-role platform */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">Hospital Admins</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">Doctors</span>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">Patients</span>
        </div>
      </div>

      {/* Right Side: Glassy Login Form */}
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/60 dark:bg-gray-900/60 border border-white/40 dark:border-gray-800 rounded-3xl shadow-2xl transition p-8 sm:p-10">

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

            <h2 className="mt-2 text-center text-3xl font-extrabold text-cyan-900 dark:text-cyan-100 tracking-tight">
              Log in to your account
            </h2>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
              Sign in as Hospital Admin, Doctor, or Patient
            </p>

            {/* Error Message Display */}
            {error && (
              <div
                className="mt-4 p-3.5 border rounded-xl text-sm bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-700 dark:text-red-300"
                role="alert"
              >
                <p className="font-semibold text-xs uppercase tracking-wider">Login Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 mt-6">
              {/* Username or Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-cyan-950 dark:text-cyan-200 mb-1.5"
                >
                  Email or Username
                </label>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  autoComplete="username email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@hospital.com or username"
                  className="mt-1 block w-full rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 focus:border-cyan-600 transition shadow-sm"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-cyan-950 dark:text-cyan-200 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1 block w-full rounded-xl bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white px-4 py-3 placeholder:text-gray-400 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800 focus:border-cyan-600 transition shadow-sm"
                  disabled={loading}
                />
              </div>

              {/* Terms and Privacy Agreement */}
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                By logging in, you agree to PhysioBuddy's{' '}
                <button
                  type="button"
                  onClick={() => openLegal("terms")}
                  className="text-cyan-600 dark:text-cyan-400 underline font-semibold hover:text-cyan-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
                >Terms of Service</button>{' '}
                and acknowledge our{' '}
                <button
                  type="button"
                  onClick={() => openLegal("privacy")}
                  className="text-cyan-600 dark:text-cyan-400 underline font-semibold hover:text-cyan-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
                >Privacy Policy</button>.
              </p>

              {/* Submit Button */}
              <button
                type="submit"
                aria-label="Sign in"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-500/30 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition duration-200 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Hospital Registration Callout */}
            <div className="mt-8 pt-6 border-t border-gray-200/80 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Are you a Hospital or Clinic Administrator?
              </p>
              <Link
                to="/register-hospital"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-cyan-500/40 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 font-semibold text-sm transition"
              >
                <span>🏥</span>
                Register New Hospital / Clinic
              </Link>
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
