import React, { useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import './ProjectSwitcher.css';

function ProjectSwitcher() {
  const { projects, activeProject, selectProject } = useContext(ProjectContext);

  return (
    <div className="project-switcher-container">
      <label htmlFor="project-select">Select Project:</label>
      <select
        id="project-select"
        value={activeProject ? activeProject.name : ''}
        onChange={(e) => selectProject(e.target.value)}
      >
        <option value="">-- Select a Project --</option>
        {projects.map((project) => (
          <option key={project.name} value={project.name}>
            {project.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ProjectSwitcher;