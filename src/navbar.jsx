import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const status = localStorage.getItem("validated");
    if (status === "true") {
      setValidated(true);
    }
  }, []);

  const handleResultClick = (e) => {
    if (!validated) {
      e.preventDefault();
      alert("⚠️ Please validate a document first!");
    }
  };

  return (
    <nav className="navbar">
      <h2>AuthValidator</h2>
      <ul>
        <li>
          <NavLink to="/" className="glass-link">
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/validate" className="glass-link">
            Validate
          </NavLink>
        </li>
        <li>
          <NavLink to="/result" className="glass-link" onClick={handleResultClick}>
            Result
          </NavLink>
        </li>
        <li>
          <NavLink to="/login" className="glass-link">
            Login
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
