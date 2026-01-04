import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>AI-Powered Grievance Redressal System</h1>
        <p className="tagline">Transparent, Efficient, and Accountable Governance</p>
      </div>

      <div className="home-content">
        <div className="platform-info">
          <h2>About the Platform</h2>
          <p>
            Our AI-driven grievance redressal platform leverages Natural Language Processing
            and blockchain technology to revolutionize public governance. We ensure every
            citizen complaint is heard, processed efficiently, and resolved transparently.
          </p>

          <div className="features">
            <div className="feature-card">
              <h3>AI-Powered Classification</h3>
              <p>Automatic complaint categorization and priority assignment</p>
            </div>
            <div className="feature-card">
              <h3>Blockchain Transparency</h3>
              <p>Immutable record of all complaints and resolutions</p>
            </div>
            <div className="feature-card">
              <h3>SSI Identity</h3>
              <p>Secure Self-Sovereign Identity for all citizens</p>
            </div>
            <div className="feature-card">
              <h3>Real-Time Tracking</h3>
              <p>Track your complaint status at every step</p>
            </div>
          </div>
        </div>

        <div className="registration-section">
          <h2>Get Started</h2>
          <p>Choose your role to register and begin</p>

          <div className="registration-buttons">
            <button
              className="register-btn citizen-btn"
              onClick={() => navigate('/register-citizen')}
            >
              Register as Citizen
            </button>
            <button
              className="register-btn authority-btn"
              onClick={() => navigate('/register-authority')}
            >
              Register as Authority
            </button>
          </div>

          <div className="login-link">
            <p>Already registered?</p>
            <button className="login-btn" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;