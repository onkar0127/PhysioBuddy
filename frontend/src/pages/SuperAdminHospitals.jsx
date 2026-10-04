import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';

export default function SuperAdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [hospitalDetail, setHospitalDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/superadmin/hospitals/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error(err);
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

  const filtered = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (h.city && h.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
    h.admin_username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="superadmin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>🏥</span> Hospitals & Clinics Directory
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Browse all organizations registered on PhysioBuddy and inspect their affiliated therapists and patients.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by hospital name, city, or admin username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-500/20 text-sm shadow-sm"
            />
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Hospitals Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((h) => (
              <div 
                key={h.id}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl p-2 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      🏥
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      ID: #{h.id}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    {h.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    📍 {h.city || "Location not specified"} {h.address ? `• ${h.address}` : ""}
                  </p>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/60 text-xs space-y-1 mb-4">
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Admin:</strong> {h.admin_username} ({h.admin_email})
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Phone:</strong> {h.phone_number}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Registered on: {h.created_at}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-center">
                      <span className="block text-lg font-black text-cyan-700 dark:text-cyan-300">{h.doctors_count}</span>
                      <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">Doctors</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-center">
                      <span className="block text-lg font-black text-blue-700 dark:text-blue-300">{h.patients_count}</span>
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">Patients</span>
                    </div>
                  </div>

                  <button
                    onClick={() => viewHospitalDetails(h.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition"
                  >
                    View Associated Staff & Patients →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-base">No hospitals matched your search query.</p>
          </div>
        )}

        {/* Hospital Detail Modal */}
        {selectedHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {hospitalDetail ? hospitalDetail.name : "Loading..."}
                  </h3>
                  {hospitalDetail && (
                    <p className="text-xs text-gray-500 mt-1">
                      Admin: <span className="font-mono font-bold text-purple-600">{hospitalDetail.admin_username}</span> • Location: {hospitalDetail.city || 'N/A'} • Phone: {hospitalDetail.phone_number || 'N/A'}
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
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
                </div>
              )}

              {hospitalDetail && (
                <div className="space-y-8">
                  {/* Doctors */}
                  <div>
                    <h4 className="text-lg font-bold text-cyan-800 dark:text-cyan-300 mb-3 flex items-center gap-2">
                      <span>👨‍⚕️</span> Affiliated Doctors ({hospitalDetail.doctors.length})
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
                      <p className="text-xs text-gray-400 italic">No doctors assigned yet to this hospital.</p>
                    )}
                  </div>

                  {/* Patients */}
                  <div>
                    <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                      <span>🧑‍🦽</span> Registered Patients ({hospitalDetail.patients.length})
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
