import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import D_Profile from './pages/D_Profile.jsx';
import P_Profile from './pages/P_Profile.jsx';
import AssignExercise from './pages/AssignExercise.jsx';
import WebStream from './pages/Webstream.jsx';
import ExerciseList from './pages/ExerciseList.jsx';
import CustomerCare from './pages/CustomerCare.jsx';
import PatientList from './pages/PatientsList.jsx';
import Landingpage from './pages/Landingpage.jsx';
import LiveSession from './pages/livesession.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landingpage />} />
        <Route path="/patient-home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/doctor-profile" element={<D_Profile />} />
        <Route path="/patient-profile" element={<P_Profile />} />
        <Route path="/assign-exercise" element={<AssignExercise />} />
        <Route path='/live' element={<WebStream />}/>
        <Route path='/exercise-list' element={<ExerciseList/>}/>
        <Route path='/customer-care' element={<CustomerCare/>}/>
        <Route path='/patient-list' element={<PatientList/>}/>
        <Route path="/live2" element={<LiveSession/>}/>
        



      </Routes>
    </BrowserRouter>
  );
}

export default App;