import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import D_Profile from './pages/D_Profile.jsx';
import AssignExercise from './pages/AssignExercise.jsx';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Profile" element={<D_Profile />} />
        <Route path="/assign-exercise" element={<AssignExercise />} />
        



      </Routes>
    </BrowserRouter>
  );
}

export default App;