import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ children, reloadUser }) => {
  const { currentUser } = useContext(AuthContext);

  const [allProjects, setAllProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(() => {
    const savedActiveProject = localStorage.getItem('activeProject');
    return savedActiveProject ? JSON.parse(savedActiveProject) : null;
  });

  // Fetch projects from API on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllProjects(data.projects.map(p => ({ ...p, isArchived: p.isArchived || false })));
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        // Fallback to localStorage if API fails, or handle error appropriately
        const savedProjects = localStorage.getItem('appProjects');
        if (savedProjects) {
          setAllProjects(JSON.parse(savedProjects).map(p => ({ ...p, isArchived: p.isArchived || false })));
        }
      }
    };
    fetchProjects();
  }, []); // Empty dependency array means this runs once on mount

  // Save activeProject to localStorage (still local)
  useEffect(() => {
    localStorage.setItem('activeProject', JSON.stringify(activeProject));
  }, [activeProject]);
  
      const addProject = useCallback(async (projectName) => {
        if (allProjects.some(p => p.name === projectName)) {
          alert('Project with this name already exists.');
          return false;
        }
        const newProject = { name: projectName, isArchived: false };
        try {
          const response = await fetch('/api/projects', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Role': currentUser?.role || ''
            },
            body: JSON.stringify(newProject),
          });
          console.log('Add Project Response - ok:', response.ok, 'status:', response.status);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const addedProject = await response.json();
          setAllProjects(prevAllProjects => [...prevAllProjects, addedProject]);
          setActiveProject(addedProject);
          reloadUser();
          return true;
        } catch (error) {
          console.error("Failed to add project:", error);
          alert('Failed to add project. Please try again.');
          return false;
        }
      }, [allProjects, currentUser, reloadUser]);  
    const selectProject = useCallback((projectName) => {
      const project = allProjects.find(p => p.name === projectName);
      if (project) {
        setActiveProject(project);
      } else {
        setActiveProject(null);
      }
    }, [allProjects]);
  
      const deleteProject = useCallback(async (projectName) => {
        if (window.confirm(`Are you sure you want to delete project ${projectName} and all its data?`)) {
          try {
            const encodedProjectName = encodeURIComponent(projectName);
            const response = await fetch(`/api/projects/${encodedProjectName}`, {
              method: 'DELETE',
              headers: {
                'X-User-Role': currentUser?.role || ''
              }
            });
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            setAllProjects(prevAllProjects => prevAllProjects.filter(p => p.name !== projectName));
            if (activeProject && activeProject.name === projectName) {
              setActiveProject(null);
            }
            // User permission updates will be handled by backend later
            // reloadUser(); // Temporarily removed for debugging
          } catch (error) {
            console.error("Failed to delete project:", error);
            alert('Failed to delete project. Please try again.');
          }
        }
      }, [activeProject, currentUser, allProjects]);
  const archiveProject = useCallback((projectName) => {
    setAllProjects(prevAllProjects =>
      prevAllProjects.map(p =>
        p.name === projectName ? { ...p, isArchived: true } : p
      )
    );
  }, []);

  const unarchiveProject = useCallback((projectName) => {
    setAllProjects(prevAllProjects =>
      prevAllProjects.map(p =>
        p.name === projectName ? { ...p, isArchived: false } : p
      )
    );
  }, []);
  
    const contextValue = useMemo(() => ({
      projects: (() => {
        const filteredProjects = allProjects.filter(p => {
          if (currentUser) {
            if (currentUser.role === 'admin' || currentUser.role === 'admin2') {
              return true;
            }
            if (currentUser.allowedProjects) {
              if (currentUser.allowedProjects.includes('*')) {
                return true;
              }
              return currentUser.allowedProjects.includes(p.name);
            }
          }
          return false;
        });
        return filteredProjects;
      })(),
      allProjects,
      activeProject,
      addProject,
      selectProject,
      deleteProject,
      archiveProject,
      unarchiveProject
    }), [allProjects, activeProject, currentUser, addProject, selectProject, deleteProject, archiveProject, unarchiveProject]);

    return (
      <ProjectContext.Provider value={contextValue}>
        {children}
      </ProjectContext.Provider>
    );
  };