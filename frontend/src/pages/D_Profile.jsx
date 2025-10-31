import React, { useEffect, useState } from "react";

export default function D_Profile() {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/doctor/profile/", {
          method: "GET",
          credentials: "include", // important: send session cookie
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setDoctor(result.data);
          } else {
            setError(result.error || "Failed to load doctor profile");
          }
        } else {
          setError(`Server error: ${response.status}`);
        }
      } catch (err) {
        console.error("Error fetching doctor profile:", err);
        setError("Network error while fetching doctor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, []);

  if (loading) {
    return <div className="p-6">Loading doctor profile...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  if (!doctor) {
    return <div className="p-6">No doctor profile found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Doctor Profile</h1>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{doctor.name}</h2>
          <p className="text-gray-700"><strong>Specialty:</strong> {doctor.specialization}</p>
          <p className="text-gray-700"><strong>Qualification:</strong> {doctor.qualification}</p>
          <p className="text-gray-700"><strong>Email:</strong> {doctor.email}</p>
          <p className="text-gray-700"><strong>Phone:</strong> {doctor.phone_number}</p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">About</h3>
            <p className="text-gray-600">{doctor.bio}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
