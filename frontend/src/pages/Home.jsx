import React, { useState } from 'react';
import './Home.css';
import './Login.jsx'
import CustomerCare from './CustomerCare';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeContent />;
      case 'about':
        return <AboutUs />;
      case 'services':
        return <Services />;
      case 'login':
        return <LoginPage/ >;
      case 'care':
        return <CustomerCare />;
      default:
        return <HomeContent />;
    }
  };

  return (
    <div className="app">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">💚</span>
            <span className="logo-text">PhysioFlow</span>
          </div>

          <ul className="nav-menu">
            <li>
              <button
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About Us
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                Services
              </button>
            </li>
            <li>
              <button
                className={`nav-link ${activeTab === 'care' ? 'active' : ''}`}
                onClick={() => setActiveTab('care')}
              >
                Support
              </button>
            </li>
            <li>
              <button
                className={`nav-link btn-login ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

// Home Content Component
function HomeContent() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Your Health, Our Priority</h1>
          <p className="hero-subtitle">
            Professional virtual physiotherapy at your fingertips. Recover faster, live better.
          </p>
          <button className="hero-btn">Get Started Today</button>
        </div>
        <div className="hero-image">
          <div className="hero-graphic">
            <span className="hero-emoji">🏥</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose PhysioFlow?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">👨‍⚕️</div>
            <h3>Licensed Therapists</h3>
            <p>Work with certified physiotherapists from the comfort of your home</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Flexible Scheduling</h3>
            <p>Book sessions at times that work best for your schedule</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your health data is encrypted and HIPAA compliant</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your recovery with detailed progress reports</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Create Account</h4>
            <p>Sign up in minutes with your basic information</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Book Session</h4>
            <p>Choose your therapist and preferred time slot</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Start Therapy</h4>
            <p>Join your video session and begin recovery</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stat-item">
          <h3>5000+</h3>
          <p>Happy Patients</p>
        </div>
        <div className="stat-item">
          <h3>150+</h3>
          <p>Expert Therapists</p>
        </div>
        <div className="stat-item">
          <h3>98%</h3>
          <p>Satisfaction Rate</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Start Your Recovery Journey?</h2>
        <button className="cta-btn">Book Your First Session</button>
      </section>
    </div>
  );
}

// About Us Component
function AboutUs() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <h1>About PhysioFlow</h1>
        <p>Revolutionizing physiotherapy through technology and compassion</p>
      </section>

      <section className="about-content">
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>
            At PhysioFlow, we believe that quality physiotherapy should be accessible to everyone, 
            anywhere, anytime. Our mission is to bridge the gap between patients and certified therapists 
            through cutting-edge technology and personalized care.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Vision</h2>
          <p>
            To become the world's leading virtual physiotherapy platform, empowering millions of people 
            to recover from injuries, manage chronic conditions, and improve their overall quality of life 
            with professional guidance from home.
          </p>
        </div>

        <div className="about-section">
          <h2>Our Values</h2>
          <ul className="values-list">
            <li>🎯 Excellence - We strive for the highest standards in care</li>
            <li>🤝 Compassion - We genuinely care about our patients' wellbeing</li>
            <li>🔒 Trust - Your privacy and security are paramount</li>
            <li>💡 Innovation - We leverage technology for better outcomes</li>
          </ul>
        </div>

        <div className="about-section">
          <h2>Our Team</h2>
          <p>
            Our team consists of experienced physiotherapists, healthcare professionals, and technology 
            experts dedicated to providing the best virtual physiotherapy experience. All our therapists are 
            licensed, certified, and committed to your recovery.
          </p>
        </div>
      </section>
    </div>
  );
}

// Services Component
function Services() {
  return (
    <div className="services-page">
      <section className="services-hero">
        <h1>Our Services</h1>
        <p>Comprehensive physiotherapy solutions tailored to your needs</p>
      </section>

      <section className="services-grid">
        <div className="service-item">
          <div className="service-icon">🦵</div>
          <h3>Sports Injury Recovery</h3>
          <p>Get back to your game with specialized recovery programs for sports-related injuries</p>
        </div>

        <div className="service-item">
          <div className="service-icon">🪦</div>
          <h3>Post-Surgery Rehabilitation</h3>
          <p>Guided rehabilitation after surgical procedures to ensure optimal recovery</p>
        </div>

        <div className="service-item">
          <div className="service-icon">🧘</div>
          <h3>Chronic Pain Management</h3>
          <p>Long-term pain management strategies and exercises for chronic conditions</p>
        </div>

        <div className="service-item">
          <div className="service-icon">💪</div>
          <h3>Strength Training</h3>
          <p>Build strength and prevent future injuries with guided exercise programs</p>
        </div>

        <div className="service-item">
          <div className="service-icon">🧠</div>
          <h3>Neurological Rehabilitation</h3>
          <p>Specialized therapy for neurological conditions and injuries</p>
        </div>

        <div className="service-item">
          <div className="service-icon">👴</div>
          <h3>Senior Care</h3>
          <p>Gentle, effective physiotherapy tailored for seniors and elderly patients</p>
        </div>
      </section>
    </div>
  );
}

// Login Component
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    alert(`Welcome back! Login attempt with ${email}`);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h2>Login to PhysioFlow</h2>
          <p>Access your physiotherapy account</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="login-footer">
            <a href="#forgot">Forgot Password?</a>
            <span>•</span>
            <a href="#signup">Create Account</a>
          </div>
        </div>
      </div>
    </div>
  );
}