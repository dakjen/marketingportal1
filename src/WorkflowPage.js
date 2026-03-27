import React, { useState, useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import WorkflowChecklist from './WorkflowChecklist';
import WorkflowBudget from './WorkflowBudget';
import WorkflowListings from './WorkflowListings';
import WorkflowTeam from './WorkflowTeam';
import './WorkflowPage.css';

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'budget', label: 'Budget vs. Actuals' },
  { id: 'listings', label: 'Listings' },
  { id: 'team', label: 'Team' },
];

function WorkflowPage() {
  const { activeProject } = useContext(ProjectContext);
  const [activeTab, setActiveTab] = useState('checklist');

  if (!activeProject) {
    return (
      <div className="workflow-no-project">
        <p>Please select a project to view its workflow.</p>
      </div>
    );
  }

  return (
    <div className="workflow-container">
      <div className="workflow-header">
        <h2>Workflow — {activeProject.name}</h2>
      </div>

      <div className="workflow-inner-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`workflow-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="workflow-tab-content">
        {activeTab === 'checklist' && <WorkflowChecklist projectName={activeProject.name} />}
        {activeTab === 'budget' && <WorkflowBudget projectName={activeProject.name} />}
        {activeTab === 'listings' && <WorkflowListings projectName={activeProject.name} />}
        {activeTab === 'team' && <WorkflowTeam projectName={activeProject.name} />}
      </div>
    </div>
  );
}

export default WorkflowPage;
