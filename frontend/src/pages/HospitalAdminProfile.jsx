import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

export default function HospitalAdminProfile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    hospital_name: '',
    city: '',
    address: '',
    phone_number: '',
    hospital_email: '',
    admin_email: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/hospital-admin/profile/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          hospital_name: data.hospital_name || '',
          city: data.city || '',
          address: data.address || '',
          phone_number: data.phone_number || '',
          hospital_email: data.hospital_email || '',
          admin_email: data.admin_email || '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setError('Failed to fetch hospital and administrator profile details.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error.');
    } finally {
      setLoading(false);
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

    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/hospital-admin/profile/update/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          hospital_name: formData.hospital_name,
          city: formData.city,
          address: formData.address,
          phone_number: formData.phone_number,
          hospital_email: formData.hospital_email,
          admin_email: formData.admin_email,
          new_password: formData.new_password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Hospital profile updated successfully!');
        setIsEditing(false);
        fetchProfile();
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Network connection error while saving changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="hospital_admin" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 mb-2">
              Organization Management
            </span>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>🏥</span> Hospital & Admin Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View and edit your hospital details, clinic contact information, and administrator account credentials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button
                onClick={() => { setIsEditing(true); setSuccess(null); setError(null); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer"
              >
                <span>✏️</span> Edit Profile
              </button>
            ) : (
              <button
                onClick={() => { setIsEditing(false); setError(null); }}
                className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-300 dark:hover:bg-gray-700 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Alerts */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="font-semibold">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
            <p className="font-bold text-xs uppercase tracking-wider">Error</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {profile && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Sidebar: Overview Card */}
            <div className="lg:col-span-1 space-y-6">
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 shadow-xl text-center">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-500/30 mb-4">
                  🏥
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                  {profile.hospital_name}
                </h2>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  📍 {profile.city || 'Location not specified'}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-3 text-center">
                  <Link
                    to="/hospital-admin/doctors"
                    className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition block"
                  >
                    <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-300">{profile.total_doctors}</span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Doctors</span>
                  </Link>

                  <Link
                    to="/hospital-admin/patients"
                    className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-950/60 transition block"
                  >
                    <span className="block text-2xl font-black text-teal-700 dark:text-teal-300">{profile.total_patients}</span>
                    <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Patients</span>
                  </Link>
                </div>

                <div className="mt-6 text-left p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 text-xs space-y-2">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Admin Account</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{profile.admin_username}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Registered On</span>
                    <span className="text-gray-700 dark:text-gray-300">{profile.created_at}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Form / Details */}
            <div className="lg:col-span-2">
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                {!isEditing ? (
                  /* Read-Only Mode */
                  <div className="space-y-8">
                    {/* Section 1: Hospital Info */}
                    <div>
                      <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                        <span>1.</span> Hospital / Clinic Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Hospital Name</span>
                          <span className="font-bold text-gray-900 dark:text-white">{profile.hospital_name}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">City / Location</span>
                          <span className="font-bold text-gray-900 dark:text-white">{profile.city || '—'}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Phone Number</span>
                          <span className="font-bold text-gray-900 dark:text-white">{profile.phone_number || '—'}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Hospital Contact Email</span>
                          <span className="font-bold text-gray-900 dark:text-white">{profile.hospital_email || '—'}</span>
                        </div>

                        <div className="sm:col-span-2 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Address</span>
                          <span className="text-gray-800 dark:text-gray-200">{profile.address || 'No address specified'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Admin Account */}
                    <div>
                      <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                        <span>2.</span> Administrator Credentials
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Administrator Username</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{profile.admin_username}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="block text-xs font-bold text-gray-400 uppercase">Administrator Email</span>
                          <span className="font-bold text-gray-900 dark:text-white">{profile.admin_email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Form */
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Section 1: Edit Hospital Details */}
                    <div>
                      <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                        <span>1.</span> Edit Hospital Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Hospital Name *
                          </label>
                          <input
                            type="text"
                            name="hospital_name"
                            required
                            value={formData.hospital_name}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
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
                            placeholder="e.g. Mumbai, New York"
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
                            placeholder="e.g. +1 555-0199"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Hospital Contact Email
                          </label>
                          <input
                            type="email"
                            name="hospital_email"
                            value={formData.hospital_email}
                            onChange={handleChange}
                            placeholder="contact@hospital.com"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
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
                            placeholder="Street, District, Region, Postal Code"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Edit Admin Account */}
                    <div>
                      <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-300 border-b border-gray-200 dark:border-gray-800 pb-2 mb-4 flex items-center gap-2">
                        <span>2.</span> Administrator Credentials
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Admin Email Address *
                          </label>
                          <input
                            type="email"
                            name="admin_email"
                            required
                            value={formData.admin_email}
                            onChange={handleChange}
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Change Password (Optional)
                          </label>
                          <input
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="Re-enter new password"
                            className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {saving ? 'Saving Changes...' : 'Save Profile Changes 💾'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
