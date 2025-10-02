import React, { useState, useEffect } from 'react';
import './OperationsDashboardPage.css';

function OperationsDashboardPage() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    const savedProjectName = localStorage.getItem('projectName');
    const savedProjectDescription = localStorage.getItem('projectDescription');

    if (savedProjectName) {
      setProjectName(savedProjectName);
    }
    if (savedProjectDescription) {
      setProjectDescription(savedProjectDescription);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('projectName', projectName);
    localStorage.setItem('projectDescription', projectDescription);
    alert('Project details saved!');
  };

  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [links, setLinks] = useState([]);

  useEffect(() => {
    const savedLinks = localStorage.getItem('dashboardImportantLinks');
    if (savedLinks) {
      setLinks(JSON.parse(savedLinks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardImportantLinks', JSON.stringify(links));
  }, [links]);

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
      <h2>Operations Dashboard</h2>
      <div className="operations-dashboard-page-container">
        <div className="operations-dashboard-left-column">
          <h3>Current Project Details</h3>
          <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>
            <h4>Current Details:</h4>
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
              Save Details
            </button>
          </form>
        </div>
        <div className="operations-dashboard-right-column">
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
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="linkName" style={{ display: 'block', marginBottom: '5px' }}>Link Name:</label>
              <input
                type="text"
                id="linkName"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label htmlFor="linkUrl" style={{ display: 'block', marginBottom: '5px' }}>Link URL:</label>
              <input
                type="text"
                id="linkUrl"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
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

export default OperationsDashboardPage;