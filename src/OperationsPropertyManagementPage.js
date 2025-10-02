import React, { useState, useEffect } from 'react';
import './OperationsPropertyManagementPage.css';

function PropertyManagementPage() {
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Load contact info from local storage on component mount
  useEffect(() => {
    const savedContactName = localStorage.getItem('contactName');
    const savedContactPhone = localStorage.getItem('contactPhone');
    const savedContactEmail = localStorage.getItem('contactEmail');

    if (savedContactName) setContactName(savedContactName);
    if (savedContactPhone) setContactPhone(savedContactPhone);
    if (savedContactEmail) setContactEmail(savedContactEmail);
  }, []); // Empty dependency array means this runs once on mount

  const handleSaveContact = () => {
    console.log('Saving Contact:', { contactName, contactPhone, contactEmail });
    localStorage.setItem('contactName', contactName);
    localStorage.setItem('contactPhone', contactPhone);
    localStorage.setItem('contactEmail', contactEmail);
    alert('Contact information saved (check console for details)!');
  };

  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState([]);

  // Load links from local storage on component mount
  useEffect(() => {
    const savedLinks = localStorage.getItem('importantLinks');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []); // Empty dependency array means this runs once on mount

  // Save links to local storage whenever the links state changes
  useEffect(() => {
    localStorage.setItem('importantLinks', JSON.stringify(links));
  }, [links]); // Runs whenever 'links' state changes

  const handleAddLink = () => {
    if (linkName && linkUrl) {
      setLinks([...links, { name: linkName, url: linkUrl }]);
      setLinkName('');
      setLinkUrl('');
    } else {
      alert('Please enter both link name and URL.');
    }
  };

  return (
    <div>
      <h2>Operations Property Management</h2>
      <div className="operations-property-management-page-container">
          <div className="dashboard-column left-column">
            <h2>Point of Contact</h2>
            <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
              <h4>Current Point of Contact:</h4>
              <p><strong>Name:</strong> {contactName || 'N/A'}</p>
              <p><strong>Phone:</strong> {contactPhone || 'N/A'}</p>
              <p><strong>Email:</strong> {contactEmail || 'N/A'}</p>
            </div>
            <form>
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
          <form style={{ marginBottom: '20px' }}>
        </div>
      </div>
    </div>
  );
}

export default PropertyManagementPage;