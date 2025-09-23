import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function RequestAccountPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, name, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      setSuccess('Account created successfully! You can now log in.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Request an Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}
        <button type="submit" style={{ padding: '10px 20px', marginRight: '10px' }}>
          Create Account
        </button>
        <button type="button" onClick={handleGoBack}>
          Go Back
        </button>
      </form>
    </div>
  );
}

export default RequestAccountPage;