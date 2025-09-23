import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <h2>AuthValidator</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/validate">Validate</Link></li>
        <li><Link to="/result">Result</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
