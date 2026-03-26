import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
  const [username, setUsername] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
      } else {
        setError('Username not found. Please check and try again.');
      }
    } catch {
      setError('Unable to reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#000', padding: '32px 36px 28px', borderBottom: '4px solid #c07481' }}>
          <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.75rem', fontWeight: 700 }}>
            Reset Password
          </h2>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.95rem' }}>
            Enter your username to get a temporary password
          </p>
        </div>

        <div style={{ padding: '32px 36px' }}>
          {!tempPassword ? (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fdf0f2', border: '1px solid #e8a0ad', color: '#a0404f', padding: '10px 14px', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  {error}
                </div>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.875rem', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', backgroundColor: loading ? '#ddd' : '#c07481', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? 'Resetting...' : 'Get Temporary Password'}
              </button>
            </form>
          ) : (
            <div>
              <p style={{ fontSize: '0.95rem', color: '#444', marginTop: 0 }}>
                Your temporary password has been set. Use it to log in, then update your password in your profile settings.
              </p>
              <div style={{ background: '#f7f7f7', border: '1px solid #ddd', borderRadius: '8px', padding: '16px 20px', textAlign: 'center', margin: '20px 0' }}>
                <p style={{ margin: '0 0 6px', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Temporary Password</p>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, fontFamily: 'monospace', color: '#111', letterSpacing: '2px' }}>{tempPassword}</p>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#999', marginBottom: '24px' }}>
                Copy this password — it won't be shown again.
              </p>
            </div>
          )}

          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#c07481', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
