import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import D_Profile from './pages/D_Profile.jsx';
import P_Profile from './pages/P_profile.jsx';
import Webstream from "./components/Webstream";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dProfile" element={<D_Profile />} />
        <Route path="/pProfile" element={<P_Profile />} />

        <Route path="/live" element={<Webstream />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
