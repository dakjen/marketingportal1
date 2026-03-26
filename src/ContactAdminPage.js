import React from 'react';
import { Link } from 'react-router-dom';

function ContactAdminPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
      }}>
        <div style={{
          backgroundColor: '#000',
          padding: '32px 36px 28px',
          borderBottom: '4px solid #c07481',
        }}>
          <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: '1.75rem', fontWeight: 700 }}>
            Forgot Password?
          </h2>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.95rem' }}>
            We can help you get back in
          </p>
        </div>
        <div style={{ padding: '32px 36px' }}>
          <p style={{ fontSize: '1rem', color: '#444', lineHeight: 1.6, marginTop: 0 }}>
            Please contact an administrator to reset your password. They'll be able to get your account sorted out quickly.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '28px' }}>
            Reach out via your usual communication channel or ask a team member to connect you with an admin.
          </p>
          <Link
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '12px',
              backgroundColor: '#c07481',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#a05a6a'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#c07481'}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ContactAdminPage;
