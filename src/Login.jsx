import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://127.0.0.1:8000/login/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password: password,
      }),
    });

    if (response.ok) {
      alert("Login successful!");
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("role", role);
      navigate("/");
    } else {
      alert("Invalid credentials!");
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

          {/* Role Selection */}
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

        <div className="login-footer">
          No account? Just <a href="/register">register here</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
