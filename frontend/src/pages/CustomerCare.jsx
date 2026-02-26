import React from 'react';
import './CustomerCare.css';

export default function CustomerCare() {

  return (
    <div className="customer-care">
      {/* Header */}
      <header className="cc-header">
        <h1>Customer Care & Support</h1>
        <p>We're here to help you with your physiotherapy journey</p>
      </header>

      {/* Contact Options */}
      <section className="cc-section">
        <h2>Contact Us</h2>
        <div className="cc-contact-grid">
          <div className="cc-contact-card">
            <h3>📞 Call Us</h3>
            <p>1-800-PHYSIO (749-7746)</p>
            <p className="cc-subtitle">Mon-Fri: 8AM-8PM EST</p>
          </div>

          <div className="cc-contact-card">
            <h3>✉️ Email</h3>
            <p><a href="mailto:support@physioflow.com">support@physioflow.com</a></p>
            <p className="cc-subtitle">Response within 24 hours</p>
          </div>

          <div className="cc-contact-card">
            <h3>💬 Live Chat</h3>
            <p>Available during business hours</p>
            <p className="cc-subtitle">Click the chat icon in the corner</p>
          </div>
        </div>
      </section>



      {/* Support Hours */}
      <section className="cc-section cc-hours">
        <h2>Support Hours</h2>
        <div className="cc-hours-grid">
          <div className="cc-hours-item">
            <h4>General Support</h4>
            <p>Mon-Fri: 8AM - 8PM<br/>Sat: 9AM - 5PM<br/>Sun: 10AM - 4PM</p>
          </div>
          <div className="cc-hours-item">
            <h4>Emergency</h4>
            <p>Available 24/7<br/>Call: 1-800-PHYSIO<br/>Press 9 for emergency</p>
          </div>
          <div className="cc-hours-item">
            <h4>Technical Support</h4>
            <p>Mon-Fri: 7AM - 9PM<br/>Sat-Sun: 9AM - 6PM</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cc-footer">
        <p>&copy; 2024 PhysioFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}