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
          <h3>Right Column Content</h3>
          <p>This is placeholder content for the right column of the Operations Dashboard.</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsDashboardPage;