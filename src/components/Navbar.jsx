import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js'; // Import the useAuth hook

function Navbar() {
  const { isAuthenticated, logout } = useAuth(); // Get auth state and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Call the logout function from context
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className="navbar">
      <h2>Veritas</h2>
      <ul>
        <li>
          <NavLink to="/" className="glass-link" activeClassName="active" exact>
            Home
          </NavLink>
        </li>
        {isAuthenticated ? (
          // Show these links if the user IS authenticated
          <>
            <li>
              <NavLink to="/validate" className="glass-link" activeClassName="active">
                Validate
              </NavLink>
            </li>
            <li>
              <NavLink to="/upload" className="glass-link" activeClassName="active">
                Upload
              </NavLink>
            </li>
            
            <li>
              <button onClick={handleLogout} className="glass-link">
                Logout
              </button>
            </li>
          </>
        ) : (
          // Show these links if the user IS NOT authenticated
          <>
            <li>
              <NavLink to="/login" className="glass-link" activeClassName="active">
                Login
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className="glass-link" activeClassName="active">
                Register
              </NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;

