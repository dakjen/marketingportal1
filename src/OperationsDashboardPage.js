import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import './OperationsDashboardPage.css';

function OperationsDashboardPage() {
  const { activeProject } = useContext(ProjectContext);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [importantDetails, setImportantDetails] = useState('');

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setProjectDescription(data.project_description || '');
          setImportantDetails(data.important_details || '');
        })
        .catch(err => console.error("Error fetching operations data:", err));
    }
  }, [activeProject]);

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
          <h3>Important Details</h3>
          <p>{importantDetails || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsDashboardPage;