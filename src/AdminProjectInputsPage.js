import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import { AuthContext } from './AuthContext';
import './AdminProjectInputsPage.css';

function AdminProjectInputsPage() {
  const { activeProject } = useContext(ProjectContext);
  const { currentUser } = useContext(AuthContext);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [importantDetails, setImportantDetails] = useState('');

  const [pmContactName, setPmContactName] = useState('');
  const [pmContactPhone, setPmContactPhone] = useState('');
  const [pmContactEmail, setPmContactEmail] = useState('');

  const [pmLinkName, setPmLinkName] = useState('');
  const [pmLinkUrl, setPmLinkUrl] = useState('');
  const [pmLinks, setPmLinks] = useState([]);

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setProjectDescription(data.project_description || '');
          setImportantDetails(data.important_details || '');
          setPmContactName(data.contact_name || '');
          setPmContactPhone(data.contact_phone || '');
          setPmContactEmail(data.contact_email || '');
          setPmLinks(data.important_links || []);
        })
        .catch(err => console.error("Error fetching operations data:", err));
    }
  }, [activeProject]);

  const handleSave = async () => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    const dataToSave = {
      project_name: activeProject.name,
      project_description: projectDescription,
      important_details: importantDetails,
      contact_name: pmContactName,
      contact_phone: pmContactPhone,
      contact_email: pmContactEmail,
      important_links: pmLinks,
    };

    try {
      const response = await fetch('/api/operations-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role, // Send user role for authorization
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to save data');
      }

      alert('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert(`Error saving data: ${error.message}. Please try again.`);
    }
  };

  const handleAddLink = () => {
    if (pmLinkName && pmLinkUrl) {
      setPmLinks([...pmLinks, { name: pmLinkName, url: pmLinkUrl }]);
      setPmLinkName('');
      setPmLinkUrl('');
    } else {
      alert('Please enter both link name and URL.');
    }
  };

  return (
    <div>
      <h2>Admin Project Inputs</h2>
      <div className="admin-project-inputs-page-container">
        <div className="admin-project-inputs-left-column">
          <h3>Operations Dashboard</h3>
          <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <h4>Current Project Details:</h4>
            <p><strong>Project Name:</strong> {projectName || 'N/A'}</p>
            <p><strong>Description:</strong> {projectDescription || 'N/A'}</p>
          </div>
          <form>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="projectName" style={{ display: 'block', marginBottom: '5px' }}>Project Name:</label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="projectDescription" style={{ display: 'block', marginBottom: '5px' }}>Project Description:</label>
              <textarea
                id="projectDescription"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '100px' }}
              />
            </div>
            <button type="button" onClick={handleSave} style={{ padding: '10px 15px', backgroundColor: '#646464', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Save Project Details
            </button>
          </form>

          <h3 style={{ marginTop: '20px' }}>Important Details</h3>
          <form>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="importantDetails" style={{ display: 'block', marginBottom: '5px' }}>Important Details:</label>
              <textarea
                id="importantDetails"
                value={importantDetails}
                onChange={(e) => setImportantDetails(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', minHeight: '100px' }}
              />
            </div>
            <button type="button" onClick={handleSave} style={{ padding: '10px 15px', backgroundColor: '#646464', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Save Important Details
            </button>
          </form>
        </div>
        <div className="admin-project-inputs-right-column">
          <h3>Property Management</h3>
          <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <h4>Current Point of Contact:</h4>
            <p><strong>Name:</strong> {pmContactName || 'N/A'}</p>
            <p><strong>Phone:</strong> {pmContactPhone || 'N/A'}</p>
            <p><strong>Email:</strong> {pmContactEmail || 'N/A'}</p>
          </div>
          <form>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="pmContactName" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                id="pmContactName"
                value={pmContactName}
                onChange={(e) => setPmContactName(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="pmContactPhone" style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
              <input
                type="text"
                id="pmContactPhone"
                value={pmContactPhone}
                onChange={(e) => setPmContactPhone(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="pmContactEmail" style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
              <input
                type="email"
                id="pmContactEmail"
                value={pmContactEmail}
                onChange={(e) => setPmContactEmail(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <button type="button" onClick={handleSave} style={{ padding: '10px 15px', backgroundColor: '#646464', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Save Contact
            </button>
          </form>

          <h3 style={{ marginTop: '20px' }}>Important Links</h3>
          <div className="links-list" style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            {pmLinks.length === 0 ? (
              <p>No important links added yet.</p>
            ) : (
              <ul>
                {pmLinks.map((link, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <form style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="pmLinkName" style={{ display: 'block', marginBottom: '5px' }}>Link Name:</label>
              <input
                type="text"
                id="pmLinkName"
                value={pmLinkName}
                onChange={(e) => setPmLinkName(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="pmLinkUrl" style={{ display: 'block', marginBottom: '5px' }}>Link URL:</label>
              <input
                type="text"
                id="pmLinkUrl"
                value={pmLinkUrl}
                onChange={(e) => setPmLinkUrl(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <button type="button" onClick={handleAddLink} style={{ padding: '10px 15px', backgroundColor: '#646464', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Add Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminProjectInputsPage;
