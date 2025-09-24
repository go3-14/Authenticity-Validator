import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src="/logo.png" alt="Veritas Logo" className="logo-img" />
      </div>

      <ul className="nav-links">
        <li><NavLink to="/" className="glass-link">Home</NavLink></li>

        {isLoggedIn && (
          <>
            <li><NavLink to="/validate" className="glass-link">Validate</NavLink></li>
            <li><NavLink to="/upload" className="glass-link">Upload</NavLink></li>
            {role === "admin" && (
              <li><NavLink to="/admin" className="glass-link">Admin Panel</NavLink></li>
            )}
          </>
        )}

        {!isLoggedIn ? (
          <li><NavLink to="/login" className="glass-link">Login</NavLink></li>
        ) : (
          <li><button onClick={handleLogout} className="glass-link">Logout</button></li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
