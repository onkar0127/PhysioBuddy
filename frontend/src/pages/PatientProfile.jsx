import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../Components/Navbar';
import { API_BASE } from '../config';
import { ensureCsrfToken } from '../csrf';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    dob: '',
    gender: 'male',
    height: '',
    weight: '',
    blood_group: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE}/api/patient/profile/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch patient profile');
      const data = await response.json();
      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        middle_name: data.middle_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone_number: data.phone_number || '',
        dob: data.dob || '',
        gender: data.gender || 'male',
        height: data.height !== null && data.height !== undefined ? data.height : '',
        weight: data.weight !== null && data.weight !== undefined ? data.weight : '',
        blood_group: data.blood_group || data.bg || '',
        new_password: '',
        confirm_password: '',
      });
    } catch (err) {
      console.error(err);
      setError('Could not load patient profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (max 5MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => uploadImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (base64String) => {
    setIsUploading(true);
    setError(null);
    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(`${API_BASE}/api/patient/update-image/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ patient_image: base64String }),
      });
      if (!response.ok) throw new Error('Failed to save profile image');
      setProfile((prev) => ({ ...prev, patient_image: base64String }));
      setSuccess('Profile photo updated successfully!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Password validation
    if (formData.new_password) {
      if (formData.new_password.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    if (!formData.email) {
      setError('Email address is required.');
      return;
    }

    setSaving(true);
    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(`${API_BASE}/api/patient/profile/update/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          email: formData.email,
          phone_number: formData.phone_number,
          dob: formData.dob,
          gender: formData.gender,
          height: formData.height,
          weight: formData.weight,
          blood_group: formData.blood_group,
          new_password: formData.new_password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setProfile(data.patient);
        setFormData((prev) => ({
          ...prev,
          new_password: '',
          confirm_password: '',
        }));
        setIsEditing(false);
        setSuccess(data.message || 'Profile updated successfully!');
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        middle_name: profile.middle_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        dob: profile.dob || '',
        gender: profile.gender || 'male',
        height: profile.height !== null && profile.height !== undefined ? profile.height : '',
        weight: profile.weight !== null && profile.weight !== undefined ? profile.weight : '',
        blood_group: profile.blood_group || profile.bg || '',
        new_password: '',
        confirm_password: '',
      });
    }
  };

  // BMI Calculation
  const calculateBMI = (h, w) => {
    const heightVal = parseFloat(h);
    const weightVal = parseFloat(w);
    if (heightVal > 0 && weightVal > 0) {
      const heightInMeters = heightVal / 100;
      const val = (weightVal / (heightInMeters * heightInMeters)).toFixed(1);
      let status = 'Normal';
      let color = 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300';
      if (val < 18.5) {
        status = 'Underweight';
        color = 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/70 border-amber-300';
      } else if (val >= 25 && val < 30) {
        status = 'Overweight';
        color = 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/70 border-orange-300';
      } else if (val >= 30) {
        status = 'Obese';
        color = 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/70 border-rose-300';
      }
      return { score: val, status, color };
    }
    return null;
  };

  const activeBMI = isEditing
    ? calculateBMI(formData.height, formData.weight)
    : calculateBMI(profile?.height, profile?.weight);

  const displayName = profile?.full_name || [profile?.first_name, profile?.middle_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || 'Patient';

  return (
    <div className="min-h-screen w-full font-[Inter] bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-950 dark:to-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-500 flex flex-col">
      <Navbar role="patient" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 overflow-y-auto">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-10 w-10 border-4 border-teal-600 border-t-transparent rounded-full"></div>
              <p className="text-sm font-semibold text-teal-800 dark:text-teal-400">Loading Patient Profile...</p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Notifications */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚠️</span>
                  <p className="font-semibold text-sm">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 text-sm font-bold">✕</button>
              </div>
            )}

            {success && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <p className="font-semibold text-sm">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="text-emerald-600 hover:text-emerald-800 text-sm font-bold">✕</button>
              </div>
            )}

            {/* Profile Hero Header Card */}
            <div className="relative overflow-hidden backdrop-blur-2xl bg-white/70 dark:bg-gray-800/70 border border-white/60 dark:border-gray-700 rounded-3xl shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                {/* Avatar with Upload Badge */}
                <div className="relative group shrink-0">
                  <img
                    src={profile?.patient_image || "https://placehold.co/160/0d9488/ffffff?text=Patient"}
                    alt={displayName}
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Change profile picture"
                    className="absolute -bottom-2 -right-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-2.5 rounded-xl shadow-lg hover:from-teal-700 hover:to-cyan-700 transition transform hover:scale-105 active:scale-95 border-2 border-white dark:border-gray-800 flex items-center justify-center cursor-pointer"
                  >
                    {isUploading ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                </div>

                {/* Identity & Badges */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 rounded-full text-xs font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-800">
                      🏃 Patient Member
                    </span>
                    <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 rounded-full text-xs font-semibold border border-cyan-200 dark:border-cyan-800">
                      🏥 {profile?.hospital_name || 'PhysioBuddy Clinic'}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    {displayName}
                  </h1>

                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    @{profile?.username} &bull; Assigned Doctor: <span className="text-teal-700 dark:text-teal-400 font-bold">{profile?.assigned_doctor || 'Not Assigned'}</span>
                  </p>
                </div>

                {/* Action Button */}
                <div className="shrink-0">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-600/20 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    >
                      <span>✏️</span> Edit Profile &amp; Password
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>💾</span> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Details & Form Section */}
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Left Column: Personal & Contact Details */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/60 dark:border-gray-700 rounded-3xl shadow-lg p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <span>👤</span> Personal &amp; Account Details
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            First Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="first_name"
                              value={formData.first_name}
                              onChange={handleChange}
                              placeholder="e.g. Michael"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.first_name || 'N/A'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Middle Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="middle_name"
                              value={formData.middle_name}
                              onChange={handleChange}
                              placeholder="e.g. Gary"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.middle_name || '—'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Last Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="last_name"
                              value={formData.last_name}
                              onChange={handleChange}
                              placeholder="e.g. Scott"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.last_name || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                          Username (Patient ID)
                        </label>
                        <p className="text-sm font-mono font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/60 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <span>@{profile?.username}</span>
                          <span className="text-[10px] uppercase font-sans font-semibold text-gray-500">Read-only</span>
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                          Email Address *
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="michael.scott@example.com"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                            {profile?.email || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="phone_number"
                              value={formData.phone_number}
                              onChange={handleChange}
                              placeholder="+1 555-0199"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.phone_number || 'N/A'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Gender
                          </label>
                          {isEditing ? (
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleChange}
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm capitalize"
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize py-1">
                              {profile?.gender || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                          Date of Birth
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                            {profile?.dob || 'N/A'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Health, Biometrics & Security */}
                <div className="lg:col-span-6 space-y-6">
                  {/* Health & Biometrics */}
                  <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/60 dark:border-gray-700 rounded-3xl shadow-lg p-6">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-5 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
                      <span>🩺</span> Health &amp; Biometric Vitals
                    </h2>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Height (cm)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="300"
                              name="height"
                              value={formData.height}
                              onChange={handleChange}
                              placeholder="e.g. 175"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.height ? `${profile.height} cm` : 'N/A'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Weight (kg)
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="400"
                              name="weight"
                              value={formData.weight}
                              onChange={handleChange}
                              placeholder="e.g. 72"
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 py-1">
                              {profile?.weight ? `${profile.weight} kg` : 'N/A'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Blood Group
                          </label>
                          {isEditing ? (
                            <select
                              name="blood_group"
                              value={formData.blood_group}
                              onChange={handleChange}
                              className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                            >
                              <option value="">Select</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                            </select>
                          ) : (
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400 py-1">
                              {profile?.blood_group || profile?.bg || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* BMI Badge */}
                      {activeBMI && (
                        <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${activeBMI.color}`}>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                              Calculated Body Mass Index (BMI)
                            </span>
                            <span className="text-xl font-black">{activeBMI.score}</span>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/70 dark:bg-gray-900/60 shadow-sm">
                            {activeBMI.status}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Assigned Specialist
                          </label>
                          <p className="text-sm font-bold text-teal-800 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/40 p-2.5 rounded-xl border border-teal-200 dark:border-teal-800 flex items-center gap-2">
                            <span>🩺</span>
                            <span className="truncate">{profile?.assigned_doctor || 'Not Assigned'}</span>
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Hospital Clinic
                          </label>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-900/60 p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <span>🏥</span>
                            <span className="truncate">{profile?.hospital_name || 'PhysioBuddy Clinic'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Password & Security Card */}
                  {isEditing && (
                    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-white/60 dark:border-gray-700 rounded-3xl shadow-lg p-6 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                          <span>🔐</span> Change Password
                        </h2>
                        <span className="text-xs text-gray-500 font-medium">(Optional)</span>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                              New Password
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                            >
                              {showPassword ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Re-type new password"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none text-sm"
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                          Password must be at least 6 characters long.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom Action Footer when Editing */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-7 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span> Save All Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
