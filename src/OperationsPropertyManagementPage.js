import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import './OperationsPropertyManagementPage.css';

function OperationsPropertyManagementPage() {
  const { activeProject } = useContext(ProjectContext);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    if (activeProject) {
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setContactName(data.contact_name || '');
          setContactPhone(data.contact_phone || '');
          setContactEmail(data.contact_email || '');
          setLinks(data.important_links || []);
        })
        .catch(err => console.error("Error fetching operations data:", err));
    }
  }, [activeProject]);

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

export default OperationsPropertyManagementPage;