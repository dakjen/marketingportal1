import React, { useState } from 'react';
import './OperationsPropertyManagementPage.css';

function PropertyManagementPage() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSaveContact = () => {
    console.log('Saving Contact:', { contactName, contactPhone, contactEmail });
    // Here you would typically send this data to a backend API
    alert('Contact information saved (check console for details)!');
  };

  return (
    <div>
      <h2>Operations Property Management</h2>
      <div className="operations-property-management-page-container">
          <div className="dashboard-column left-column">
            <h2>Point of Contact</h2>
            <form>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="contactName" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
                <input
                  type="text"
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="contactPhone" style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
                <input
                  type="text"
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label htmlFor="contactEmail" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
              <button type="button" onClick={handleSaveContact} style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Save Contact
              </button>
            </form>
          </div>
        <div className="operations-property-management-right-column">
          <h3>Right Column Content</h3>
          <p>This is placeholder content for the right column of the Operations Property Management page.</p>
        </div>
      </div>
    </div>
  );
}

export default PropertyManagementPage;