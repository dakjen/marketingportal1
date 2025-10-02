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
