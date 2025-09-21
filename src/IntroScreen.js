import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroScreen.css';

function IntroScreen() {
  const navigate = useNavigate();

  return (
    <div className="intro-container">
      <h1>Welcome to the Marketing Portal</h1>
      <p>Your central hub for managing social media and physical marketing entries across various projects.</p>
      <div className="intro-buttons">
        <button onClick={() => navigate('/login')}>Log In</button>
        <button onClick={() => navigate('/request-account')}>Request an Account</button>
      </div>
    </div>
  );
}

export default IntroScreen;
