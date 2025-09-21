import React from 'react';

function ContactAdminPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2>Forgot Password?</h2>
      <p style={{ fontSize: '1.2em', color: '#555' }}>
        Please contact an administrator for assistance with your password.
      </p>
      <p style={{ fontSize: '1em', color: '#777' }}>
        They will be able to reset your account or provide further instructions.
      </p>
    </div>
  );
}

export default ContactAdminPage;
