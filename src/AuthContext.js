import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check login status on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const userToSet = {
        ...data.user,
        allowedProjects: data.user.allowedProjects || []
      };
      setIsLoggedIn(true);
      setCurrentUser(userToSet);
      localStorage.setItem('currentUser', JSON.stringify(userToSet)); // Store user in localStorage
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const updateCurrentUser = async (updatedData) => {
    try {
      const response = await fetch(`/api/users/${updatedData.oldUsername}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({ 
          username: updatedData.username, 
          name: updatedData.name, 
          email: updatedData.email, 
          role: updatedData.role, 
          allowedProjects: updatedData.allowedProjects 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      const data = await response.json();
      setCurrentUser(data.user);
      return true;
    } catch (error) {
      console.error('Error updating current user:', error);
      return false;
    }
  };

const updateUserPermissions = async (username, newAllowedProjects) => {
    try {
      const response = await fetch(`/api/users/${username}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({ allowedProjects: newAllowedProjects }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user permissions');
      }

      const data = await response.json();
      // If the current user's permissions were changed, update currentUser state
      if (currentUser && currentUser.username === username) {
        setCurrentUser(data.user);
      }
      return true;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser'); // Remove user from localStorage
  };

  const changePassword = async (username, oldPassword, newPassword) => {
    try {
      const response = await fetch(`/api/users/${username}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || ''
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      // Password changed successfully, update currentUser state if it's their own password
      if (currentUser && currentUser.username === username) {
        // In a real app, you might re-authenticate or update a token here
        // For now, just update the state to reflect success
        setCurrentUser(prevUser => ({ ...prevUser, password: newPassword })); // Note: storing plain password in state is still not ideal
      }
      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  const reloadUser = async () => {
    if (!currentUser || !currentUser.username) return; // Cannot reload if no current user
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const updatedUser = data.users.find(u => u.username === currentUser.username);
      if (updatedUser) {
        const userToSet = {
          ...updatedUser,
          allowedProjects: updatedUser.allowedProjects || []
        };
        setCurrentUser(userToSet);
        localStorage.setItem('currentUser', JSON.stringify(userToSet));
      }
    } catch (error) {
      console.error('Error reloading user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, currentUser, isLoading, login, logout, updateCurrentUser,
     updateUserPermissions, changePassword, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
