import { BrowserRouter, Routes, Route } from 'react-router-dom';

import TestPage from './pages/TestPage';
import Signup from './pages/Signup.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/login.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/test" element={<TestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
