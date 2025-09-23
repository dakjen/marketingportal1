import React, { useContext, useState, useEffect } from 'react';
     import { ProjectContext } from './ProjectContext';
     import { AuthContext } from './AuthContext';
     import './ProjectManagementPage.css';
     
     function ProjectManagementPage() {
       const { projects, allProjects, activeProject, addProject, selectProject, deleteProject, archiveProject, unarchiveProject }
     = useContext(ProjectContext);
       console.log('ProjectManagementPage re-rendering. Projects:', projects);
       const { updateUserPermissions } = useContext(AuthContext);
       const [newProjectName, setNewProjectName] = useState('');
   
     const [users, setUsers] = useState([]);
     const [selectedUser, setSelectedUser] = useState(null);
     const [permissionChanges, setPermissionChanges] = useState({});
   
     useEffect(() => {
       const fetchUsers = async () => {
         try {
           const response = await fetch('/api/users');
           if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
           }
           const data = await response.json();
           setUsers(data.users);
         } catch (error) {
           console.error("Failed to fetch users:", error);
         }
       };
       fetchUsers();
     }, []);
   
      useEffect(() => {
    if (selectedUser) {
         const initialPermissions = {};
        // Use allProjects from context, not from localStorage
      allProjects.forEach(project => {
             initialPermissions[project.name] = (selectedUser.allowedProjects || []).includes(project.
      name);
        });
        setPermissionChanges(initialPermissions);
        } else {
       setPermissionChanges({});
    }
    }, [selectedUser, allProjects]); // Add allProjects to dependency array
   
     const handlePermissionChange = (projectName) => {
       setPermissionChanges(prev => ({ ...prev, [projectName]: !prev[projectName] }));
     };
   
     const handleSavePermissions = () => {
       const newAllowedProjects = Object.keys(permissionChanges).filter(projectName =>
       permissionChanges[projectName]);
       updateUserPermissions(selectedUser.username, newAllowedProjects);
       alert(`Permissions for ${selectedUser.username} have been updated.`);
     };
   
    const handleAddProject = (e) => {
       e.preventDefault();
       if (newProjectName.trim() === '') {
         alert('Project name cannot be empty.');
         return;
       }
       if (addProject(newProjectName)) {
         setNewProjectName('');
       }
     };

     const activeProjects = projects.filter(p => !p.isArchived);
     const archivedProjects = projects.filter(p => p.isArchived);
   
     return (
       <div className="project-management-container">
         <h2>Project Management</h2>
         <div className="project-management-layout">
           <div className="permissions-sidebar">
             <div className="user-permissions-section">
               <h3>User Project Permissions</h3>
               <div className="user-selection">
                 <label htmlFor="user-select">Select User:</label>
                 <select id="user-select" onChange={(e) => setSelectedUser(users.find(u => u.
       username === e.target.value) || null)}>
                   <option value="">-- Select a user --</option>
                   {users.map(user => (
                     <option key={user.username} value={user.username}>{user.username
       }</option>
                   ))}
                 </select>
               </div>
   
               {selectedUser && (
                 <div className="permissions-checklist">
                   <h4>Permissions for {selectedUser.username}</h4>
                   {allProjects.map(project => (
                     <div key={project.name} className="permission-item">
                       <input
                         type="checkbox"
                         id={`perm-${project.name}`}
                         checked={permissionChanges[project.name] || false}
                         onChange={() => handlePermissionChange(project.name)}
                       />
                       <label htmlFor={`perm-${project.name}`}>{project.name}</label>
                     </div>
                   ))}
                   <button onClick={handleSavePermissions}>Save Permissions</button>
                 </div>
               )}
             </div>
           </div>
           <div className="main-content">
             <div className="project-creation-section">
               <h3>Create New Project</h3>
               <form onSubmit={handleAddProject} className="add-project-form">
                 <input
                   type="text"
                 placeholder="New Project Name"
                 value={newProjectName}
                 onChange={(e) => setNewProjectName(e.target.value)}
               />
               <button type="submit">Create Project</button>
             </form>
           </div>
 


          <div className="project-list-section">
            <h3>Active Projects</h3>
            <ul className="project-list">
              {activeProjects.map(project => (
                <li key={project.name}>
                  <span>{project.name}</span>
                  <div>
                    <button className="archive-button" onClick={() => archiveProject(project.name)}>Archive</button>
                    <button className="delete-button-less-prominent" onClick={() => deleteProject(project.name)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="project-list-section">
            <h3>Archived Projects</h3>
            <ul className="project-list">
              {archivedProjects.map(project => (
                <li key={project.name}>
                  <span>{project.name}</span>
                  <div>
                    <button className="unarchive-button" onClick={() => unarchiveProject(project.name)}>Unarchive</button>
                    <button className="delete-button-less-prominent" onClick={() => deleteProject(project.name)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
 
 export default ProjectManagementPage;