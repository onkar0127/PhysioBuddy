import React, { useState, useEffect } from "react";
import pb from "../assets/pb.png";
import { Link } from "react-router-dom";

// Theme Toggle (same as landing page)
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    aria-label="Toggle theme"
    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
  >
    {theme === "dark" ? (
      // Sun Icon
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 0 018 0z" />
      </svg>
    ) : (
      // Moon Icon
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )}
  </button>
);

export default function Home() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    theme === "dark"
      ? root.classList.add("dark")
      : root.classList.remove("dark");

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Sample Data (replace with backend later)
  const exercises = [
    {
      id: 1,
      name: "Knee Flexion",
      reps: "3 × 12 reps",
      video: "https://www.youtube.com/embed/8BcPHWGQO44",
      status: "Pending",
    },
    {
      id: 2,
      name: "Shoulder Rotation",
      reps: "2 × 15 reps",
      video: "https://www.youtube.com/embed/2pLT-olgUJs",
      status: "Completed",
    },
    {
      id: 3,
      name: "Back Stretch",
      reps: "3 × 10 reps",
      video: "https://www.youtube.com/embed/v7AYKMP6rOE",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
      
      {/* 🔷 NAVBAR */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <img src={pb} alt="PhysioBuddy Logo" className="h-14" />
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-4">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />

              <button className="px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-gradient-to-r from-cyan-600 to-blue-500 shadow-lg hover:from-cyan-700 hover:to-blue-600 transition transform hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-cyan-300">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🔷 HERO */}
      <section className="bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pt-20 pb-16 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-400">
          Your Recovery Dashboard
        </h1>
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Track and complete your assigned exercises
        </p>
      </section>

      {/* 🔷 EXERCISES */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="p-4 bg-white/30 dark:bg-gray-800/40 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-xl shadow-xl transition transform hover:translate-y-[-4px] hover:shadow-2xl duration-300"
              >
                
                {/* Video */}
                <div className="rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-40"
                    src={exercise.video}
                    title={exercise.name}
                    allowFullScreen
                  ></iframe>
                </div>

                {/* Info */}
                <h3 className="mt-3 text-lg font-bold text-cyan-900 dark:text-cyan-400">
                  {exercise.name}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {exercise.reps}
                </p>

                {/* Action */}
                <div className="mt-4 flex justify-between items-center">
                  
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      exercise.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {exercise.status}
                  </span>

                  <button className="px-4 py-1.5 text-xs font-semibold rounded-full text-white bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-700 hover:to-blue-600 transition transform hover:scale-105">
                    Start
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </div>
  );
}