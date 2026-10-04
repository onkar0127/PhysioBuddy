import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import LegalModal from '../Components/LegalModal';
import { ensureCsrfToken } from '../csrf';

const generateTempPassword = (prefix = 'Pat') => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}@${randomDigits}`;
};

export default function HospitalAdminAddPatient() {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    password: generateTempPassword('Pat'),
    phone_number: '',
    gender: 'male',
    dob: '',
    blood_group: 'O+',
    height: '',
    weight: '',
    doctor_id: '',
  });

  const [isUsernameCustom, setIsUsernameCustom] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: 'privacy' });

  const openLegal = (type) => setLegalModal({ isOpen: true, type });
  const closeLegal = () => setLegalModal({ isOpen: false, type: 'privacy' });

  const navigate = useNavigate();

  useEffect(() => {
    fetchHospitalDoctors();
  }, []);

  const fetchHospitalDoctors = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/hospital-admin/doctors/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, doctor_id: data[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to load hospital doctors", err);
    }
  };

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

  const handleRegeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generateTempPassword('Pat') }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/hospital-admin/patients/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        const patientDisplayName = (formData.first_name || formData.middle_name || formData.last_name)
          ? `${formData.first_name} ${formData.middle_name} ${formData.last_name}`.replace(/\s+/g, ' ').trim()
          : formData.username;
        setSuccess(`Patient '${patientDisplayName}' added successfully and assigned to doctor!`);
        setFormData({
          first_name: '',
          middle_name: '',
          last_name: '',
          username: '',
          email: '',
          password: generateTempPassword('Pat'),
          phone_number: '',
          gender: 'male',
          dob: '',
          blood_group: 'O+',
          height: '',
          weight: '',
          doctor_id: doctors.length > 0 ? doctors[0].id : '',
        });
        setIsUsernameCustom(false);
      } else {
        setError(data.error || 'Failed to add patient.');
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
              <span>🧑‍🦽</span> Add Patient to Hospital
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enroll a new patient into your hospital clinic and assign them to an active physiotherapist.
            </p>
          </div>
          <Link
            to="/hospital-admin/patients"
            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
          >
            ← Back to Patients List
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm">Patient Enrolled!</h4>
                  <p className="text-xs mt-1">{success}</p>
                </div>
                <button
                  onClick={() => navigate('/hospital-admin/patients')}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
                >
                  View in Patient Directory →
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
              <p className="font-bold text-xs uppercase tracking-wider">Enrollment Error</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Credentials */}
            <div>
              <h2 className="text-base font-bold text-teal-700 dark:text-teal-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                1. Patient Account & Identity
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
                    placeholder="e.g. Michael"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
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
                    placeholder="e.g. Gary"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
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
                    placeholder="e.g. Scott"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Patient Username *
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateUsername}
                      title="Regenerate username automatically from First & Last name"
                      className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline bg-transparent border-0 cursor-pointer p-0 whitespace-nowrap shrink-0"
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
                    placeholder="e.g. michael_scott"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Auto-generated from First &amp; Last name.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 min-h-[18px]">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Patient Email *
                    </label>
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="michael.scott@example.com"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Used for notifications and login.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      Temp Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      title="Generate a new temporary password"
                      className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline bg-transparent border-0 cursor-pointer p-0 whitespace-nowrap shrink-0"
                    >
                      🎲 Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="e.g. Pat@1234"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm font-mono"
                  />
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    Auto-generated for initial patient login.
                  </p>
                </div>
              </div>
            </div>

            {/* Doctor Assignment & Demographics */}
            <div>
              <h2 className="text-base font-bold text-teal-700 dark:text-teal-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4">
                2. Assigned Doctor & Demographics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Assign to Hospital Doctor *
                  </label>
                  {doctors.length > 0 ? (
                    <select
                      name="doctor_id"
                      value={formData.doctor_id}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm font-semibold"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          Dr. {d.full_name || d.username} — {d.speciality} ({d.patient_count} active patients)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs">
                      ⚠️ No doctors in your hospital yet. <Link to="/hospital-admin/add-doctor" className="underline font-bold">Add a doctor first</Link> or assign one later.
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
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
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    name="blood_group"
                    value={formData.blood_group}
                    onChange={handleChange}
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  >
                    <option value="A+">A positive (A+)</option>
                    <option value="A-">A negative (A-)</option>
                    <option value="B+">B positive (B+)</option>
                    <option value="B-">B negative (B-)</option>
                    <option value="AB+">AB positive (AB+)</option>
                    <option value="AB-">AB negative (AB-)</option>
                    <option value="O+">O positive (O+)</option>
                    <option value="O-">O negative (O-)</option>
                  </select>
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
                    placeholder="e.g. +1 555-0188"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    min="0"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g. 175"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    min="0"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g. 70"
                    className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Terms and Privacy Agreement */}
            <p className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              By enrolling a patient, you confirm compliance with PhysioBuddy's{' '}
              <button
                type="button"
                onClick={() => openLegal('terms')}
                className="text-teal-600 dark:text-teal-400 underline font-semibold hover:text-teal-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Terms of Service</button>{' '}
              and acknowledge our{' '}
              <button
                type="button"
                onClick={() => openLegal('privacy')}
                className="text-teal-600 dark:text-teal-400 underline font-semibold hover:text-teal-500 p-0 m-0 bg-transparent border-0 inline cursor-pointer align-baseline text-xs"
              >Privacy Policy</button>.
            </p>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Registering Patient...' : 'Enroll Patient & Link to Doctor 🚀'}
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
