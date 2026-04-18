import React, { useState, useEffect } from 'react';
import pb from "../assets/pb.png";

// Utility Component: Inline SVG Icon for features
const FeatureIcon = ({ d, label }) => (
    <svg className="h-10 w-10 text-cyan-600 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label={label}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    </svg>
);

// Utility Component: Theme Toggle Button (Sun/Moon Icon)
// Removed margin from here, spacing will be managed by parent's flex/spacing utility
const ThemeToggle = ({ theme, toggleTheme }) => (
    <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        // Removed ml-4 to manage spacing in the parent container
        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
        {theme === 'dark' ? (
            // Sun Icon (when theme is dark)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ) : (
            // Moon Icon (when theme is light)
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        )}
    </button>
);


export default function Landingpage() {
    // 1. Initialize state (defaults to 'dark' if nothing is in localStorage)
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark';
    });    
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // 2. useEffect watches the 'theme' state. Whenever it changes, it updates the DOM and Storage.
    useEffect(() => {
        const root = document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]); // <--- This array tells React to run this effect ONLY when 'theme' changes

    // 3. toggleTheme ONLY updates the state. The useEffect will catch the change automatically.
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    const toggleMenu = () => {
        setIsMenuOpen(prevIsMenuOpen => !prevIsMenuOpen);
    };

    const handleNavigation = (path) => {
        console.log(`Navigating to: ${path}`);
        window.location.href = path; 
    };

    const handleMobileLinkClick = (path) => {
        setIsMenuOpen(false);
        setTimeout(() => handleNavigation(path), 100); 
    };

    // ... (rest of your return statement stays exactly the same)


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter] transition-colors duration-500">
            
            {/* 1. Header Navigation - Theme aware */}
            <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        {/* Logo */}
                    <div className="flex-shrink-0">
                        <a href="/" aria-label="PhysioBuddy Home" className="flex items-center">
                            {/* Light Mode Logo */}
                            <img
                                src={pb}
                                alt="PhysioBuddy Logo"
                                className="h-14 md:h-14 transition duration-500 dark:hidden" 
                            />
                            {/* Dark Mode Logo */}
                            <img
                                src={pb}
                                alt="PhysioBuddy Logo (Dark Mode)"
                                className="h-14 md:h-14 transition duration-500 hidden dark:block"
                            />
                        </a>
                    </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex space-x-10">
                            {['features', 'how-it-works', 'about', 'contact'].map(id => (
                                <a key={id} href={`#${id === 'contact' ? '#' : id}`} className="text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-500 font-semibold transition duration-200 capitalize">
                                    {id.replace('-', ' ')}
                                </a>
                            ))}
                        </nav>

                        {/* Action Buttons (Login/Start + Theme Toggle + Mobile Menu Button) */}
                        <div className="flex items-center space-x-2 sm:space-x-4"> {/* 🚀 FIX: Use space-x for consistent spacing */}
                            
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                            
                            <button
                                onClick={() => handleNavigation('/login')} 
                                className="hidden sm:inline-flex px-6 py-2.5 border border-transparent text-sm font-semibold rounded-full text-white bg-cyan-600 shadow-lg hover:bg-cyan-700 transition duration-300 transform hover:scale-[1.05] focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-offset-2"
                            >
                                Login / Start
                            </button>

                            {/* Mobile Menu Button (Hamburger) */}
                            <button
                                onClick={toggleMenu}
                                aria-label="Open menu"
                                className="md:hidden p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition duration-300"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} absolute w-full bg-white dark:bg-gray-800 shadow-2xl transition duration-300 ease-in-out border-t dark:border-gray-700`}>
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {['features', 'how-it-works', 'about', 'contact'].map(id => (
                            <a 
                                key={`mobile-${id}`}
                                onClick={() => handleMobileLinkClick(id === 'contact' ? '#' : `#${id}`)} 
                                href={id === 'contact' ? '#' : `#${id}`}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-gray-700 capitalize"
                            >
                                {id.replace('-', ' ')}
                            </a>
                        ))}
                        <button
                            onClick={() => handleMobileLinkClick('/')} 
                            className="w-full text-left mt-2 px-3 py-2.5 text-base font-semibold rounded-md text-white bg-cyan-600 hover:bg-cyan-700 transition duration-300"
                        >
                            Login / Start
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* 2. Hero Section */}
                <section className="bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pt-24 pb-32 sm:py-40 transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-cyan-900 dark:text-cyan-400 tracking-tight leading-tight transition-colors duration-500">
                            Regain Movement. <br className="sm:hidden" />Live Pain-Free.
                        </h1>
                        <p className="mt-8 max-w-3xl mx-auto text-xl sm:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed transition-colors duration-500">
                            Your personalized digital physiotherapy companion. Track progress, access custom exercises, and connect with your therapist virtually.
                        </p>
                        <div className="mt-12 flex justify-center space-x-4">
                            <button
                                onClick={() => handleNavigation('/login')}
                                className="px-8 py-3 text-lg sm:px-10 sm:py-4 sm:text-xl font-bold rounded-full text-white bg-cyan-600 shadow-2xl shadow-cyan-500/60 hover:bg-cyan-700 transition transform hover:scale-[1.05] duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-offset-2"
                            >
                                Start Your Recovery Journey
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. Features Section */}
                <section id="features" className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-base text-cyan-600 dark:text-cyan-500 font-bold tracking-wide uppercase">
                                Features & Benefits
                            </h2>
                            <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-cyan-900 dark:text-cyan-400 sm:text-5xl transition-colors duration-500">
                                Everything you need for rehabilitation at home.
                            </p>
                        </div>

                        <div className="mt-20 grid grid-cols-1 gap-10 md:grid-cols-3">
                            
                            {/* Feature 1 */}
                            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl transition transform hover:shadow-3xl hover:translate-y-[-4px] duration-300 cursor-pointer">
                                <FeatureIcon 
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6m3-12l-3 3m3-3v12"
                                    label="Personalized Plans Icon"
                                />
                                <h3 className="mt-6 text-xl font-bold text-cyan-900 dark:text-cyan-400 transition-colors duration-500">Personalized Exercise Plans</h3>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-400 transition-colors duration-500">
                                    Receive custom rehabilitation routines designed by your physical therapist, delivered straight to your device with clear guidance.
                                </p>
                            </div>
                            
                            {/* Feature 2 */}
                            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl transition transform hover:shadow-3xl hover:translate-y-[-4px] duration-300 cursor-pointer">
                                <FeatureIcon 
                                    d="M15 10l4.55 4.55L21 12V3h-9l1.55 1.55L15 6V3H3v18h18"
                                    label="Video Monitoring Icon"
                                />
                                <h3 className="mt-6 text-xl font-bold text-cyan-900 dark:text-cyan-400 transition-colors duration-500">Video Guidance & Tracking</h3>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-400 transition-colors duration-500">
                                    High-definition video demonstrations and built-in tracking ensure you perform exercises correctly for maximum benefit.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl transition transform hover:shadow-3xl hover:translate-y-[-4px] duration-300 cursor-pointer">
                                <FeatureIcon 
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9-8z"
                                    label="Chat Support Icon"
                                />
                                <h3 className="mt-6 text-xl font-bold text-cyan-900 dark:text-cyan-400 transition-colors duration-500">Real-Time Support</h3>
                                <p className="mt-3 text-base text-gray-600 dark:text-gray-400 transition-colors duration-500">
                                    Secure, direct messaging with your therapist for questions, feedback, and immediate assistance when you need it.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. How It Works Section */}
                <section id="how-it-works" className="py-24 sm:py-32 bg-white dark:bg-gray-800 transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-base text-cyan-600 dark:text-cyan-500 font-bold tracking-wide uppercase">
                                Simple Steps
                            </h2>
                            <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-cyan-900 dark:text-cyan-400 sm:text-5xl transition-colors duration-500">
                                Start your recovery in 3 easy steps.
                            </p>
                        </div>

                        <div className="mt-16 relative">
                            {/* Horizontal line connector (hidden on mobile) */}
                            <div className="hidden lg:block absolute inset-0 h-1/2 w-full mt-24">
                                <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#0e7490" strokeWidth="2" strokeDasharray="4 8" className="dark:stroke-cyan-500 opacity-50"/>
                                </svg>
                            </div>

                            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-8 relative z-10">
                                
                                {/* Step 1 */}
                                <div className="text-center p-6">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-600 shadow-xl text-white dark:bg-cyan-500">
                                        <span className="text-3xl font-bold">1</span>
                                    </div>
                                    <h3 className="mt-8 text-2xl font-extrabold text-cyan-900 dark:text-cyan-400">Consultation & Plan</h3>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                                        Your therapist creates a personalized treatment plan in our web portal.
                                    </p>
                                </div>

                                {/* Step 2 */}
                                <div className="text-center p-6">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-600 shadow-xl text-white dark:bg-cyan-500">
                                        <span className="text-3xl font-bold">2</span>
                                    </div>
                                    <h3 className="mt-8 text-2xl font-extrabold text-cyan-900 dark:text-cyan-400">Daily Exercise</h3>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                                        Log in to PhysioBuddy to view your custom routines with video guidance.
                                    </p>
                                </div>

                                {/* Step 3 */}
                                <div className="text-center p-6">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-cyan-600 shadow-xl text-white dark:bg-cyan-500">
                                        <span className="text-3xl font-bold">3</span>
                                    </div>
                                    <h3 className="mt-8 text-2xl font-extrabold text-cyan-900 dark:text-cyan-400">Track & Progress</h3>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                                        Your therapist monitors your progress and adjusts your plan in real-time for optimal results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Testimonials Section */}
                <section id="testimonials" className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-base text-cyan-600 dark:text-cyan-500 font-bold tracking-wide uppercase">
                            Client Success
                        </h2>
                        <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-cyan-900 dark:text-cyan-400 sm:text-5xl">
                            Hear from our happy patients.
                        </p>
                        
                        <div className="mt-16 space-y-12">
                            {/* Testimonial 1 */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <blockquote className="text-xl italic font-medium text-gray-800 dark:text-gray-200">
                                    "PhysioBuddy turned my recovery around. The videos were crystal clear, and being able to chat with my therapist instantly made all the difference. I recovered weeks faster than expected!"
                                </blockquote>
                                <div className="mt-6 font-semibold text-cyan-700 dark:text-cyan-500">
                                    — Sarah J., Knee Replacement Patient
                                </div>
                            </div>

                            {/* Testimonial 2 */}
                            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                                <blockquote className="text-xl italic font-medium text-gray-800 dark:text-gray-200">
                                    "As a busy professional, I needed flexibility. PhysioBuddy allowed me to do my exercises on my schedule, but with all the professional guidance I would get in the clinic."
                                </blockquote>
                                <div className="mt-6 font-semibold text-cyan-700 dark:text-cyan-500">
                                    — Alex K., Chronic Back Pain
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* 6. About Us/Value Proposition */}
                <section id="about" className="py-24 sm:py-32 bg-cyan-600 dark:bg-cyan-900 text-white shadow-inner transition-colors duration-500">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                            <div>
                                <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                                    Empowering Your Recovery Journey
                                </h2>
                                <p className="mt-6 text-xl opacity-90 leading-relaxed">
                                    PhysioBuddy was founded by a dedicated team of physical therapists and software engineers committed to closing the gap between clinic and home. We believe consistent, guided movement is the key to lasting recovery.
                                </p>
                                <p className="mt-4 text-lg opacity-80 italic">
                                    "Bringing the clinic experience directly to your daily life."
                                </p>
                            </div>
                            <div className="mt-12 lg:mt-0 lg:ml-auto">
                                <img
                                    src="https://placehold.co/600x400/0891b2/ffffff?text=Professional+App+Dashboard"
                                    alt="Screenshot of PhysioBuddy application dashboard showing progress tracking"
                                    className="rounded-3xl shadow-2xl transition duration-500 hover:shadow-cyan-900/50 w-full h-auto"
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = "https://placehold.co/600x400/0891b2/ffffff?text=App+Dashboard+Mockup"; 
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 7. Final CTA */}
                <section className="py-20 sm:py-28 text-center bg-blue-100 dark:bg-gray-800 transition-colors duration-500">
                    <h2 className="text-4xl font-extrabold text-cyan-900 dark:text-cyan-400 sm:text-5xl transition-colors duration-500">
                        Ready to take control of your health?
                    </h2>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 transition-colors duration-500">
                        Join hundreds of patients finding better results with PhysioBuddy.
                    </p>
                    <button
                        onClick={() => handleNavigation('/')}
                        className="mt-8 px-10 py-3 text-lg sm:px-12 sm:py-4 sm:text-xl font-bold rounded-full text-white bg-cyan-600 shadow-2xl shadow-cyan-500/50 hover:bg-cyan-700 transition transform hover:scale-105 duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300 focus:ring-offset-2"
                    >
                        Sign Up Today
                    </button>
                </section>
            </main>

            {/* 8. Footer */}
            <footer className="bg-gray-800 dark:bg-gray-950 text-white py-10 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
                    <p>&copy; {new Date().getFullYear()} PhysioBuddy. All rights reserved.</p>
                    <div className="mt-4 space-x-4">
                        <a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}