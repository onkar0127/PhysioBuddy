// // import React, { useState } from "react";
// // import "./ExerciseList.css";
// // import { useNavigate } from "react-router-dom";

// // const ExerciseList = () => {
// //   const [exercises, setExercises] = useState([
// //     { id: 1, name: "Push Ups", repetitions: 20, started: false, video: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
// //     { id: 2, name: "Squats", repetitions: 15, started: false, video: "https://www.youtube.com/watch?v=aclHkVaku9U" },
// //     { id: 3, name: "Plank (seconds)", repetitions: 60, started: false, video: "https://www.youtube.com/watch?v=pSHjTRCQxIw" },
// //     { id: 4, name: "Jumping Jacks", repetitions: 25, started: false, video: "https://www.youtube.com/watch?v=c4DAnQ6DtF8" }
// //   ]);

// //   const [error, setError] = useState("");

// //   const handleStart = async (exercise) => {
// //     if (!exercise.repetitions || exercise.repetitions <= 0) {
// //       setError("⚠️ Invalid repetition count.");
// //       return;
// //     }
// //     setError("");

// //     setExercises((prev) =>
// //       prev.map((ex) =>
// //         ex.id === exercise.id ? { ...ex, started: true } : ex
// //       )
// //     );

// //     try {
// //       const response = await fetch("http://localhost:5000/api/exercises/start", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           exerciseName: exercise.name,
// //           repetitions: exercise.repetitions,
// //           started: true,
// //           patientId: "12345",
// //           startedAt: new Date().toISOString()
// //         })
// //       });

// //       if (!response.ok) throw new Error("Failed to save exercise");

// //       const data = await response.json();
// //       console.log("✅ Exercise sent:", data);
// //       alert(`${exercise.name} started with ${exercise.repetitions} reps.`);
// //     } catch (err) {
// //       console.error(err);
// //       alert("❌ Error: Could not send data to server.");
// //     }
// //   };
// //   const navigate = useNavigate();

// //   return (
// //     <div className="page-wrapper">
// //       <header>
// //         <h1>🏃 Patient Exercise List</h1>
// //         <p className="subtitle">Track, Validate and Start Exercise</p>
// //       </header>

// //       {error && <div className="error-box">{error}</div>}

// //       {/* Top Row - Push Ups & Squats */}
// //       <div className="exercise-row">
// //         {exercises.slice(0, 2).map((exercise) => (
// //           <div key={exercise.id} className="exercise-card">
// //             <h2>{exercise.name}</h2>
// //             <p className="reps">
// //               Assigned Repetitions: <b>{exercise.repetitions}</b>
// //             </p>
// //             <button 
// //             onClick={() => navigate("/patients")}
// //               className="start-btn"
// //               disabled={exercise.started}
// //               //onClick={() => handleStart(exercise)}
// //             >
// //               {exercise.started ? "✅ In Progress" : "▶ Start Exercise"}
// //             </button>
// //             <a
// //               href={exercise.video}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               className="video-btn"
// //             >
// //               🎥 Demo Video
// //             </a>
// //           </div>
// //         ))}
// //       </div>

// //       {/* Bottom Row - Plank & Jumping Jacks */}
// //       <div className="exercise-row">
// //         {exercises.slice(2).map((exercise) => (
// //           <div key={exercise.id} className="exercise-card">
// //             <h2>{exercise.name}</h2>
// //             <p className="reps">
// //               Assigned Repetitions: <b>{exercise.repetitions}</b>
// //             </p>
// //             <button
// //             onClick={() => navigate("/patients")}             
// //             className="start-btn"
// //             disabled={exercise.started}
// //               //onClick={() => handleStart(exercise)}
// //             >
// //               {exercise.started ? "✅ In Progress" : "▶ Start Exercise"}
// //             </button>
// //             <a
// //               href={exercise.video}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               className="video-btn"
// //             >
// //               🎥 Demo Video
// //             </a>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ExerciseList;




// import React, { useState } from 'react';

// // --- Mock Data ---
// const initialExercises = [
//   {
//     id: 1,
//     name: 'Bicep Curl',
//     reps: 15,
//     sets: 3,
//     duration: '30 sec rest',
//     category: 'Upper Body',
//     completed: false,
//     videoThumb: 'live/',
//   },
//   {
//     id: 2,
//     name: 'Standing Knee Lift',
//     reps: 10,
//     sets: 3,
//     duration: '20 sec rest',
//     category: 'Lower Body',
//     completed: true,
//     videoThumb: 'https://placehold.co/80x80/0e7490/ffffff?text=KL',
//   },
//   {
//     id: 3,
//     name: 'Shoulder Press',
//     reps: 12,
//     sets: 4,
//     duration: '45 sec rest',
//     category: 'Upper Body',
//     completed: false,
//     videoThumb: 'https://placehold.co/80x80/0891b2/ffffff?text=SP',
//   },
//   {
//     id: 4,
//     name: 'Hip Abduction',
//     reps: 20,
//     sets: 2,
//     duration: '30 sec rest',
//     category: 'Lower Body',
//     completed: false,
//     videoThumb: 'https://placehold.co/80x80/0e7490/ffffff?text=HA',
//   },
// ];

// // --- Sub Components ---

// const StatusBadge = ({ completed }) =>
//   completed ? (
//     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
//       <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
//         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
//       </svg>
//       Exercise Completed
//     </span>
//   ) : (
//     <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
//       <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
//         <circle cx="10" cy="10" r="8" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" fill="none"/>
//       </svg>
//       Incomplete
//     </span>
//   );

// const CategoryPill = ({ category }) => (
//   <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
//     {category}
//   </span>
// );

// const ExerciseCard = ({ exercise, onToggle, onStart }) => {
//   const { id, name, reps, sets, duration, category, completed, videoThumb } = exercise;

//   return (
//     <div
//       className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
//         completed
//           ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-md'
//           : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
//       }`}
//     >
//       {/* Completed overlay stripe */}
//       {completed && (
//         <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
//           <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10" />
//         </div>
//       )}

//       {/* Thumbnail */}
//       <div className="flex-shrink-0">
//         <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-200 dark:border-cyan-800">
//           <img src={videoThumb} alt={name} className="w-full h-full object-cover" />
//           {completed && (
//             <div className="absolute inset-0 bg-emerald-500/40 flex items-center justify-center">
//               <svg className="w-7 h-7 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
//               </svg>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Info */}
//       <div className="flex-1 min-w-0">
//         <div className="flex flex-wrap items-center gap-2 mb-1">
//           <h3 className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${completed ? 'text-emerald-800 dark:text-emerald-300 line-through decoration-emerald-400' : 'text-cyan-900 dark:text-cyan-300'}`}>
//             {name}
//           </h3>
//           <CategoryPill category={category} />
//         </div>

//         <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
//           <span className="flex items-center gap-1">
//             <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             <strong className="text-gray-700 dark:text-gray-300">{reps} reps</strong>
//           </span>
//           <span className="flex items-center gap-1">
//             <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//             </svg>
//             <strong className="text-gray-700 dark:text-gray-300">{sets} sets</strong>
//           </span>
//           <span className="flex items-center gap-1">
//             <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             {duration}
//           </span>
//         </div>

//         <div className="mt-3">
//           <StatusBadge completed={completed} />
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
//         {!completed && (
//           <button
//             onClick={() => onStart(id)}
//             className="flex-1 sm:flex-none px-5 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
//           >
//             ▶ Start
//           </button>
//         )}
//         <button
//           onClick={() => onToggle(id)}
//           className={`flex-1 sm:flex-none px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
//             completed
//               ? 'border-emerald-400 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 focus:ring-emerald-400'
//               : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-400'
//           }`}
//         >
//           {completed ? '↩ Undo' : '✓ Mark Done'}
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- Main Page ---
// export default function AssignedExercises() {
//   const [exercises, setExercises] = useState(initialExercises);
//   const [activeTab, setActiveTab] = useState('all');
//   const [startedId, setStartedId] = useState(null);

//   const completedCount = exercises.filter(e => e.completed).length;
//   const total = exercises.length;
//   const progressPercent = Math.round((completedCount / total) * 100);

//   const handleToggle = (id) => {
//     setExercises(prev =>
//       prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e)
//     );
//   };

//   const handleStart = (id) => {
//     setStartedId(id);
//     setTimeout(() => setStartedId(null), 2000);
//   };

//   const filtered = exercises.filter(e => {
//     if (activeTab === 'all') return true;
//     if (activeTab === 'pending') return !e.completed;
//     if (activeTab === 'done') return e.completed;
//     return true;
//   });

//   const tabs = [
//     { key: 'all', label: `All (${total})` },
//     { key: 'pending', label: `Pending (${total - completedCount})` },
//     { key: 'done', label: `Done (${completedCount})` },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter] transition-colors duration-500">

//       {/* Header */}
//       <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md transition-colors duration-500">
//         <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={() => window.history.back()}
//               className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
//             >
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>
//             <h1 className="text-lg font-extrabold text-cyan-900 dark:text-cyan-400 tracking-tight">
//               My Exercises
//             </h1>
//           </div>
//           <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
//             Today's Plan
//           </span>
//         </div>
//       </header>

//       <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

//         {/* Progress Card */}
//         <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-900 rounded-2xl p-6 shadow-xl text-white">
//           <div className="flex justify-between items-start mb-4">
//             <div>
//               <p className="text-cyan-100 text-sm font-semibold uppercase tracking-wide">Today's Progress</p>
//               <p className="text-4xl font-extrabold mt-1">{completedCount}<span className="text-2xl font-semibold text-cyan-200">/{total}</span></p>
//               <p className="text-cyan-100 text-sm mt-1">exercises completed</p>
//             </div>
//             <div className="relative w-16 h-16">
//               <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
//                 <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
//                 <circle
//                   cx="32" cy="32" r="26" fill="none"
//                   stroke="white" strokeWidth="6"
//                   strokeDasharray={`${2 * Math.PI * 26}`}
//                   strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercent / 100)}`}
//                   strokeLinecap="round"
//                   className="transition-all duration-700"
//                 />
//               </svg>
//               <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{progressPercent}%</span>
//             </div>
//           </div>
//           {/* Progress bar */}
//           <div className="h-2 bg-white/20 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-white rounded-full transition-all duration-700"
//               style={{ width: `${progressPercent}%` }}
//             />
//           </div>
//         </div>

//         {/* Toast for started exercise */}
//         {startedId && (
//           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-cyan-600 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold animate-bounce">
//             ▶ Starting {exercises.find(e => e.id === startedId)?.name}...
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
//           {tabs.map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setActiveTab(tab.key)}
//               className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
//                 activeTab === tab.key
//                   ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-md'
//                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         {/* Exercise List */}
//         <div className="space-y-4">
//           {filtered.length === 0 ? (
//             <div className="text-center py-16 text-gray-400 dark:text-gray-600">
//               <svg className="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//               </svg>
//               <p className="font-semibold">No exercises here</p>
//             </div>
//           ) : (
//             filtered.map(exercise => (
//               <ExerciseCard
//                 key={exercise.id}
//                 exercise={exercise}
//                 onToggle={handleToggle}
//                 onStart={handleStart}
//               />
//             ))
//           )}
//         </div>

//         {/* All done banner */}
//         {completedCount === total && (
//           <div className="text-center py-8 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
//             <div className="text-4xl mb-2">🎉</div>
//             <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">All Done!</h3>
//             <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-1">You've completed today's full exercise plan.</p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';

// ─── Status Badge ─────────────────────────────────────────────────
const StatusBadge = ({ completed }) =>
  completed ? (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
      Exercise Completed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
      <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500" />
      Incomplete
    </span>
  );

// ─── Skeleton Loader ──────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md">
    <div className="flex-1 space-y-3 w-full">
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4" />
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
    </div>
    <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-full" />
  </div>
);

// ─── Exercise Card ────────────────────────────────────────────────
const ExerciseCard = ({ exercise }) => {
  const { exercise_name, target_reps, is_completed, date_assigned } = exercise;

  const formattedDate = date_assigned
    ? new Date(date_assigned).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <div
      className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
        is_completed
          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-md'
          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
      }`}
    >
      {is_completed && (
        <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 pointer-events-none" />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3
          className={`text-lg font-extrabold tracking-tight transition-colors duration-300 ${
            is_completed
              ? 'text-emerald-800 dark:text-emerald-300 line-through decoration-emerald-400'
              : 'text-cyan-900 dark:text-cyan-300'
          }`}
        >
          {exercise_name}
        </h3>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {target_reps} reps
          {formattedDate && (
            <span className="ml-3 text-xs text-gray-400 dark:text-gray-500">
              · Assigned {formattedDate}
            </span>
          )}
        </p>

        <div className="mt-3">
          <StatusBadge completed={is_completed} />
        </div>
      </div>

      {/* Start button — only if not completed */}
      {!is_completed && (
        <a
          href="/live"
          className="flex-shrink-0 text-center px-6 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          ▶ Start
        </a>
      )}
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-cyan-300 dark:text-cyan-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-cyan-900 dark:text-cyan-400 mb-2">
      No Exercises Today
    </h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
      You have no exercises assigned for today. Your therapist will update your plan soon.
    </p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5">
      <svg className="w-10 h-10 text-red-400 dark:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-extrabold text-red-700 dark:text-red-400 mb-2">Something Went Wrong</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
    >
      Try Again
    </button>
  </div>
);

// ─── CSRF helper ──────────────────────────────────────────────────
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

// ─── Main Page ────────────────────────────────────────────────────
export default function AssignedExercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // ── Fetch from Django API ──────────────────────────────────────
  const 
  fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/get-exercise-list/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'X-CSRFToken': getCookie('csrftoken'),
        },
        credentials: 'include', // sends session cookie for Django auth
      });

      if (res.status === 403) throw new Error('You do not have permission to view this page.');
      if (res.status === 404) throw new Error('Patient profile not found.');
      if (!res.ok)            throw new Error(`Server error (${res.status}). Please try again.`);

      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load exercises.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExercises(); }, []);

  // ── Derived stats ──────────────────────────────────────────────
  const completedCount  = exercises.filter(e => e.is_completed).length;
  const total           = exercises.length;
  const progressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // ── Tab filtering ──────────────────────────────────────────────
  const filtered = exercises.filter(e => {
    if (activeTab === 'pending') return !e.is_completed;
    if (activeTab === 'done')    return  e.is_completed;
    return true;
  });

  const tabs = [
    { key: 'all',     label: `All (${total})` },
    { key: 'pending', label: `Pending (${total - completedCount})` },
    { key: 'done',    label: `Done (${completedCount})` },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter] transition-colors duration-500">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md transition-colors duration-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-lg font-extrabold text-cyan-900 dark:text-cyan-400 tracking-tight">
              My Exercises
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Today's Plan</span>
            {/* Manual refresh */}
            <button
              onClick={fetchExercises}
              disabled={loading}
              title="Refresh"
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition disabled:opacity-40"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Loading Skeletons ───────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error State ─────────────────────────────────────── */}
        {!loading && error && (
          <ErrorState message={error} onRetry={fetchExercises} />
        )}

        {/* ── Empty State ─────────────────────────────────────── */}
        {!loading && !error && total === 0 && <EmptyState />}

        {/* ── Main Content ────────────────────────────────────── */}
        {!loading && !error && total > 0 && (
          <>
            {/* Progress Card */}
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-900 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest mb-1">Today's Progress</p>
                  <p className="text-4xl font-extrabold">
                    {completedCount}
                    <span className="text-2xl font-semibold text-cyan-200">/{total}</span>
                  </p>
                  <p className="text-cyan-100 text-sm mt-1">exercises completed</p>
                </div>
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke="white" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 26}`}
                      strokeDashoffset={`${2 * Math.PI * 26 * (1 - progressPercent / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {progressPercent}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-white dark:bg-gray-700 text-cyan-700 dark:text-cyan-400 shadow-md'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Exercise Cards */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600 font-semibold">
                  No exercises in this category.
                </div>
              ) : (
                filtered.map((exercise, idx) => (
                  <ExerciseCard key={idx} exercise={exercise} />
                ))
              )}
            </div>

            {/* All done banner */}
            {completedCount === total && (
              <div className="text-center py-10 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">All Done for Today!</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">
                  Great work! Your therapist will review your progress.
                </p>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}