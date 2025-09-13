import React from "react";

const patients = [
    { id: 1, name: "John Doe", age: 45, condition: "Knee Pain" },
    { id: 2, name: "Jane Smith", age: 32, condition: "Back Pain" },
];

const doctors = [
    { id: 1, name: "Dr. Alice Brown", specialty: "Orthopedics" },
    { id: 2, name: "Dr. Bob White", specialty: "Physiotherapy" },
];

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">PhysioBuddy Home</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Patients Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Patients</h2>
                    <div className="space-y-4">
                        {patients.map((patient) => (
                            <div
                                key={patient.id}
                                className="bg-white shadow rounded-lg p-4 border border-gray-200"
                            >
                                <h3 className="text-lg font-bold">{patient.name}</h3>
                                <p className="text-gray-600">Age: {patient.age}</p>
                                <p className="text-gray-600">Condition: {patient.condition}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Doctors Section */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Doctors</h2>
                    <div className="space-y-4">
                        {doctors.map((doctor) => (
                            <div
                                key={doctor.id}
                                className="bg-white shadow rounded-lg p-4 border border-gray-200"
                            >
                                <h3 className="text-lg font-bold">{doctor.name}</h3>
                                <p className="text-gray-600">Specialty: {doctor.specialty}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}