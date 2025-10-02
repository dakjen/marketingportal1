import React, { useState, useEffect } from 'react';
import './OperationsPropertyManagementPage.css';

function PropertyManagementPage() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const savedContactName = localStorage.getItem('propertyManagementContactName');
    const savedContactPhone = localStorage.getItem('propertyManagementContactPhone');
    const savedContactEmail = localStorage.getItem('propertyManagementContactEmail');

    if (savedContactName) setContactName(savedContactName);
    if (savedContactPhone) setContactPhone(savedContactPhone);
    if (savedContactEmail) setContactEmail(savedContactEmail);

    const savedLinks = localStorage.getItem('propertyManagementImportantLinks');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  return (
    <div>
      <h2>Operations Property Management</h2>
      <div className="operations-property-management-page-container">
          <div className="operations-property-management-left-column">
            <h2>Point of Contact</h2>
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h4>Current Point of Contact:</h4>
              <p><strong>Name:</strong> {contactName || 'N/A'}</p>
              <p><strong>Phone:</strong> {contactPhone || 'N/A'}</p>
              <p><strong>Email:</strong> {contactEmail || 'N/A'}</p>
            </div>
          </div>
        <div className="operations-property-management-right-column">
          <h3>Important Links</h3>
          <div className="links-list" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            {links.length === 0 ? (
              <p>No important links added yet.</p>
            ) : (
              <ul>
                {links.map((link, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyManagementPage;
