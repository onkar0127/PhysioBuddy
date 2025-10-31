import React from "react";
import "./CustomerCare.css";

const CustomerCare = () => {
  return (
    <div className="page">
      {/* Header Section */}
      <div className="header">
        <h1 className="title">Customer Care</h1>
        <p className="subtitle">We are here to assist you 24/7</p>
      </div>

      {/* Cards Section */}
      <div className="cards-container">
        {/* Email Card */}
        <div className="card">
          <h2>Email Us</h2>
          <p>support@healthcare.com</p>
        </div>

        {/* Contact Number Card */}
        <div className="card">
          <h2>Call Us</h2>
          <p>+91 98765 43210</p>
        </div>

        {/* Details Card */}
        <div className="card">
          <h2>Our Details</h2>
          <p>
            We provide round-the-clock support for patients and doctors.  
            Reach out anytime for queries, feedback, or assistance. Your satisfaction is our priority.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;
