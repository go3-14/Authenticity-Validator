import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Validate() {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate backend validation
    setTimeout(() => {
      navigate("/result", { state: { isValid: true } });
    }, 1000);
  };

  return (
    <div className="validate">
      <h2>Upload Document for Validation</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button type="submit">Validate</button>
      </form>
    </div>
  );
}

export default Validate;
