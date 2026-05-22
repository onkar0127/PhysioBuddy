import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Landingpage from './pages/Landingpage.jsx';
import Login from './pages/Login.jsx';
import CustomerCare from './pages/CustomerCare.jsx';

import PatientHome from './pages/PatientHome.jsx';
import P_Profile from './pages/PatientProfile.jsx';
import ExerciseList from './pages/ExerciseList.jsx';
import LiveSession from './pages/livesession.jsx';
import WebStream from './pages/Webstream.jsx';

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
        <Route path='/customer-care' element={<CustomerCare/>}/>


        {/* ------------------- Patient URLs ------------------- */}
        <Route path="/patient-home" element={<PatientHome/>}/> 
        <Route path="/patient-profile" element={<P_Profile />} />
        <Route path='/exercise-list' element={<ExerciseList/>}/>
        <Route path='/live' element={<WebStream />}/> {/* This is the old live session page */}
        <Route path="/live2" element={<LiveSession/>}/> {/* This is the new live session page */}


        {/* ------------------- Doctor URLs ------------------- */}
        <Route path="/doctor-home" element={<DoctorHome/>}/>
        <Route path="/patient-status" element={<PatientStatusPage/>}/> 
        <Route path="/new-assignment" element={<NewAssignmentForm onCreated={() => {}} />} /> 
        <Route path="/doctor-profile" element={<D_Profile />} />
        

        



      </Routes>
    </BrowserRouter>
  );
}

export default App;