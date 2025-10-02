import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentUser, isLoading } = useContext(AuthContext);
  if (isLoading) { return <div>Loading...</div>; }
  if (!isLoggedIn) { return <Navigate to="/intro" />; }
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) { return <Navigate to="/" />; }
  return children;
};

export default PrivateRoute;
