import React, { createContext, useState, useEffect, useContext } from 'react';
    import { AuthContext } from './AuthContext';
    
    // UNIQUE_TEST_STRING_PROJECT_CONTEXT_INCLUSION
    export const ProjectContext = createContext(null);
    
    export const ProjectProvider = ({ children, reloadUser }) => {
      const { currentUser } = useContext(AuthContext);
    
      const [allProjects, setAllProjects] = useState(() => {
      console.log('ProjectContext: Initializing allProjects state...');
      const savedProjects = localStorage.getItem('appProjects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        console.log('ProjectContext: Found saved projects:', parsedProjects);
        return parsedProjects.map(p => ({ ...p, isArchived: p.isArchived || false }));
      }
      console.log('ProjectContext: No saved projects found.');
      return [];
    });
    const [activeProject, setActiveProject] = useState(() => {
      const savedActiveProject = localStorage.getItem('activeProject');
      return savedActiveProject ? JSON.parse(savedActiveProject) : null;
    });
  
    useEffect(() => {
      console.log('ProjectContext: allProjects state changed, saving to localStorage:', allProjects);
      localStorage.setItem('appProjects', JSON.stringify(allProjects));
    }, [allProjects]);
  
    const addProject = (projectName) => {
      if (allProjects.some(p => p.name === projectName)) {
        alert('Project with this name already exists.');
        return false;
      }
      console.log('ProjectContext: Adding new project:', projectName);
      const newProject = { name: projectName, isArchived: false };
      setAllProjects(prevAllProjects => {
        const updated = [...prevAllProjects, newProject];
        console.log('ProjectContext: allProjects after add:', updated);
        return updated;
      });
      setActiveProject(newProject);

      // Grant permission to all admin users
      const storedUsers = JSON.parse(localStorage.getItem('appUsers')) || [];
      const updatedUsers = storedUsers.map(user => {
        if (user.role === 'admin') {
          // Add the new project to the admin's allowedProjects
          // if it's not already there and they don't have wildcard access.
          if (!user.allowedProjects.includes(projectName) && !user.allowedProjects.includes('*')) {
            return {
              ...user,
              allowedProjects: [...user.allowedProjects, projectName]
            };
          }
        }
        return user;
      });
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));

      // Update currentUser in localStorage if the current user is an admin
      const currentUserFromStorage = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUserFromStorage && currentUserFromStorage.role === 'admin') {
        const updatedCurrentUser = updatedUsers.find(user => user.username === currentUserFromStorage.username);
        if (updatedCurrentUser) {
          localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
        }
      }

      // reloadUser(); // Temporarily removed for debugging
      return true;
    };
  
    const selectProject = (projectName) => {
      const project = allProjects.find(p => p.name === projectName);
      if (project) {
        setActiveProject(project);
      } else {
        setActiveProject(null);
      }
    };
  
    const deleteProject = (projectName) => {
      console.log('deleteProject function called for project:', projectName);
      if (window.confirm(`Are you sure you want to delete project ${projectName} and all its data?`)) {
        console.log('Deleting project:', projectName);
        console.log('prevAllProjects:', allProjects);
        setAllProjects(prevAllProjects => {
          const newAllProjects = prevAllProjects.filter(p => p.name !== projectName);
          console.log('newAllProjects after filter:', newAllProjects);
          return newAllProjects;
        });
        // reloadUser(); // Temporarily removed for debugging
        console.log('currentUser after reloadUser:', currentUser);

        // alert(`Project ${projectName} and its data have been deleted.`);
      }
    };

  const archiveProject = (projectName) => {
    setAllProjects(prevAllProjects =>
      prevAllProjects.map(p =>
        p.name === projectName ? { ...p, isArchived: true } : p
      )
    );
  };

  const unarchiveProject = (projectName) => {
    setAllProjects(prevAllProjects =>
      prevAllProjects.map(p =>
        p.name === projectName ? { ...p, isArchived: false } : p
      )
    );
  };
  
    return (
      <ProjectContext.Provider value={{
        projects: allProjects.filter(p => {
          if (currentUser && currentUser.allowedProjects) {
            if (currentUser.allowedProjects.includes('*')) {
              return true;
            }
            return currentUser.allowedProjects.includes(p.name);
          }
          return false;
        }),
        allProjects,
        activeProject,
        addProject,
        selectProject,
        deleteProject,
        archiveProject,
        unarchiveProject
      }}>
        {children}
      </ProjectContext.Provider>
    );
  };