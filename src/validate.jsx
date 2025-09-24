import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

function Validate() {
  const [file, setFile] = useState(null);
  const [validated, setValidated] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a certificate!");
      return;
    }
    // fake validation success
    setValidated(true);
  };

  return (
    <div className="validate-page">
      <div className="validate-card">
        <div className="validate-avatar">📄</div>
        <h2>Validate Certificate</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept=".pdf,.png,.jpg"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button type="submit">Validate</button>
        </form>

        {validated && (
          <div className="upload-option">
            <p>Do you want to upload this certificate?</p>
            <button onClick={() => navigate("/upload")}>Yes, Upload</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Validate;
