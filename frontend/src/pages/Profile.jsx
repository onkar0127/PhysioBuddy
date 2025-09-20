import React from "react";

const doctor = {
    id: 1,
    name: "Dr. Alice Brown",
    specialty: "Orthopedics",
    experience: "12 years",
    contact: {
        email: "alice.brown@physiobuddy.com",
        phone: "+91-9876543210",
    },
    bio: "Dr. Alice Brown is a board-certified orthopedic specialist with over a decade of experience treating musculoskeletal conditions. She is passionate about patient-centered care and rehabilitation.",
};

export default function Profile() {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-blue-700 mb-4">Doctor Profile</h1>
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">{doctor.name}</h2>
                    <p className="text-gray-700"><strong>Specialty:</strong> {doctor.specialty}</p>
                    <p className="text-gray-700"><strong>Experience:</strong> {doctor.experience}</p>
                    <p className="text-gray-700"><strong>Email:</strong> {doctor.contact.email}</p>
                    <p className="text-gray-700"><strong>Phone:</strong> {doctor.contact.phone}</p>
                    <div className="mt-4">
                        <h3 className="text-xl font-semibold mb-2">About</h3>
                        <p className="text-gray-600">{doctor.bio}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
