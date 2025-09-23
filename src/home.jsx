import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <h1>Welcome to AuthValidator</h1>
      <p>Verify authenticity of certificates and documents with ease.</p>
      <Link to="/validate">
        <button>Start Validation</button>
      </Link>
    </div>
  );
}

export default Home;
