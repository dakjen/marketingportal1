import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

// UNIQUE_TEST_STRING_PROJECT_CONTEXT_INCLUSION
export const ProjectContext = createContext(null);

export const ProjectProvider = ({ children, reloadUser }) => {
  const { currentUser } = useContext(AuthContext);

  // Minimal state and effect to ensure it's not empty
  const [testState, setTestState] = useState('initial');
  useEffect(() => {
    console.log('ProjectProvider mounted and testState is:', testState);
  }, [testState]);

  return (
    <ProjectContext.Provider value={{
      testState,
      setTestState
    }}>
      {children}
    </ProjectContext.Provider>
  );
};