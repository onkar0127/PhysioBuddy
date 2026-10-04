import React, { useState } from "react";
import { API_BASE } from "../config";
import pb from "../assets/pb.png";
import { useNavigate, Link } from "react-router-dom";
import LegalModal from "../Components/LegalModal";

export default function RegisterHospital() {
  const [formData, setFormData] = useState({
    hospital_name: "",
    admin_username: "",
    admin_email: "",
    admin_password: "",
    confirm_password: "",
    city: "",
    address: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: "privacy" });

  const openLegal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegal = () => setLegalModal({ isOpen: false, type: "privacy" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.admin_password !== formData.confirm_password) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    if (formData.admin_password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/register-hospital/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hospital_name: formData.hospital_name,
          admin_username: formData.admin_username,
          admin_email: formData.admin_email,
          admin_password: formData.admin_password,
          city: formData.city,
          address: formData.address,
          phone_number: formData.phone_number,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Hospital '${data.hospital_name}' registered successfully! You can now log in with the admin credentials.`);
        setFormData({
          hospital_name: "",
          admin_username: "",
          admin_email: "",
          admin_password: "",
          confirm_password: "",
          city: "",
          address: "",
          phone_number: "",
        });
      } else {
        setError(data.error || "Failed to register hospital. Please check the information provided.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Network error connecting to backend server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-cyan-50 via-sky-100 to-indigo-100 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-[Inter]">
      <div className="max-w-3xl mx-auto">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={pb} alt="PhysioBuddy" className="h-10 w-auto" />
          </Link>
          <Link
            to="/login"
            className="text-sm font-semibold text-cyan-700 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            ← Back to Login
          </Link>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl shadow-2xl p-6 sm:p-10 transition">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-3xl mb-3">
              🏥
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Register New Hospital / Clinic
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create your organization workspace on PhysioBuddy. Once registered, as Hospital Admin you will be able to add and manage doctors and patients linked to your hospital.
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <span className="text-xl">✅</span>
                <div>
                  <h4 className="font-bold text-sm">Registration Successful!</h4>
                  <p className="text-xs mt-1">{success}</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="mt-3 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                  >
                    Proceed to Login →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
              <p className="font-bold text-xs uppercase tracking-wider">Registration Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Hospital Details */}
            <div>
              <h2 className="text-base font-bold text-cyan-800 dark:text-cyan-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                <span>1.</span> Hospital / Clinic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Hospital / Clinic Name *
                  </label>
                  <input
                    type="text"
                    name="hospital_name"
                    required
                    value={formData.hospital_name}
                    onChange={handleChange}
                    placeholder="e.g. Apex Physical Therapy & Rehab Hospital"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Mumbai, New York, London"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Hospital Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="e.g. +1 555-0199"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Full Address
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, District, State, Postal Code"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Hospital Admin Credentials */}
            <div>
              <h2 className="text-base font-bold text-cyan-800 dark:text-cyan-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                <span>2.</span> Hospital Admin Account Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Admin Username *
                  </label>
                  <input
                    type="text"
                    name="admin_username"
                    required
                    value={formData.admin_username}
                    onChange={handleChange}
                    placeholder="e.g. apex_admin"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Admin Email Address *
                  </label>
                  <input
                    type="email"
                    name="admin_email"
                    required
                    value={formData.admin_email}
                    onChange={handleChange}
                    placeholder="admin@apexhospital.com"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Admin Password *
                  </label>
                  <input
                    type="password"
                    name="admin_password"
                    required
                    value={formData.admin_password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    required
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              By registering your medical organization, you agree to PhysioBuddy's{' '}
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

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Registering Hospital...
                  </>
                ) : (
                  "Complete Hospital Registration 🚀"
                )}
              </button>
            </div>
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
