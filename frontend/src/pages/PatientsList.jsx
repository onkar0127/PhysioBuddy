import React, { useState } from "react";
import "./PatientsList.css";
import { useNavigate } from "react-router-dom";

const PatientsList = () => {
  const [patients, setPatients] = useState([
    {
      id: 1,
      name: "Ramesh Patil",
      exercises: [
        { name: "Push Ups", completed: false },
        { name: "Squats", completed: true }
      ]
    },
    {
      id: 2,
      name: "Sita Desai",
      exercises: [
        { name: "Plank", completed: false }
      ]
    },
    {
      id: 3,
      name: "Amit Sharma",
      exercises: [
        { name: "Lunges", completed: true },
        { name: "Sit Ups", completed: false },
        { name: "Push Ups", completed: false }
      ]
    }
  ]);

  const navigate = useNavigate();

  return (
    <div className="patients-container">
      <h2 className="title">Doctor's Patients List</h2>
      <table className="patients-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Allotted Exercises</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id}>
              <td className="patient-name">{patient.name}</td>
              <td>
                {patient.exercises.map((ex, idx) => (
                  <div key={idx} className="exercise-item">
                    {ex.name}
                  </div>
                ))}
              </td>
              <td>
                {patient.exercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className={`exercise-status ${ex.completed ? "completed" : "not-completed"}`}
                  >
                    {ex.completed ? "Completed" : "Pending"}
                  </div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsList;
