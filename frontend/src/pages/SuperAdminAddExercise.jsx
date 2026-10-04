import React, { useState } from 'react';
import { API_BASE } from '../config';
import Navbar from '../Components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { ensureCsrfToken } from '../csrf';

export default function SuperAdminAddExercise() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    demo_video_url: '',
    thumbnail_image_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const csrfToken = await ensureCsrfToken();
      const res = await fetch(`${API_BASE}/api/superadmin/exercises/create/`, {
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
        setSuccess(`Exercise '${formData.name}' added successfully to the global library!`);
        setFormData({
          name: '',
          description: '',
          demo_video_url: '',
          thumbnail_image_url: '',
        });
      } else {
        setError(data.error || 'Failed to create exercise.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900 text-gray-900 dark:text-gray-100 font-[Inter]">
      <Navbar role="superadmin" />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
              <span>🏋️‍♂️</span> Add New Exercise
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add a new rehabilitation exercise to the global library for therapists across all clinics.
            </p>
          </div>
          <Link
            to="/super-admin/exercises"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            ← Back to Exercise Library
          </Link>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/50 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl">
          {success && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm">Success!</h4>
                  <p className="text-xs mt-1">{success}</p>
                </div>
                <button
                  onClick={() => navigate('/super-admin/exercises')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  View in Library →
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Exercise Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Shoulder Abduction, Knee Flexion Extension, Squats"
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Description & Instructions *
              </label>
              <textarea
                rows={4}
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed guidance on how the patient should execute this exercise, posture tips, and target repetitions..."
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Demo Video URL *
              </label>
              <input
                type="url"
                name="demo_video_url"
                required
                value={formData.demo_video_url}
                onChange={handleChange}
                placeholder="https://example.com/videos/exercise-demo.mp4 or YouTube URL"
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Thumbnail Image URL (Optional)
              </label>
              <input
                type="url"
                name="thumbnail_image_url"
                value={formData.thumbnail_image_url}
                onChange={handleChange}
                placeholder="https://example.com/images/exercise-thumbnail.jpg"
                className="w-full rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2.5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Adding Exercise...' : 'Save Exercise to Global Library 🚀'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
