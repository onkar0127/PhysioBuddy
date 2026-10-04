import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import pb from "../assets/pb.png";
import { API_BASE } from '../config';

/**
 * Helper function to extract Django's CSRF token from browser cookies.
 * Django requires 'X-CSRFToken' header on state-changing requests (POST, PUT, DELETE).
 */
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

async function ensureCsrfToken() {
  let csrfToken = getCookie("csrftoken");
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE}/api/csrf/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.csrfToken) return data.csrfToken;
    }
  } catch (err) {
    console.warn("CSRF bootstrap warning:", err);
  }

  return getCookie("csrftoken") || '';
}

/**
 * Main application navigation component.
 * Automatically adapts links and role badges based on the user's role:
 * - 'superadmin': Platform control, hospitals, exercises library, and system status
 * - 'hospital_admin': Hospital dashboard, doctors, patients, hospital profile
 * - 'doctor': Doctor dashboard, patient status, exercise assignments, profile
 * - 'patient': Patient workout portal, exercise list, profile, support
 */
export default function Navbar({ role }) {
  // Theme state: dark / light (stored in localStorage for persistence across pages)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Synchronize <html> class with theme state
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Toggle between dark and light themes
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  /**
   * Logs out the user via Django session endpoint, then redirects to home/login
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const csrfToken = await ensureCsrfToken();
      const response = await fetch(`${API_BASE}/api/logout/`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status ${response.status}`);
      }

      navigate('/');
    } catch (err) {
      console.error("Logout failed", err);
      window.alert("Logout request could not be processed. Please check your connection and try again.");
      setIsLoggingOut(false);
    }
  };

  // Determine effective role from prop or infer from current URL path
  const currentPath = location.pathname;
  let effectiveRole = role;
  if (!effectiveRole) {
    if (currentPath.startsWith('/super-admin')) effectiveRole = 'superadmin';
    else if (currentPath.startsWith('/hospital-admin')) effectiveRole = 'hospital_admin';
    else if (currentPath.startsWith('/doctor') || currentPath === '/patient-status' || currentPath === '/new-assignment') effectiveRole = 'doctor';
    else effectiveRole = 'patient';
  }

  // Define navigation links for each role
  let navLinks = [];
  let homeLink = '/';

  if (effectiveRole === 'superadmin') {
    homeLink = '/super-admin';
    navLinks = [
      { name: 'Dashboard', href: '/super-admin' },
      { name: 'Hospitals', href: '/super-admin/hospitals' },
      { name: 'Exercises Library', href: '/super-admin/exercises' },
      { name: 'System Status', href: '/super-admin/status' },
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

  // Visual badge configuration for current active role
  const roleBadges = {
    superadmin: { text: 'SUPER ADMIN', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
    hospital_admin: { text: 'HOSPITAL ADMIN', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
    doctor: { text: 'DOCTOR', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20' },
    patient: { text: 'PATIENT', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' }
  };

  // Helper to highlight active navigation link
  const isActive = (href) => {
    if (href === homeLink) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Logo and Role Badge */}
        <div className="flex items-center gap-3">
          <Link to={homeLink} className="flex-shrink-0">
            <img src={pb} alt="PhysioBuddy" className="h-10 sm:h-12 w-auto" />
          </Link>
          {effectiveRole && roleBadges[effectiveRole] && (
            <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 text-[11px] font-black tracking-wider uppercase rounded-lg ${roleBadges[effectiveRole].color}`}>
              {roleBadges[effectiveRole].text}
            </span>
          )}
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-full border border-gray-200 dark:border-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${isActive(link.href)
                  ? 'bg-white dark:bg-gray-700 text-cyan-600 dark:text-cyan-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400'
                }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Action Buttons (Theme Switcher, Logout, Mobile Hamburger) */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? "🌙" : "☀️"}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="p-2 rounded-full bg-transparent text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer disabled:opacity-50"
            title="Log out"
            aria-label="Log out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {/* Mobile Drawer Hamburger Button */}
          <button
            className="md:hidden p-2 bg-transparent text-gray-700 dark:text-gray-200 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Floating Dropdown Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop to dismiss when clicking outside */}
          <div 
            className="fixed inset-0 top-20 bg-black/20 dark:bg-black/50 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="absolute top-full left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4 space-y-1 shadow-2xl z-50 md:hidden animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-3 px-4 text-base font-bold rounded-xl transition ${isActive(link.href)
                    ? 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </>
      )}
    </nav>
  );
}
