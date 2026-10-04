import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import pb from "../assets/pb.png";
import { API_BASE } from '../config';

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
      await fetch(`${API_BASE}/api/logout/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken"),
        },
        credentials: 'include'
      });
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      navigate('/');
    }
  };

  // Determine effective role from prop or current URL path
  const currentPath = location.pathname;
  let effectiveRole = role;
  if (!effectiveRole) {
    if (currentPath.startsWith('/super-admin')) effectiveRole = 'superadmin';
    else if (currentPath.startsWith('/hospital-admin')) effectiveRole = 'hospital_admin';
    else if (currentPath.startsWith('/doctor') || currentPath === '/patient-status' || currentPath === '/new-assignment') effectiveRole = 'doctor';
    else effectiveRole = 'patient';
  }

  let navLinks = [];
  let homeLink = '/';

  if (effectiveRole === 'superadmin') {
    homeLink = '/super-admin';
    navLinks = [
      { name: 'Dashboard', href: '/super-admin' },
      { name: 'Hospitals', href: '/super-admin/hospitals' },
      { name: 'Exercises Library', href: '/super-admin/exercises' },
      { name: 'Add Exercise', href: '/super-admin/add-exercise' },
    ];
  } else if (effectiveRole === 'hospital_admin') {
    homeLink = '/hospital-admin';
    navLinks = [
      { name: 'Dashboard', href: '/hospital-admin' },
      { name: 'Doctors', href: '/hospital-admin/doctors' },
      { name: 'Patients', href: '/hospital-admin/patients' },
      { name: 'Hospital Profile', href: '/hospital-admin/profile' },
    ];
  } else if (effectiveRole === 'doctor') {
    homeLink = '/doctor-home';
    navLinks = [
      { name: 'Home', href: '/doctor-home' },
      { name: 'Patient Status', href: '/patient-status' },
      { name: 'New Assignment', href: '/new-assignment' },
      { name: 'Doctor Profile', href: '/doctor-profile' },
    ];
  } else {
    homeLink = '/patient-home';
    navLinks = [
      { name: 'Home', href: '/patient-home' },
      { name: 'Exercises', href: '/exercise-list' },
      { name: 'Profile', href: '/patient-profile' },
      { name: 'Customer Care', href: '/customer-care' },
    ];
  }

  const roleBadges = {
    superadmin: { text: 'SUPER ADMIN', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
    hospital_admin: { text: 'HOSPITAL ADMIN', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
    doctor: { text: 'DOCTOR', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' },
    patient: { text: 'PATIENT', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' }
  };

  const isActive = (href) => {
    if (href === homeLink) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/80 dark:border-gray-800/80 transition-all duration-300 font-[Inter]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">

        {/* Logo and Role Badge */}
        <div className="flex items-center gap-3">
          <Link to={homeLink} className="flex-shrink-0 flex items-center gap-2">
            <img src={pb} alt="PhysioBuddy" className="h-9 sm:h-11 w-auto object-contain" />
          </Link>
          {effectiveRole && roleBadges[effectiveRole] && (
            <span className={`hidden sm:inline-flex items-center px-2.5 py-1 text-[11px] font-black tracking-wider uppercase rounded-lg ${roleBadges[effectiveRole].color}`}>
              {roleBadges[effectiveRole].text}
            </span>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1.5 rounded-full border border-gray-200/60 dark:border-gray-700/60 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`px-4 py-2 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 ${
                isActive(link.href)
                  ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm font-bold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions + Hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
            className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition duration-200 cursor-pointer border border-transparent dark:border-gray-700/50"
          >
            {theme === 'dark' ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Log out"
            aria-label="Log out"
            className="p-2.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition duration-200 cursor-pointer border border-rose-200/50 dark:border-rose-900/40 disabled:opacity-50"
          >
            {isLoggingOut ? (
              <svg className="animate-spin h-5 w-5 text-rose-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            )}
          </button>

          <button
            className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 px-4 py-3 space-y-1">
          {effectiveRole && roleBadges[effectiveRole] && (
            <div className="px-3 py-1 mb-2">
              <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md ${roleBadges[effectiveRole].color}`}>
                Role: {roleBadges[effectiveRole].text}
              </span>
            </div>
          )}
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block py-2.5 px-3 text-sm font-semibold rounded-xl transition ${
                isActive(link.href)
                  ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}