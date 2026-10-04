import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landingpage from './pages/Landingpage.jsx';
import Login from './pages/Login.jsx';
import CustomerCare from './pages/CustomerCare.jsx';
import RegisterHospital from './pages/RegisterHospital.jsx';


// Super Admin Pages
import SuperAdminLogin from './pages/SuperAdminLogin.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import SuperAdminHospitals from './pages/SuperAdminHospitals.jsx';
import SuperAdminExercises from './pages/SuperAdminExercises.jsx';
import SuperAdminAddExercise from './pages/SuperAdminAddExercise.jsx';

// Hospital Admin Pages
import HospitalAdminDashboard from './pages/HospitalAdminDashboard.jsx';
import HospitalAdminDoctors from './pages/HospitalAdminDoctors.jsx';
import HospitalAdminAddDoctor from './pages/HospitalAdminAddDoctor.jsx';
import HospitalAdminPatients from './pages/HospitalAdminPatients.jsx';
import HospitalAdminAddPatient from './pages/HospitalAdminAddPatient.jsx';
import HospitalAdminProfile from './pages/HospitalAdminProfile.jsx';

// Patient Pages
import PatientHome from './pages/PatientHome.jsx';
import P_Profile from './pages/PatientProfile.jsx';
import ExerciseList from './pages/ExerciseList.jsx';
import WebStream from './pages/Webstream.jsx';

// Doctor Pages
import D_Profile from './pages/DoctorProfile.jsx';
import DoctorHome from './pages/DoctorHome.jsx';
import PatientStatusPage from './pages/PatientStatusPage.jsx';
import NewAssignmentForm from './pages/NewAssignmentForm.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ------------------- Common URLs ------------------- */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-hospital" element={<RegisterHospital />} />
        <Route path="/customer-care" element={<CustomerCare />} />

        {/* ------------------- Super Admin URLs ------------------- */}
        <Route path="/super-admin-login" element={<SuperAdminLogin />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/hospitals" element={<SuperAdminHospitals />} />
        <Route path="/super-admin/exercises" element={<SuperAdminExercises />} />
        <Route path="/super-admin/add-exercise" element={<SuperAdminAddExercise />} />

        {/* ------------------- Hospital Admin URLs ------------------- */}
        <Route path="/hospital-admin" element={<HospitalAdminDashboard />} />
        <Route path="/hospital-admin/doctors" element={<HospitalAdminDoctors />} />
        <Route path="/hospital-admin/add-doctor" element={<HospitalAdminAddDoctor />} />
        <Route path="/hospital-admin/patients" element={<HospitalAdminPatients />} />
        <Route path="/hospital-admin/add-patient" element={<HospitalAdminAddPatient />} />
        <Route path="/hospital-admin/profile" element={<HospitalAdminProfile />} />

        {/* ------------------- Patient URLs ------------------- */}
        <Route path="/patient-home" element={<PatientHome />} />
        <Route path="/patient-profile" element={<P_Profile />} />
        <Route path="/exercise-list" element={<ExerciseList />} />
        <Route path="/live" element={<WebStream />} />

        {/* ------------------- Doctor URLs ------------------- */}
        <Route path="/doctor-home" element={<DoctorHome />} />
        <Route path="/patient-status" element={<PatientStatusPage />} />
        <Route path="/new-assignment" element={<NewAssignmentForm onCreated={() => {}} />} />
        <Route path="/doctor-profile" element={<D_Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
