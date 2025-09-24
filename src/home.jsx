import React from "react";
import { useNavigate } from "react-router-dom";
import Features from "../components/Features";

function Home() {
  const navigate = useNavigate();

  const handleStartValidation = () => {
    const isLoggedIn = localStorage.getItem("authToken");
    if (isLoggedIn) {
      navigate("/validate");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      {/* === Hero Section === */}
      <section className="hero">
        <h1>🔒 Authenticity Validator</h1>
        <p>
          Verify the authenticity of certificates and documents with ease,
          speed, and reliability.
        </p>
        <button onClick={handleStartValidation}>Start Validation</button>
      </section>

      {/* === Widgets Section (Features) === */}
      <Features />
    </>
  );
}

export default Home;
