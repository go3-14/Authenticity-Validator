import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import logo from './veritas.png';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false); // Close menu on logout
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="Veritas Logo" className="logo-img"/>
        <h2 className="logo-text">Veritas</h2>
      </div>
      
      {/* Hamburger Menu Button - Only visible on mobile */}
      <button className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        &#9776; {/* This is the hamburger icon */}
      </button>

      {/* Desktop Links - Hidden on mobile */}
      <ul className="desktop-links">
        <li><NavLink to="/" className="glass-link">Home</NavLink></li>
        {isAuthenticated ? (
          <>
            <li><NavLink to="/validate" className="glass-link">Validate</NavLink></li>
            <li><NavLink to="/upload" className="glass-link">Upload</NavLink></li>
            <li style={{ marginTop: '-9px' }}><button onClick={handleLogout} className="glass-link">Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to="/login" className="glass-link">Login</NavLink></li>
            <li><NavLink to="/register" className="glass-link">Register</NavLink></li>
          </>
        )}
      </ul>

      {/* Mobile Menu - Only visible when isMenuOpen is true */}
      {isMenuOpen && (
        <ul className="mobile-links">
            <li onClick={closeMenu}><NavLink to="/" className="glass-link">Home</NavLink></li>
          {isAuthenticated ? (
            <>
              <li onClick={closeMenu}><NavLink to="/validate" className="glass-link">Validate</NavLink></li>
              <li onClick={closeMenu}><NavLink to="/upload" className="glass-link">Upload</NavLink></li>
              <li style={{ marginTop: '-9px' }}><button onClick={handleLogout} className="glass-link">Logout</button></li>
            </>
          ) : (
            <>
              <li onClick={closeMenu}><NavLink to="/login" className="glass-link">Login</NavLink></li>
              <li onClick={closeMenu}><NavLink to="/register" className="glass-link">Register</NavLink></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}

export default Navbar;

