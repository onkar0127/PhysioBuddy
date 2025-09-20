import { BrowserRouter, Routes, Route } from 'react-router-dom';


import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/login.jsx';
import Profile from './pages/Profile.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        
        <Route path="/profile" element={<Profile />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
