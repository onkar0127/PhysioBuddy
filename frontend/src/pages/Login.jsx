import React, { useState } from "react";
// Removed: import { Loader2 } from 'lucide-react'; 

// Mock Cookies object to simulate js-cookie behavior for CSRF token retrieval.
// In a real application, you would install and import 'js-cookie' from a package manager.
const Cookies = {
  get: (key) => {
    if (key === 'csrftoken') {
      // This is a dummy token for the demo. In a live Django environment, 
      // the server sets this cookie automatically, and it's sent back by the browser.
      return "mock-csrf-token-for-django";
    }
    return null;
  },
};

// NOTE: These variables simulate the imports from your original file:
import doctorGif from "../assets/doc.gif"; 
import pb from "../assets/pb.png";


export default function App() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error message when user starts typing again
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { username, password } = form;

    // --- Configuration for running in this environment ---
    // Set to 'true' to bypass network issues and test frontend logic.
    // Set to 'false' to try connecting to the real Django backend.
    const IS_MOCK_ENABLED = false; 
    const loginUrl = 'http://127.0.0.1:8000/api/login/?username=';

    
    
    // --- REAL DJANGO BACKEND LOGIC (runs if IS_MOCK_ENABLED is false) ---
    const csrfToken = Cookies.get('csrftoken');
    
    if (!csrfToken) {
        setError("CSRF token is missing. Please ensure your backend is setting the cookie.");
        setLoading(false);
        return;
    }

    // Single attempt without exponential backoff
    try {
        const response = await fetch(loginUrl, {
            method: 'GET',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            // 3. Handle Success
            const result = await response.json();
            console.log('Login successful!', result);
            // Implemented redirection for real success
            window.location.href = '/';
        } else {
            // 4. Handle Failure (e.g., bad credentials)
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.detail || "Invalid credentials or server error.";
            setError(errorMessage);
        }
    } catch (error) {
        // Handle persistent network issues (the original "Failed to fetch")
        console.error('Network error during login:', error);
        setError(`Failed to connect to the backend server at ${loginUrl}. Please ensure your Django server is running and check CORS settings.`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full lg:flex font-[Inter] bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100">
      {/* Left Side: Marketing and Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-10 bg-cyan-600 text-white shadow-xl">
        <h1 className="text-6xl font-extrabold drop-shadow-lg mb-8 tracking-wide">
          PhysioBuddy
        </h1>
        {/* Placeholder for Doctor Animation GIF */}
        <img 
            src={doctorGif} 
            alt="Doctor animation" 
            className="w-full max-w-xs h-auto rounded-xl shadow-2xl transition duration-300 hover:scale-[1.02]" 
            // Added onError to provide a fallback if the primary placeholder fails
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300/15779e/ffffff?text=Doctor+Placeholder"; }}
        />
        <p className="mt-8 text-center text-lg italic opacity-80">
            Your trusted partner in physical wellness and rehabilitation.
        </p>
      </div>

      {/* Right Side: Glassy Login Form */}
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-3xl shadow-2xl transition p-8 sm:p-10">
            
            {/* Logo - Uses the 'pb' variable name */}
            <div className="flex justify-center mb-6">
              <img 
                src={pb} 
                alt="PhysioBuddy Logo" 
                className="w-48 h-auto"
                 // Added onError to provide a fallback if the primary placeholder fails
                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x80/0e7490/ffffff?text=PB"; }}
              />
            </div>
            
            <h2 className="mt-6 text-center text-3xl font-bold text-cyan-800 tracking-tight">
              Log in to your account
            </h2>

            {/* Error Message Display */}
            {error && (
              <div 
                className={`mt-4 p-3 border rounded-lg text-sm transition-all duration-300 ease-in-out ${
                    error.startsWith('Login Successful') 
                        ? 'bg-green-100 border-green-400 text-green-700' 
                        : 'bg-red-100 border-red-400 text-red-700'
                }`}
                role="alert"
              >
                <p className="font-semibold">{error.startsWith('Login Successful') ? 'Success' : 'Login Error'}:</p>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              
              {/* Username Input */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-cyan-900 mb-2"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username (or 'test')"
                  className="mt-1 block w-full rounded-xl bg-white/70 text-cyan-900 px-4 py-3 placeholder:text-cyan-500 border border-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-600 transition duration-150 shadow-inner"
                  disabled={loading}
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-cyan-900 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="•••••••• (or '1234')"
                  className="mt-1 block w-full rounded-xl bg-white/70 text-cyan-900 px-4 py-3 placeholder:text-cyan-500 border border-white/50 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:border-cyan-600 transition duration-150 shadow-inner"
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                aria-label="Sign in"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 text-lg font-bold text-white shadow-lg shadow-cyan-500/50 hover:bg-cyan-700 hover:shadow-cyan-600/70 focus:outline-none focus:ring-4 focus:ring-cyan-300 transition duration-200 disabled:bg-cyan-400 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    {/* Inline SVG replacement for Loader2 */}
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </button>
              
              <div className="text-center mt-6">
                <a href="#" className="text-sm font-medium text-cyan-700 hover:text-cyan-900 transition">
                  Forgot your password?
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
