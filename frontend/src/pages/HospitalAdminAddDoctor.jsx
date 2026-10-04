import React, { useState } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import LegalModal from '../Components/LegalModal';

export default function HospitalAdminAddDoctor() {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    speciality: '',
    qualification: '',
    phone_number: '',
    gender: 'male',
    city: '',
    experience_years: '',
    professional_summary: '',
  });

  const [isUsernameCustom, setIsUsernameCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const openLegal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegal = () => setLegalModal({ isOpen: false, type: 'privacy' });

  const navigate = useNavigate();

  const generateUsername = (first, last) => {
    const cleanFirst = (first || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = (last || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanFirst && cleanLast) return `${cleanFirst}_${cleanLast}`;
    if (cleanFirst) return cleanFirst;
    if (cleanLast) return cleanLast;
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setIsUsernameCustom(true);
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (name === 'first_name' || name === 'last_name') {
      setFormData(prev => {
        const next = { ...prev, [name]: value };
        if (!isUsernameCustom) {
          next.username = generateUsername(
            name === 'first_name' ? value : prev.first_name,
            name === 'last_name' ? value : prev.last_name
          );
        }
        return next;
      });
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError(null);
  };

  const handleRegenerateUsername = () => {
    const autoUser = generateUsername(formData.first_name, formData.last_name);
    setFormData(prev => ({ ...prev, username: autoUser }));
    setIsUsernameCustom(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/api/hospital-admin/doctors/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        const doctorDisplayName = (formData.first_name || formData.middle_name || formData.last_name)
          ? `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.replace(/\s+/g, ' ').trim()
          : formData.username;
        setSuccess(`Doctor 'Dr. ${doctorDisplayName}' created successfully and linked to your hospital!`);
        setFormData({
          first_name: '',
          middle_name: '',
          last_name: '',
          username: '',
          email: '',
          password: '',
          speciality: '',
          qualification: '',
          phone_number: '',
          gender: 'male',
          city: '',
          experience_years: '',
          professional_summary: '',
        });
        setIsUsernameCustom(false);
      } else {
        setError(data.error || 'Failed to add doctor.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="hospital_admin" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>👨‍⚕️</span> Add Doctor to Hospital
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create a new doctor account automatically associated with your hospital clinic.
            </p>
          </div>
          <Link
            to="/hospital-admin/doctors"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← Back to Doctors List
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm">Doctor Registered!</h4>
                  <p className="text-xs mt-1">{success}</p>
                </div>
                <button
                  onClick={() => navigate('/hospital-admin/doctors')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  View in Staff List →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
              <p className="font-bold text-xs uppercase tracking-wider">Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials */}
            <div>
              <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                1. Doctor Account & Identity
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Middle Name <span className="text-gray-400 dark:text-gray-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    placeholder="e.g. Elizabeth"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="e.g. Jenkins"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Doctor Username *
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateUsername}
                      title="Regenerate username automatically from First & Last name"
                      className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-transparent border-0 cursor-pointer p-0"
                    >
                      ⚡ Auto-sync
                    </button>
                  </div>
                  <input
                    type="text"
                    name="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. sarah_jenkins"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Auto-generated from First &amp; Last name.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Doctor Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah.jenkins@hospital.com"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Temporary Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Medical Credentials */}
            <div>
              <h2 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                2. Professional & Medical Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Speciality / Focus *
                  </label>
                  <input
                    type="text"
                    name="speciality"
                    required
                    value={formData.speciality}
                    onChange={handleChange}
                    placeholder="e.g. Orthopedic Physiotherapy, Neuro Rehabilitation"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Qualification *
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    required
                    value={formData.qualification}
                    onChange={handleChange}
                    placeholder="e.g. BPT, MPT (Sports), DPT"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    min="0"
                    value={formData.experience_years}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="e.g. +1 555-0144"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Doctor's primary operating city"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Professional Summary
                  </label>
                  <textarea
                    rows={3}
                    name="professional_summary"
                    value={formData.professional_summary}
                    onChange={handleChange}
                    placeholder="Brief background, clinical focus areas, research or awards..."
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              By enrolling a doctor, you confirm compliance with PhysioBuddy's{' '}
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Terms of Service</button>{' '}
              and acknowledge our{' '}
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="text-emerald-600 dark:text-emerald-400 underline font-semibold hover:text-emerald-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Privacy Policy</button>.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Doctor...' : 'Add Doctor to Hospital 🚀'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Pop-up Modal */}
      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={closeLegal}
        type={legalModal.type}
      />
    </div>
  );
}
