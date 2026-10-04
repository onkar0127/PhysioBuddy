import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { Link } from 'react-router-dom';
import { ensureCsrfToken } from '../csrf';

/**
 * Super Admin Global Exercise Library Page
 * 
 * Manages the global repository of physical therapy exercises:
 * - Searchable catalog by exercise name or description
 * - "Add New Exercise" shortcut directing to `/super-admin/add-exercise`
 * - Deletion trigger with confirmation dialog
 * - Links to video demonstrations and creator attribution
 */
export default function SuperAdminExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Fetch exercises list on mount
  useEffect(() => {
    fetchExercises();
  }, []);

  /**
   * Loads all global exercises from Django REST endpoint
   */
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/superadmin/exercises/`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setExercises(data);
      }
    } catch (err) {
      console.error("Failed to load exercises", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes an exercise from the database after confirmation
   * @param {number} id - Exercise database ID
   * @param {string} name - Name of exercise for user prompt
   */
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete exercise '${name}'?`)) return;

    try {
      setDeletingId(id);
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/superadmin/exercises/${id}/delete/`, {
        method: 'POST',
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      if (res.ok) {
        // Remove deleted exercise from local state
        setExercises(prev => prev.filter(ex => ex.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter exercises by user search input query
  const filtered = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      {/* Super Admin Navigation */}
      <Navbar role="superadmin" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with "Add New Exercise" button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>🏋️‍♂️</span> Global Exercise Library
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Super Admin library of physical therapy exercises available for all doctors to assign to patients.
            </p>
          </div>
          {/* Add Exercise button placed inside the Exercise Library */}
          <Link
            to="/super-admin/add-exercise"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2"
          >
            <span>➕</span> Add New Exercise
          </Link>
        </div>

        {/* Live Search Input */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search exercises by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 text-sm shadow-sm"
          />
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Exercise Cards Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ex) => (
              <div 
                key={ex.id}
                className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {ex.name}
                    </h3>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(ex.id, ex.name)}
                      disabled={deletingId === ex.id}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs transition cursor-pointer"
                      title="Delete Exercise"
                    >
                      🗑️
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {ex.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {ex.demo_video_url && (
                    <a
                      href={ex.demo_video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <span>🎬</span> View Demo Video URL ↗
                    </a>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>Added by: {ex.created_by}</span>
                    <span>{ex.created_at || 'Standard'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Search Result Fallback */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 dark:text-gray-400 text-base">No exercises found.</p>
            <Link
              to="/super-admin/add-exercise"
              className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Add First Exercise
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
