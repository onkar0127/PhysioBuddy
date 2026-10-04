import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

export default function HospitalAdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/hospital-admin/patients/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Are you sure you want to remove patient '${username}'? This will also remove their associated exercise assignments.`)) return;

    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/api/hospital-admin/patients/${id}/delete/`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        setPatients(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = patients.filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.full_name && p.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.first_name && p.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.last_name && p.last_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.doctor_name && p.doctor_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="hospital_admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>🧑‍🦽</span> Hospital Patients
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              All patients undergoing physiotherapy treatment in your hospital clinic.
            </p>
          </div>
          <Link
            to="/hospital-admin/add-patient"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-sm shadow-xl shadow-teal-500/25 transition flex items-center justify-center gap-2"
          >
            <span>➕</span> Add New Patient
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search patients by name, username, email, or assigned doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 text-sm shadow-sm"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        )}

        {/* Patients Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((pat) => (
              <div
                key={pat.id}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {pat.image_base64 ? (
                        <img
                          src={pat.image_base64}
                          alt={pat.full_name || pat.username}
                          className="w-12 h-12 rounded-2xl object-cover border border-teal-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-xl font-bold">
                          {(pat.first_name || pat.username).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                          {pat.full_name || pat.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                            {pat.email}
                          </p>
                          {pat.full_name && pat.full_name !== pat.username && (
                            <span className="text-[11px] text-gray-400 font-mono">
                              @{pat.username}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(pat.id, pat.username)}
                      disabled={deletingId === pat.id}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs transition"
                      title="Remove Patient"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 text-xs space-y-1.5 mb-4">
                    <p>
                      <strong className="text-gray-900 dark:text-white">Assigned Doctor:</strong>{' '}
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {pat.doctor_name !== 'Unassigned' ? `Dr. ${pat.doctor_name}` : 'Unassigned'}
                      </span>
                    </p>
                    <p><strong className="text-gray-900 dark:text-white">Gender:</strong> {pat.gender || 'N/A'}</p>
                    <p><strong className="text-gray-900 dark:text-white">DOB:</strong> {pat.dob || 'N/A'}</p>
                    <p><strong className="text-gray-900 dark:text-white">Blood Group:</strong> {pat.blood_group || 'N/A'}</p>
                    <p><strong className="text-gray-900 dark:text-white">Phone:</strong> {pat.phone_number || 'N/A'}</p>
                    {(pat.height || pat.weight) && (
                      <p className="text-gray-500">
                        Height: {pat.height ? `${pat.height} cm` : '—'} • Weight: {pat.weight ? `${pat.weight} kg` : '—'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 text-right">
                  <span className="text-[11px] text-gray-400 font-mono">Patient ID #{pat.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-base">No patients enrolled in your hospital clinic.</p>
            <Link
              to="/hospital-admin/add-patient"
              className="mt-3 inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl"
            >
              Add First Patient
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
