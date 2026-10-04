import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDetail, setHospitalDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/superadmin/dashboard/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError("Failed to load Super Admin dashboard data.");
      }
    } catch (err) {
      console.error(err);
      setError("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  const viewHospitalDetails = async (hospitalId) => {
    try {
      setSelectedHospital(hospitalId);
      setLoadingDetail(true);
      const res = await fetch(`${API_BASE}/api/superadmin/hospitals/${hospitalId}/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setHospitalDetail(data);
      }
    } catch (err) {
      console.error("Failed to load hospital details", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="superadmin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 p-8 shadow-2xl text-white mb-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Platform Control Center
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Super Admin Dashboard
              </h1>
              <p className="mt-2 text-purple-100 text-sm sm:text-base max-w-xl">
                Comprehensive platform-wide view of all registered hospitals, medical staff, patients, and global physiotherapy exercises.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/super-admin/hospitals"
                className="px-5 py-2.5 rounded-xl bg-white text-purple-700 font-bold text-sm shadow-lg hover:bg-purple-50 transition flex items-center gap-2"
              >
                <span>🏥</span> View All Hospitals
              </Link>
              <Link
                to="/super-admin/add-exercise"
                className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold text-sm border border-white/30 transition flex items-center gap-2"
              >
                <span>➕</span> Add Exercise
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Metric Cards Grid */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              {/* Total Hospitals */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Hospitals</span>
                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 text-lg">🏥</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.total_hospitals}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered clinics</p>
              </div>

              {/* Total Doctors */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Doctors</span>
                  <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500 text-lg">👨‍⚕️</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.total_doctors}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all hospitals</p>
              </div>

              {/* Total Patients */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Patients</span>
                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 text-lg">🧑‍🦽</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.total_patients}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Active patients</p>
              </div>

              {/* Total Exercises */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Exercises</span>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-lg">🏋️‍♂️</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.total_exercises}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Global library</p>
              </div>

              {/* Total Assignments */}
              <div className="col-span-2 lg:col-span-1 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Assignments</span>
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500 text-lg">📋</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {stats.total_assignments}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total prescribed</p>
              </div>
            </div>

            {/* Hospitals Overview Section */}
            <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🏥</span> Registered Hospitals & Clinics
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Click "View Details" on any hospital to inspect its associated doctors and patients.
                  </p>
                </div>
                <Link
                  to="/super-admin/hospitals"
                  className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                >
                  View All Hospitals →
                </Link>
              </div>

              {stats.recent_hospitals && stats.recent_hospitals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Hospital Name</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">Admin Username</th>
                        <th className="py-3 px-4 text-center">Doctors</th>
                        <th className="py-3 px-4 text-center">Patients</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {stats.recent_hospitals.map((h) => (
                        <tr key={h.id} className="hover:bg-cyan-50/50 dark:hover:bg-cyan-950/20 transition">
                          <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                            {h.name}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                            {h.city || "—"}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono">
                              {h.admin_username}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                              {h.doctors_count}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                              {h.patients_count}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 text-xs">
                            {h.created_at}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => viewHospitalDetails(h.id)}
                              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition"
                            >
                              Inspect Staff & Patients
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-base font-semibold">No hospitals registered on the platform yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Hospitals register via the public hospital registration portal.</p>
                </div>
              )}
            </div>

            {/* Platform & Backend Administration Section */}
            <div className="backdrop-blur-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/40 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                  Django Backend Control
                </span>
                <h3 className="text-xl font-bold text-white mt-2 flex items-center gap-2">
                  <span>⚙️</span> Django Administration Panel
                </h3>
                <p className="text-xs text-gray-300 mt-1 max-w-xl">
                  Access the low-level Django ORM management console to inspect raw database tables, user authentication permissions, session logs, and system models.
                </p>
              </div>
              <a
                href={`${API_BASE}/admin/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-500/30 transition flex items-center justify-center gap-2 flex-shrink-0"
              >
                <span>🚀</span> Open Django Admin ↗
              </a>
            </div>
          </>
        )}

        {/* Hospital Details Modal */}
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {hospitalDetail ? hospitalDetail.name : "Loading Hospital Details..."}
                  </h3>
                  {hospitalDetail && (
                    <p className="text-xs text-gray-500 mt-1">
                      Admin: <span className="font-mono font-bold text-purple-600">{hospitalDetail.admin_username}</span> ({hospitalDetail.email}) • City: {hospitalDetail.city || 'N/A'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setSelectedHospital(null); setHospitalDetail(null); }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                >
                  ✕
                </button>
              </div>

              {loadingDetail && (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-500"></div>
                </div>
              )}

              {hospitalDetail && (
                <div className="space-y-8">
                  {/* Doctors Section */}
                  <div>
                    <h4 className="text-lg font-bold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                      <span>👨‍⚕️</span> Linked Doctors ({hospitalDetail.doctors.length})
                    </h4>
                    {hospitalDetail.doctors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hospitalDetail.doctors.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                            <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                              Dr. {doc.username}
                            </h5>
                            <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">{doc.speciality} • {doc.qualification}</p>
                            <p className="text-xs text-gray-500 mt-1">📧 {doc.email} • 📞 {doc.phone_number}</p>
                            <div className="mt-2 inline-block px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/40 text-[11px] font-bold text-cyan-700 dark:text-cyan-300">
                              {doc.patient_count} Assigned Patients
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No doctors added to this hospital yet.</p>
                    )}
                  </div>

                  {/* Patients Section */}
                  <div>
                    <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span>🧑‍🦽</span> Linked Patients ({hospitalDetail.patients.length})
                    </h4>
                    {hospitalDetail.patients.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {hospitalDetail.patients.map((pat) => (
                          <div key={pat.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                            <h5 className="font-bold text-gray-900 dark:text-white text-sm">
                              {pat.username}
                            </h5>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              Assigned Doctor: <span className="font-bold text-cyan-600 dark:text-cyan-400">{pat.assigned_doctor}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Gender: {pat.gender} • Blood: {pat.blood_group} • 📧 {pat.email}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No patients registered under this hospital yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
