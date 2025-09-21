import React from 'react';
import { useNavigate } from 'react-router-dom';
import DjCreativeLogo from '../public/djcreative-logo.png'; // Import the logo
import './IntroScreen.css';

function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <h1>Welcome to the Marketing Portal</h1>
      <p>The DakJen Creative Marketing Portal is designed as a real-time calculation and tracking tool for project lease-up marketing services. Through this portal, clients can view their marketing spend as it happens, ensuring full transparency into where budgets are allocated and how resources are performing. By centralizing spend data, the portal empowers clients to make informed decisions, optimize campaigns, and stay aligned with their marketing goals throughout the lease-up process.</p>
      <div className="intro-buttons">
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/request-account')}>Request an Account</button>
      </div>
      <img src={DjCreativeLogo} alt="DakJen Creative Logo" className="intro-logo" />
    </div>
  );
}

export default IntroScreen;
