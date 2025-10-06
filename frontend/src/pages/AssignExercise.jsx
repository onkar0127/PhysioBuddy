import React, { useState } from "react";
import "./AssignExercise.css";
import { useNavigate } from "react-router-dom";

const AssignExercise = () => {
  const navigate = useNavigate();

  // Sample dropdown data — you can replace with backend data if needed
  const patientsList = ["Ramesh Patil", "Sita Desai", "Amit Sharma"];
  const exercisesList = ["Push Ups", "Squats", "Lunges", "Plank", "Sit Ups"];

  const [formData, setFormData] = useState({
    patientName: "",
    exerciseName: "",
    targetRepetition: ""
  });

  const [loading, setLoading] = useState(false);

  // Handle input and dropdown changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission + Fetch API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.patientName || !formData.exerciseName || !formData.targetRepetition) {
      alert("⚠️ Please fill all fields before submitting!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/assign-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Server Response:", data);
        alert("Exercise assigned successfully!");
        setFormData({ patientName: "", exerciseName: "", targetRepetition: "" });

        // Redirect to exercises page after successful submission
        navigate("/exercises");
      } else {
        alert("❌ Failed to assign exercise. Try again.");
      }
    } catch (error) {
      console.error("Error while sending data:", error);
      alert("Server error. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2 className="title">Assign Exercise to Patient</h2>

      <form className="assign-form" onSubmit={handleSubmit}>
        {/* Patient Dropdown */}
        <div className="form-group">
          <label>Patient Name</label>
          <select
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
          >
            <option value="">-- Select Patient --</option>
            {patientsList.map((patient, index) => (
              <option key={index} value={patient}>
                {patient}
              </option>
            ))}
          </select>
        </div>

        {/* Exercise Dropdown */}
        <div className="form-group">
          <label>Exercise Name</label>
          <select
            name="exerciseName"
            value={formData.exerciseName}
            onChange={handleChange}
          >
            <option value="">-- Select Exercise --</option>
            {exercisesList.map((exercise, index) => (
              <option key={index} value={exercise}>
                {exercise}
              </option>
            ))}
          </select>
        </div>

        {/* Target Repetition Input */}
        <div className="form-group">
          <label>Target Repetition</label>
          <input
            type="number"
            name="targetRepetition"
            value={formData.targetRepetition}
            onChange={handleChange}
            placeholder="Enter target repetition"
            min="1"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default AssignExercise;
