import React from 'react';
import { useNavigate } from 'react-router-dom';

function RequestAccountPage() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/'); // Go back to the intro screen or login
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Request an Account</h2>
      <p>Please contact the administrator to request an account.</p>
      <p>Email: admin@example.com</p>
      <button onClick={handleGoBack}>Go Back</button>
    </div>
  );
}

export default RequestAccountPage;
