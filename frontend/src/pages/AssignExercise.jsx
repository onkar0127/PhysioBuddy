import React, { useState } from 'react';
import './AssignExercise.css';

export default function SimpleExerciseAssign() {
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      exerciseName: 'Shoulder Stretch',
      patientName: 'John Mitchell',
      duration: 30,
      frequency: 'Daily',
      startDate: '2025-02-25',
      endDate: '2025-03-11',
      intensity: 'moderate',
      description: 'Hold each stretch for 20 seconds'
    },
    {
      id: 2,
      exerciseName: 'Leg Strengthening',
      patientName: 'Sarah Johnson',
      duration: 20,
      frequency: '3x per week',
      startDate: '2025-02-20',
      endDate: '2025-03-20',
      intensity: 'high',
      description: 'Perform slow, controlled movements'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formInput, setFormInput] = useState({
    exerciseName: '',
    patientName: '',
    duration: '',
    frequency: 'Daily',
    startDate: '',
    endDate: '',
    intensity: 'low',
    description: ''
  });

  const exerciseList = [
    'Shoulder Stretch',
    'Leg Strengthening',
    'Back Extension',
    'Core Stabilization',
    'Hip Mobility',
    'Knee Bends',
    'Arm Raises',
    'Balance Training'
  ];

  const patientList = [
    'John Mitchell',
    'Sarah Johnson',
    'Michael Chen',
    'Emma Rodriguez',
    'David Thompson'
  ];

  const handleAssignExercise = () => {
    if (
      formInput.exerciseName &&
      formInput.patientName &&
      formInput.duration &&
      formInput.startDate &&
      formInput.endDate
    ) {
      const newAssignment = {
        id: Date.now(),
        ...formInput
      };
      setAssignments([newAssignment, ...assignments]);
      setFormInput({
        exerciseName: '',
        patientName: '',
        duration: '',
        frequency: 'Daily',
        startDate: '',
        endDate: '',
        intensity: 'low',
        description: ''
      });
      setShowForm(false);
    }
  };

  const handleDeleteExercise = (id) => {
    setAssignments(assignments.filter(item => item.id !== id));
  };

  const filteredList = assignments.filter(item =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.exerciseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDayCount = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="exercise-container">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <h1>Exercise Assignments</h1>
          <p>Manage and assign exercises to patients</p>
        </div>
        <button
          className="btn-add"
          onClick={() => setShowForm(!showForm)}
        >
          + New Assignment
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="form-container">
          <div className="form-title">Create New Assignment</div>
          
          <div className="form-grid">
            <div className="form-field">
              <label>Exercise</label>
              <input
                type="text"
                list="exercises"
                placeholder="Select exercise"
                value={formInput.exerciseName}
                onChange={(e) => setFormInput({...formInput, exerciseName: e.target.value})}
                className="form-input"
              />
              <datalist id="exercises">
                {exerciseList.map(ex => <option key={ex} value={ex} />)}
              </datalist>
            </div>

            <div className="form-field">
              <label>Patient</label>
              <input
                type="text"
                list="patients"
                placeholder="Select patient"
                value={formInput.patientName}
                onChange={(e) => setFormInput({...formInput, patientName: e.target.value})}
                className="form-input"
              />
              <datalist id="patients">
                {patientList.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>

            <div className="form-field">
              <label>Duration (minutes)</label>
              <input
                type="number"
                placeholder="e.g., 30"
                value={formInput.duration}
                onChange={(e) => setFormInput({...formInput, duration: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>Frequency</label>
              <select
                value={formInput.frequency}
                onChange={(e) => setFormInput({...formInput, frequency: e.target.value})}
                className="form-input"
              >
                <option>Daily</option>
                <option>2x per week</option>
                <option>3x per week</option>
                <option>4x per week</option>
                <option>5x per week</option>
                <option>As needed</option>
              </select>
            </div>

            <div className="form-field">
              <label>Intensity</label>
              <select
                value={formInput.intensity}
                onChange={(e) => setFormInput({...formInput, intensity: e.target.value})}
                className="form-input"
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="form-field">
              <label>Start Date</label>
              <input
                type="date"
                value={formInput.startDate}
                onChange={(e) => setFormInput({...formInput, startDate: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label>End Date</label>
              <input
                type="date"
                value={formInput.endDate}
                onChange={(e) => setFormInput({...formInput, endDate: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-field full-width">
              <label>Description</label>
              <textarea
                placeholder="Add any notes or instructions..."
                value={formInput.description}
                onChange={(e) => setFormInput({...formInput, description: e.target.value})}
                className="form-textarea"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-submit" onClick={handleAssignExercise}>
              Assign Exercise
            </button>
            <button className="btn-cancel" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search by patient or exercise name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Assignments List */}
      {filteredList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>{searchQuery ? 'No assignments found' : 'No assignments yet'}</p>
        </div>
      ) : (
        <div className="assignments-list">
          {filteredList.map((assignment) => (
            <div key={assignment.id} className={`assignment-card intensity-${assignment.intensity}`}>
              <div className="card-header">
                <div className="card-title-section">
                  <h3>{assignment.exerciseName}</h3>
                  <span className={`intensity-badge ${assignment.intensity}`}>
                    {assignment.intensity.charAt(0).toUpperCase() + assignment.intensity.slice(1)}
                  </span>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteExercise(assignment.id)}
                  title="Delete assignment"
                >
                  ✕
                </button>
              </div>

              <div className="card-content">
                <div className="info-item">
                  <span className="info-label">Patient:</span>
                  <span className="info-value">{assignment.patientName}</span>
                </div>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Duration</span>
                    <span className="info-value">{assignment.duration} min</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Frequency</span>
                    <span className="info-value">{assignment.frequency}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Program</span>
                    <span className="info-value">{getDayCount(assignment.startDate, assignment.endDate)} days</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Period</span>
                    <span className="info-value">
                      {new Date(assignment.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(assignment.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {assignment.description && (
                  <div className="description-section">
                    <span className="description-label">Notes:</span>
                    <p className="description-text">{assignment.description}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}