import React, { useState } from "react";
import "./ExerciseList.css";
import { useNavigate } from "react-router-dom";

const ExerciseList = () => {
  const [exercises, setExercises] = useState([
    { id: 1, name: "Push Ups", repetitions: 20, started: false, video: "https://www.youtube.com/watch?v=IODxDxX7oi4" },
    { id: 2, name: "Squats", repetitions: 15, started: false, video: "https://www.youtube.com/watch?v=aclHkVaku9U" },
    { id: 3, name: "Plank (seconds)", repetitions: 60, started: false, video: "https://www.youtube.com/watch?v=pSHjTRCQxIw" },
    { id: 4, name: "Jumping Jacks", repetitions: 25, started: false, video: "https://www.youtube.com/watch?v=c4DAnQ6DtF8" }
  ]);

  const [error, setError] = useState("");

  const handleStart = async (exercise) => {
    if (!exercise.repetitions || exercise.repetitions <= 0) {
      setError("⚠️ Invalid repetition count.");
      return;
    }
    setError("");

    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === exercise.id ? { ...ex, started: true } : ex
      )
    );

    try {
      const response = await fetch("http://localhost:5000/api/exercises/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseName: exercise.name,
          repetitions: exercise.repetitions,
          started: true,
          patientId: "12345",
          startedAt: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error("Failed to save exercise");

      const data = await response.json();
      console.log("✅ Exercise sent:", data);
      alert(`${exercise.name} started with ${exercise.repetitions} reps.`);
    } catch (err) {
      console.error(err);
      alert("❌ Error: Could not send data to server.");
    }
  };
  const navigate = useNavigate();

  return (
    <div className="page-wrapper">
      <header>
        <h1>🏃 Patient Exercise List</h1>
        <p className="subtitle">Track, Validate and Start Exercise</p>
      </header>

      {error && <div className="error-box">{error}</div>}

      {/* Top Row - Push Ups & Squats */}
      <div className="exercise-row">
        {exercises.slice(0, 2).map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <h2>{exercise.name}</h2>
            <p className="reps">
              Assigned Repetitions: <b>{exercise.repetitions}</b>
            </p>
            <button 
            onClick={() => navigate("/patients")}
              className="start-btn"
              disabled={exercise.started}
              //onClick={() => handleStart(exercise)}
            >
              {exercise.started ? "✅ In Progress" : "▶ Start Exercise"}
            </button>
            <a
              href={exercise.video}
              target="_blank"
              rel="noopener noreferrer"
              className="video-btn"
            >
              🎥 Demo Video
            </a>
          </div>
        ))}
      </div>

      {/* Bottom Row - Plank & Jumping Jacks */}
      <div className="exercise-row">
        {exercises.slice(2).map((exercise) => (
          <div key={exercise.id} className="exercise-card">
            <h2>{exercise.name}</h2>
            <p className="reps">
              Assigned Repetitions: <b>{exercise.repetitions}</b>
            </p>
            <button
            onClick={() => navigate("/patients")}             
            className="start-btn"
            disabled={exercise.started}
              //onClick={() => handleStart(exercise)}
            >
              {exercise.started ? "✅ In Progress" : "▶ Start Exercise"}
            </button>
            <a
              href={exercise.video}
              target="_blank"
              rel="noopener noreferrer"
              className="video-btn"
            >
              🎥 Demo Video
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
