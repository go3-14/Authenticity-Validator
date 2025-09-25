import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from the context

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Use the login function from context to update global state
        login(data.access_token);
        navigate("/validate"); // Redirect to a protected page
      } else {
        const errorData = await response.json().catch(() => null);
        setError(errorData?.detail || "Invalid credentials!");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Login failed. The server might be offline.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-avatar">
          {role === "user" ? "👤" : "🛡️"}
        </div>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
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
          <button type="submit">Login</button>
        </form>
        {error && <p style={{ color: '#ffeb3b', marginTop: '1rem' }}>{error}</p>}
        <div className="login-footer">
          No account? Just <a href="/register">register here</a>
        </div>
      </div>
    </div>
  );
}

export default Login;

