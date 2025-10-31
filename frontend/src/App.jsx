import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import D_Profile from './pages/D_Profile.jsx';
import AssignExercise from './pages/AssignExercise.jsx';
import WebStream from './pages/Webstream.jsx';
import ExerciseList from './pages/ExerciseList.jsx';
import CustomerCare from './pages/CustomerCare.jsx';
import PatientList from './pages/PatientList.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Profile" element={<D_Profile />} />
        
        <Route path="/assign-exercise" element={<AssignExercise />} />
        <Route path='/live' element={<WebStream />}/>
        <Route path='/exerciseList' element={<ExerciseList/>}/>
        <Route path='/customercare' element={<CustomerCare/>}/>
        <Route path='/patientlist' element={<PatientList/>}/>
        



      </Routes>
    </BrowserRouter>
  );
}

export default App;