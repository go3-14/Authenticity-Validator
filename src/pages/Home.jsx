import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleStartValidation = () => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
      navigate("/validate"); 
    } else {
      alert("⚠️ Please login before starting validation.");
      navigate("/login"); 
    }
  };

  return (
    <section className="hero">
      <h1>🔒 Authenticity Validator</h1>
      <p>
        Verify the authenticity of certificates and documents with ease, speed,
        and reliability.
      </p>
      <button onClick={handleStartValidation}>Start Validation</button>
    </section>
  );
}

export default Home;
