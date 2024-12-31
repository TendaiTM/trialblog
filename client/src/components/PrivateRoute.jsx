import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login page if no token is found
    return <Navigate to="/" />;
  }

  return children; // Render children (Homepage) if the user is authenticated
};

export default PrivateRoute;
