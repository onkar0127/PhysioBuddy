import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

export default function HospitalAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/hospital-admin/dashboard/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const result = await res.json();
        setData(result);
      } else {
        setError("Failed to load hospital dashboard. Ensure you are signed in as a Hospital Admin.");
      }
    } catch (err) {
      console.error(err);
      setError("Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="hospital_admin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600 p-8 shadow-2xl text-white mb-8">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Hospital Administration Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                {data ? data.hospital_name : "Hospital Workspace"}
              </h1>
              <p className="mt-2 text-emerald-100 text-sm sm:text-base max-w-xl">
                Manage your hospital's physiotherapy doctors, register incoming patients, and oversee patient-doctor assignments.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/hospital-admin/add-doctor"
                className="px-5 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-lg hover:bg-emerald-50 transition flex items-center gap-2"
              >
                <span>👨‍⚕️</span> Add Doctor
              </Link>
              <Link
                to="/hospital-admin/add-patient"
                className="px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-bold text-sm border border-white/30 transition flex items-center gap-2"
              >
                <span>🧑‍🦽</span> Add Patient
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Metrics Grid */}
        {data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Total Doctors */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Hospital Doctors</span>
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-lg">👨‍⚕️</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.total_doctors}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Specialists in your clinic</p>
              </div>

              {/* Total Patients */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Hospital Patients</span>
                  <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 text-lg">🧑‍🦽</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.total_patients}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enrolled in your clinic</p>
              </div>

              {/* Today's Prescribed Sessions */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Today's Exercises</span>
                  <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 text-lg">📋</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.today_assignments_total}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assigned for today</p>
              </div>

              {/* Completed Today */}
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border border-white/40 dark:border-gray-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
                  <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 text-lg">✅</span>
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {data.today_assignments_completed}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sessions finished</p>
              </div>
            </div>

            {/* Two Column Section: Doctors & Patients Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Doctors Snapshot */}
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>👨‍⚕️</span> Hospital Doctors
                  </h3>
                  <Link
                    to="/hospital-admin/doctors"
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    View All ({data.total_doctors}) →
                  </Link>
                </div>

                {data.recent_doctors && data.recent_doctors.length > 0 ? (
                  <div className="space-y-3">
                    {data.recent_doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            Dr. {doc.name}
                          </h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {doc.speciality} • {doc.qualification}
                          </p>
                          <p className="text-[11px] text-gray-500">📧 {doc.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                            {doc.patient_count} Patients
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No doctors added yet. Click "+ Add Doctor" above.
                  </div>
                )}
              </div>

              {/* Patients Snapshot */}
              <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/40 dark:border-gray-800 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>🧑‍🦽</span> Hospital Patients
                  </h3>
                  <Link
                    to="/hospital-admin/patients"
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    View All ({data.total_patients}) →
                  </Link>
                </div>

                {data.recent_patients && data.recent_patients.length > 0 ? (
                  <div className="space-y-3">
                    {data.recent_patients.map((pat) => (
                      <div
                        key={pat.id}
                        className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                            {pat.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            Therapist: <span className="font-bold text-teal-600 dark:text-teal-400">{pat.assigned_doctor}</span>
                          </p>
                          <p className="text-[11px] text-gray-500">📧 {pat.email}</p>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                            {pat.gender}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No patients enrolled yet. Click "+ Add Patient" above.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
