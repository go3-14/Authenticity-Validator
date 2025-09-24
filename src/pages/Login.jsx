import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Dummy check (replace with real backend later)
    if (email === "admin@example.com" && password === "password") {
      localStorage.setItem("isLoggedIn", "true"); // ✅ save login state
      alert("✅ Login successful!");
      navigate("/validate"); // ✅ redirect to validate
    } else {
      alert("❌ Invalid credentials!");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card dark-box">
        <div className="login-avatar">🔒</div>
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
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

          <button type="submit">Login</button>
        </form>
        <p className="login-footer">
          Don’t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
