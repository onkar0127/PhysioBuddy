// import React, { useState } from 'react';
// import './Home.css';
// import './Login.jsx'
// import CustomerCare from './CustomerCare';

// export default function Home() {
//   const [activeTab, setActiveTab] = useState('home');

//   const renderContent = () => {
//     switch (activeTab) {
//       case 'home':
//         return <HomeContent />;
//       case 'about':
//         return <AboutUs />;
//       case 'services':
//         return <Services />;
//       case 'login':
//         return <LoginPage/ >;
//       case 'care':
//         return <CustomerCare />;
//       default:
//         return <HomeContent />;
//     }
//   };

//   return (
//     <div className="app">
//       {/* Navigation Bar */}
//       <nav className="navbar">
//         <div className="nav-container">
//           <div className="logo">
//             <span className="logo-icon">💚</span>
//             <span className="logo-text">PhysioFlow</span>
//           </div>

//           <ul className="nav-menu">
//             <li>
//               <button
//                 className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('home')}
//               >
//                 Home
//               </button>
//             </li>
//             <li>
//               <button
//                 className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('about')}
//               >
//                 About Us
//               </button>
//             </li>
//             <li>
//               <button
//                 className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('services')}
//               >
//                 Services
//               </button>
//             </li>
//             <li>
//               <button
//                 className={`nav-link ${activeTab === 'care' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('care')}
//               >
//                 Support
//               </button>
//             </li>
//             <li>
//               <button
//                 className={`nav-link btn-login ${activeTab === 'login' ? 'active' : ''}`}
//                 onClick={() => setActiveTab('login')}
//               >
//                 Login
//               </button>
//             </li>
//           </ul>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <main className="main-content">
//         {renderContent()}
//       </main>
//     </div>
//   );
// }

// // Home Content Component
// function HomeContent() {
//   return (
//     <div className="home-page">
//       {/* Hero Section */}
//       <section className="hero">
//         <div className="hero-content">
//           <h1 className="hero-title">Your Health, Our Priority</h1>
//           <p className="hero-subtitle">
//             Professional virtual physiotherapy at your fingertips. Recover faster, live better.
//           </p>
//           <button className="hero-btn">Get Started Today</button>
//         </div>
//         <div className="hero-image">
//           <div className="hero-graphic">
//             <span className="hero-emoji">🏥</span>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="features">
//         <h2>Why Choose PhysioFlow?</h2>
//         <div className="features-grid">
//           <div className="feature-card">
//             <div className="feature-icon">👨‍⚕️</div>
//             <h3>Licensed Therapists</h3>
//             <p>Work with certified physiotherapists from the comfort of your home</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon">📅</div>
//             <h3>Flexible Scheduling</h3>
//             <p>Book sessions at times that work best for your schedule</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon">🔒</div>
//             <h3>Secure & Private</h3>
//             <p>Your health data is encrypted and HIPAA compliant</p>
//           </div>
//           <div className="feature-card">
//             <div className="feature-icon">📊</div>
//             <h3>Progress Tracking</h3>
//             <p>Monitor your recovery with detailed progress reports</p>
//           </div>
//         </div>
//       </section>

//       {/* How It Works */}
//       <section className="how-it-works">
//         <h2>How It Works</h2>
//         <div className="steps">
//           <div className="step">
//             <div className="step-number">1</div>
//             <h4>Create Account</h4>
//             <p>Sign up in minutes with your basic information</p>
//           </div>
//           <div className="step-arrow">→</div>
//           <div className="step">
//             <div className="step-number">2</div>
//             <h4>Book Session</h4>
//             <p>Choose your therapist and preferred time slot</p>
//           </div>
//           <div className="step-arrow">→</div>
//           <div className="step">
//             <div className="step-number">3</div>
//             <h4>Start Therapy</h4>
//             <p>Join your video session and begin recovery</p>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="stats">
//         <div className="stat-item">
//           <h3>5000+</h3>
//           <p>Happy Patients</p>
//         </div>
//         <div className="stat-item">
//           <h3>150+</h3>
//           <p>Expert Therapists</p>
//         </div>
//         <div className="stat-item">
//           <h3>98%</h3>
//           <p>Satisfaction Rate</p>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="cta">
//         <h2>Ready to Start Your Recovery Journey?</h2>
//         <button className="cta-btn">Book Your First Session</button>
//       </section>
//     </div>
//   );
// }

// // About Us Component
// function AboutUs() {
//   return (
//     <div className="about-page">
//       <section className="about-hero">
//         <h1>About PhysioFlow</h1>
//         <p>Revolutionizing physiotherapy through technology and compassion</p>
//       </section>

//       <section className="about-content">
//         <div className="about-section">
//           <h2>Our Mission</h2>
//           <p>
//             At PhysioFlow, we believe that quality physiotherapy should be accessible to everyone, 
//             anywhere, anytime. Our mission is to bridge the gap between patients and certified therapists 
//             through cutting-edge technology and personalized care.
//           </p>
//         </div>

//         <div className="about-section">
//           <h2>Our Vision</h2>
//           <p>
//             To become the world's leading virtual physiotherapy platform, empowering millions of people 
//             to recover from injuries, manage chronic conditions, and improve their overall quality of life 
//             with professional guidance from home.
//           </p>
//         </div>

//         <div className="about-section">
//           <h2>Our Values</h2>
//           <ul className="values-list">
//             <li>🎯 Excellence - We strive for the highest standards in care</li>
//             <li>🤝 Compassion - We genuinely care about our patients' wellbeing</li>
//             <li>🔒 Trust - Your privacy and security are paramount</li>
//             <li>💡 Innovation - We leverage technology for better outcomes</li>
//           </ul>
//         </div>

//         <div className="about-section">
//           <h2>Our Team</h2>
//           <p>
//             Our team consists of experienced physiotherapists, healthcare professionals, and technology 
//             experts dedicated to providing the best virtual physiotherapy experience. All our therapists are 
//             licensed, certified, and committed to your recovery.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }

// // Services Component
// function Services() {
//   return (
//     <div className="services-page">
//       <section className="services-hero">
//         <h1>Our Services</h1>
//         <p>Comprehensive physiotherapy solutions tailored to your needs</p>
//       </section>

//       <section className="services-grid">
//         <div className="service-item">
//           <div className="service-icon">🦵</div>
//           <h3>Sports Injury Recovery</h3>
//           <p>Get back to your game with specialized recovery programs for sports-related injuries</p>
//         </div>

//         <div className="service-item">
//           <div className="service-icon">🪦</div>
//           <h3>Post-Surgery Rehabilitation</h3>
//           <p>Guided rehabilitation after surgical procedures to ensure optimal recovery</p>
//         </div>

//         <div className="service-item">
//           <div className="service-icon">🧘</div>
//           <h3>Chronic Pain Management</h3>
//           <p>Long-term pain management strategies and exercises for chronic conditions</p>
//         </div>

//         <div className="service-item">
//           <div className="service-icon">💪</div>
//           <h3>Strength Training</h3>
//           <p>Build strength and prevent future injuries with guided exercise programs</p>
//         </div>

//         <div className="service-item">
//           <div className="service-icon">🧠</div>
//           <h3>Neurological Rehabilitation</h3>
//           <p>Specialized therapy for neurological conditions and injuries</p>
//         </div>

//         <div className="service-item">
//           <div className="service-icon">👴</div>
//           <h3>Senior Care</h3>
//           <p>Gentle, effective physiotherapy tailored for seniors and elderly patients</p>
//         </div>
//       </section>
//     </div>
//   );
// }

// // Login Component
// function LoginPage() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleLogin = (e) => {
//     e.preventDefault();
//     alert(`Welcome back! Login attempt with ${email}`);
//   };

//   return (
//     <div className="login-page">
//       <div className="login-container">
//         <div className="login-box">
//           <h2>Login to PhysioFlow</h2>
//           <p>Access your physiotherapy account</p>

//           <form onSubmit={handleLogin}>
//             <div className="form-group">
//               <label htmlFor="email">Email Address</label>
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="your@email.com"
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <label htmlFor="password">Password</label>
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 placeholder="Enter your password"
//                 required
//               />
//             </div>

//             <button type="submit" className="login-btn">Login</button>
//           </form>

//           <div className="login-footer">
//             <a href="#forgot">Forgot Password?</a>
//             <span>•</span>
//             <a href="#signup">Create Account</a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useState, useEffect } from 'react';

// ─── Nav Tab Config ───────────────────────────────────────────────
const NAV_TABS = [
  {
    key: 'home',
    label: 'Home',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: 'exercises',
    label: "Today's Exercises",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key: 'care',
    label: 'Customer Care',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

// ─── Theme Toggle ─────────────────────────────────────────────────
const ThemeToggle = ({ theme, toggleTheme }) => (
  <button
    onClick={toggleTheme}
    aria-label="Toggle theme"
    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
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
);

// ─── Stat Card ────────────────────────────────────────────────────
const StatCard = ({ value, label, icon }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
    <div className="text-3xl mb-1">{icon}</div>
    <h3 className="text-3xl font-extrabold text-cyan-700 dark:text-cyan-400">{value}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">{label}</p>
  </div>
);

// ─── Feature Card ─────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default">
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="text-lg font-bold text-cyan-900 dark:text-cyan-400 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// PAGE: Home
// ═══════════════════════════════════════════════════════════════════
function HomeContent({ setActiveTab }) {
  const features = [
    { icon: '👨‍⚕️', title: 'Licensed Therapists', desc: 'Work with certified physiotherapists from the comfort of your home.' },
    { icon: '📅', title: 'Flexible Scheduling', desc: 'Book sessions at times that work best for your schedule.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'Your health data is encrypted and HIPAA compliant.' },
    { icon: '📊', title: 'Progress Tracking', desc: 'Monitor your recovery with detailed progress reports.' },
    { icon: '🎯', title: 'Personalized Plans', desc: 'Custom rehabilitation routines designed just for you.' },
    { icon: '💬', title: 'Real-Time Support', desc: 'Instant messaging with your therapist whenever you need it.' },
  ];

  return (
    <div className="space-y-0">
      {/* Hero */}
      <section className="bg-gradient-to-br from-cyan-100 via-cyan-200 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 pt-20 pb-28 sm:pt-28 sm:pb-36 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-cyan-600/10 dark:bg-cyan-400/10 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-700 mb-6">
            Virtual Physiotherapy Platform
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-cyan-900 dark:text-cyan-400 tracking-tight leading-tight">
            Your Health, <br className="hidden sm:block" />Our Priority.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-700 dark:text-gray-300 leading-relaxed">
            Professional virtual physiotherapy at your fingertips. Recover faster, move better, live pain-free.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => setActiveTab('exercises')}
              className="px-8 py-3.5 text-base font-bold rounded-full text-white bg-cyan-600 shadow-xl shadow-cyan-500/40 hover:bg-cyan-700 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300"
            >
              View Today's Exercises
            </button>
            <button
              onClick={() => setActiveTab('care')}
              className="px-8 py-3.5 text-base font-bold rounded-full text-cyan-700 dark:text-cyan-300 border-2 border-cyan-400 dark:border-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-all duration-300"
            >
              Talk to Support
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <StatCard value="5000+" label="Happy Patients" icon="🏅" />
            <StatCard value="150+" label="Expert Therapists" icon="👨‍⚕️" />
            <StatCard value="98%" label="Satisfaction Rate" icon="⭐" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-500 mb-2">Features & Benefits</p>
            <h2 className="text-4xl font-extrabold text-cyan-900 dark:text-cyan-400">Why Choose PhysioBuddy?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-500 mb-2">Simple Steps</p>
            <h2 className="text-4xl font-extrabold text-cyan-900 dark:text-cyan-400">Start Recovery in 3 Easy Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {[
              { n: '1', title: 'Consultation & Plan', desc: 'Your therapist creates a personalized treatment plan in our portal.' },
              { n: '2', title: 'Daily Exercise', desc: 'Log in to PhysioBuddy to view your custom routines with video guidance.' },
              { n: '3', title: 'Track & Progress', desc: 'Your therapist monitors progress and adjusts your plan in real-time.' },
            ].map(step => (
              <div key={step.n} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg">
                <div className="mx-auto w-14 h-14 rounded-full bg-cyan-600 dark:bg-cyan-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-cyan-500/30 mb-5">
                  {step.n}
                </div>
                <h3 className="text-lg font-extrabold text-cyan-900 dark:text-cyan-400 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-800 dark:to-blue-900 text-white text-center transition-colors duration-500">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-extrabold mb-4">Ready to take control of your health?</h2>
          <p className="text-cyan-100 text-lg mb-8">Join thousands of patients finding better results with PhysioBuddy.</p>
          <button
            onClick={() => setActiveTab('exercises')}
            className="px-10 py-4 text-lg font-bold rounded-full bg-white text-cyan-700 shadow-2xl hover:bg-cyan-50 transition-all duration-300 hover:scale-105"
          >
            Start Your Recovery Journey
          </button>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: Today's Exercises
// ═══════════════════════════════════════════════════════════════════
const initialExercises = [
  { id: 1, name: 'Bicep Curl', reps: 15, sets: 3, category: 'Upper Body', completed: false },
  { id: 2, name: 'Standing Knee Lift', reps: 10, sets: 3, category: 'Lower Body', completed: true },
  { id: 3, name: 'Shoulder Press', reps: 12, sets: 4, category: 'Upper Body', completed: false },
  { id: 4, name: 'Hip Abduction', reps: 20, sets: 2, category: 'Lower Body', completed: false },
];

function ExercisesContent() {
  const [exercises, setExercises] = useState(initialExercises);
  const [toast, setToast] = useState(null);

  const completedCount = exercises.filter(e => e.completed).length;
  const total = exercises.length;
  const pct = Math.round((completedCount / total) * 100);

  const toggle = (id) => setExercises(prev => prev.map(e => e.id === id ? { ...e, completed: !e.completed } : e));
  const start = (name) => { setToast(name); setTimeout(() => setToast(null), 2000); };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Progress */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-900 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-cyan-100 text-xs font-bold uppercase tracking-widest mb-1">Today's Progress</p>
            <p className="text-4xl font-extrabold">{completedCount}<span className="text-xl text-cyan-200">/{total} done</span></p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="white" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - pct / 100)}`}
                strokeLinecap="round" className="transition-all duration-700" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
          </div>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {exercises.map(ex => (
          <div key={ex.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${ex.completed ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'}`}>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className={`text-lg font-extrabold ${ex.completed ? 'line-through text-emerald-700 dark:text-emerald-400' : 'text-cyan-900 dark:text-cyan-300'}`}>{ex.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">{ex.category}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{ex.reps} reps · {ex.sets} sets</p>
              <div className="mt-2">
                {ex.completed
                  ? <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">✓ Exercise Completed</span>
                  : <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">○ Incomplete</span>
                }
              </div>
            </div>
            <div className="flex gap-2">
              {!ex.completed && (
                <button onClick={() => start(ex.name)} className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  ▶ Start
                </button>
              )}
              <button onClick={() => toggle(ex.id)} className={`px-4 py-2.5 rounded-full text-sm font-semibold border-2 transition-all focus:outline-none ${ex.completed ? 'border-emerald-400 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                {ex.completed ? '↩ Undo' : '✓ Done'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {completedCount === total && (
        <div className="text-center py-10 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">All Done for Today!</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-500 mt-2">Amazing work. Your therapist will review your progress.</p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-cyan-600 text-white px-6 py-3 rounded-full shadow-2xl text-sm font-bold">
          ▶ Starting {toast}...
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: Profile
// ═══════════════════════════════════════════════════════════════════
function ProfileContent() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: 'Alex Kumar', email: 'alex.kumar@email.com', phone: '+91 98765 43210', condition: 'Knee Rehabilitation', therapist: 'Dr. Priya Sharma' });

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Avatar Card */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-700 dark:to-blue-900 rounded-2xl p-8 text-white text-center shadow-xl">
        <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center text-5xl mb-4 border-4 border-white/40">
          👤
        </div>
        <h2 className="text-2xl font-extrabold">{form.name}</h2>
        <p className="text-cyan-100 text-sm mt-1">{form.condition}</p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Active Patient
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-base font-extrabold text-cyan-900 dark:text-cyan-400">Personal Information</h3>
          <button onClick={() => setEditing(!editing)} className="text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300 transition">
            {editing ? 'Save' : '✏️ Edit'}
          </button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {[
            { label: 'Full Name', field: 'name', icon: '👤' },
            { label: 'Email', field: 'email', icon: '📧' },
            { label: 'Phone', field: 'phone', icon: '📱' },
            { label: 'Condition', field: 'condition', icon: '🏥' },
            { label: 'Therapist', field: 'therapist', icon: '👨‍⚕️' },
          ].map(({ label, field, icon }) => (
            <div key={field} className="flex items-center gap-4 px-6 py-4">
              <span className="text-xl w-8 text-center">{icon}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
                {editing && field !== 'therapist' ? (
                  <input value={form[field]} onChange={e => handleChange(field, e.target.value)}
                    className="w-full text-sm font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 border border-cyan-300 dark:border-cyan-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{form[field]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6">
        <h3 className="text-base font-extrabold text-cyan-900 dark:text-cyan-400 mb-4">Recovery Summary</h3>
        <div className="grid grid-cols-3 gap-4">
          {[{ v: '12', l: 'Sessions Done' }, { v: '4', l: 'Weeks Active' }, { v: '87%', l: 'Compliance' }].map(s => (
            <div key={s.l} className="text-center p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-100 dark:border-cyan-900">
              <p className="text-2xl font-extrabold text-cyan-700 dark:text-cyan-400">{s.v}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full py-3 rounded-xl text-sm font-bold text-red-500 dark:text-red-400 border-2 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
        Sign Out
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE: Customer Care
// ═══════════════════════════════════════════════════════════════════
function CustomerCareContent() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const faqs = [
    { q: 'How do I reschedule a session?', a: 'Go to your appointments section and click "Reschedule" on any upcoming session.' },
    { q: 'Can I change my assigned therapist?', a: 'Yes, contact our support team or use the Profile page to request a change.' },
    { q: 'How do I track my progress?', a: "Your therapist updates your progress after each session, visible in the Today's Exercises tab." },
    { q: 'Is my health data secure?', a: 'Absolutely. All data is encrypted and HIPAA compliant at all times.' },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-500 mb-2">We're Here to Help</p>
        <h2 className="text-4xl font-extrabold text-cyan-900 dark:text-cyan-400">Customer Care</h2>
        <p className="mt-3 text-gray-600 dark:text-gray-400">Reach out to us anytime. Our team typically responds within 1 hour.</p>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: '📞', label: 'Phone', value: '+91 800-PHYSIO', sub: 'Mon–Sat, 9am–7pm' },
          { icon: '📧', label: 'Email', value: 'help@physiobuddy.in', sub: 'Within 2 hours' },
          { icon: '💬', label: 'Live Chat', value: 'Chat with us', sub: 'Available now' },
        ].map(c => (
          <div key={c.label} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            <div className="text-3xl mb-2">{c.icon}</div>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">{c.label}</p>
            <p className="text-sm font-bold text-cyan-700 dark:text-cyan-400 mt-1">{c.value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg p-6 sm:p-8">
        <h3 className="text-xl font-extrabold text-cyan-900 dark:text-cyan-400 mb-6">Send a Message</h3>
        {submitted ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-3">✅</div>
            <h4 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">Message Sent!</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">We'll get back to you within 2 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Your full name' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={placeholder} required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="How can we help?" required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Message</label>
              <textarea rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Describe your issue in detail..." required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition resize-none"
              />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400">
              Send Message →
            </button>
          </form>
        )}
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-xl font-extrabold text-cyan-900 dark:text-cyan-400 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center px-5 py-4 text-left text-sm font-bold text-cyan-900 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition"
              >
                {faq.q}
                <svg className={`w-4 h-4 text-cyan-500 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT: Home Shell
// ═══════════════════════════════════════════════════════════════════
export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(p => p === 'dark' ? 'light' : 'dark');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':       return <HomeContent setActiveTab={setActiveTab} />;
      case 'exercises':  window.location.href = "/exercise-list"; return null;
      case 'profile':    window.location.href = "/patient-profile"; return null;
      case 'care':       return <CustomerCareContent />;
      default:           return <HomeContent setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-[Inter] transition-colors duration-500">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">

            {/* Logo */}
            <button onClick={() => setActiveTab('home')} className="flex items-center gap-2 focus:outline-none">
              <span className="text-2xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight">Physio<span className="text-cyan-900 dark:text-white">Buddy</span></span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              {/* Mobile hamburger */}
              <button
                onClick={() => setIsMenuOpen(p => !p)}
                className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-2xl">
            <div className="px-3 py-3 space-y-1">
              {NAV_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setIsMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-cyan-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Content ────────────────────────────────────────── */}
      <main>{renderContent()}</main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-gray-800 dark:bg-gray-950 text-white py-10 mt-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm">
          <p className="font-semibold text-cyan-400 mb-1">PhysioBuddy</p>
          <p className="text-gray-400">&copy; {new Date().getFullYear()} PhysioBuddy. All rights reserved.</p>
          <div className="mt-4 flex justify-center gap-4 text-gray-400">
            <a href="#" className="hover:text-cyan-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition">Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* ── Bottom Tab Bar (Mobile) ─────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="flex">
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === tab.key ? 'bg-cyan-50 dark:bg-cyan-900/30' : ''}`}>
                {tab.icon}
              </div>
              <span className="leading-none truncate w-full text-center px-1">{tab.label.split("'")[0].trim()}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-20" />
    </div>
  );
}