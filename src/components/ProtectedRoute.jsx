import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js'; // Import the useAuth hook

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // Get the authentication state from the context

  // If the user is authenticated, render the child route (the protected page).
  // The <Outlet> component from react-router-dom does this.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If the user is not authenticated, redirect them to the login page.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;

