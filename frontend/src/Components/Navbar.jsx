import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import pb from "../assets/pb.png";

const API_BASE = 'http://127.0.0.1:8000';

// Helper function to get CSRF token for Django
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}


export default function Navbar({ role }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE}/api/logout/`, { method: 'POST',  headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: 'include' });
    } catch (err) { console.error("Logout failed", err); } 
    finally { navigate('/'); }
  };

  const navLinks = role === 'doctor' 
    ? [{ name: 'Home', href: '/doctor-home' }, { name: 'Patient Status', href: '/patient-status' },  { name: 'New Assignment', href: '/new-assignment' },{ name: 'Doctor Profile', href: '/doctor-profile' }]
    : [{ name: 'Home', href: '/patient-home' }, { name: 'Exercises', href: '/exercise-list' }, { name: 'Profile', href: '/patient-profile' }, { name: 'Customer Care', href: '/customer-care' }];

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/60 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to={role === 'doctor' ? '/doctor-home' : '/patient-home'} className="flex-shrink-0">
          <img src={pb} alt="PhysioBuddy" className="h-10 sm:h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200 dark:border-gray-700">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.href} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${location.pathname === link.href ? 'bg-white dark:bg-gray-700 text-cyan-600 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-cyan-600'}`}>
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions + Hamburger */}
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">{theme === 'light' ? "🌙" : "☀️"}</button>
          <button onClick={handleLogout} className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
          
          <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
          {navLinks.map(link => (
            <Link key={link.name} to={link.href} className="block py-3 px-4 text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}