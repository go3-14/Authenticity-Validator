import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from the context

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!fullName || !email || !password || !confirmPassword) {
      setError("⚠️ Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("⚠️ Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/register/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          fullName: fullName,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        // Auto-login by saving the token returned from the server
        const data = await response.json();
        login(data.access_token); // Use the context to log the user in
        
        // Redirect to a protected page
        navigate("/validate");

      } else {
        const errorData = await response.json();
        setError(`⚠️ ${errorData.detail || 'Registration failed.'}`);
      }

    } catch (err) {
      console.error("Registration failed:", err);
      setError("⚠️ Registration failed. The server may be offline.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          {role === "user" ? "👤" : "🛡️"}
        </div>
        <h2>Create Account</h2>
        {error && <p style={{ color: "orange", fontSize: "0.9rem" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* Role toggle buttons with icons */}
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${role === "user" ? "active" : ""}`}
              onClick={() => setRole("user")}
            > 
              👤 User
            </button>
            <button
              type="button"
              className={`role-btn ${role === "admin" ? "active" : ""}`}
              onClick={() => setRole("admin")}
            >
              🛡️ Admin
            </button>
          </div>

          <button type="submit">Register</button>
        </form>

        <div className="login-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

