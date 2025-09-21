import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    return savedLoginState === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'appUsers') {
        // Reload the current user from the updated appUsers
        const storedUsers = JSON.parse(event.newValue) || [];
        if (currentUser) {
          const updatedCurrentUser = storedUsers.find(user => user.username === currentUser.username);
          if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('appUsers');
    if (!storedUsers) {
      const defaultUsers = [
        {
          username: 'dakotahj',
          password: 'password',
          role: 'admin', // or 'user', depending on your needs
          name: 'Dakotah J',
          email: 'dakotahj@example.com',
          allowedProjects: ['Project A', 'Project B']
        },
      ];
      localStorage.setItem('appUsers', JSON.stringify(defaultUsers));
    }
  }, []);

  const login = (username, password) => {
    const storedUsers = JSON.parse(localStorage.getItem('appUsers')) || [];
    const foundUser = storedUsers.find(user => user.username === username && user.password === password);

    if (foundUser) {
      setIsLoggedIn(true);
      setCurrentUser({ username: foundUser.username, role: foundUser.role, name: foundUser.name, email
     : foundUser.email, allowedProjects: foundUser.allowedProjects }); // Store username, role, name, and email
      return true;
    }
      return false;
  };

  const updateCurrentUser = (updatedData) => {
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...updatedData
    }));

    // Also update the user in appUsers in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('appUsers')) || [];
    const updatedAppUsers = storedUsers.map(user =>
      user.username === updatedData.oldUsername // Use oldUsername to find the user
        ? { ...user, username: updatedData.username, password: updatedData.password, name: updatedData.
     name, email: updatedData.email, role: updatedData.role, allowedProjects: updatedData.allowedProjects
     }
        : user
    );
    localStorage.setItem('appUsers', JSON.stringify(updatedAppUsers));
  };

const updateUserPermissions = (username, newAllowedProjects) => {
        const storedUsers = JSON.parse(localStorage.getItem('appUsers')) || [];
     const updatedUsers = storedUsers.map(user =>
        user.username === username
          ? { ...user, allowedProjects: newAllowedProjects }
         : user
     );
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));

      if (currentUser && currentUser.username === username) {
        setCurrentUser(prevUser => ({
          ...prevUser,
          allowedProjects: newAllowedProjects
        }));
      }
     };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
  };

  const reloadUser = () => {
    const savedUser = localStorage.getItem('currentUser');
    setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, login, logout, updateCurrentUser,
     updateUserPermissions, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
