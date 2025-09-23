import React, { useState } from "react";

function Validate() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleValidate = () => {
    if (!file) {
      alert("⚠️ Please upload a document first!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("validated", "true");
      setLoading(false);
      alert("✅ Document validated successfully!");
    }, 2000);
  };

  return (
    <div className="validate-page">
      <div className="validate-card dark-box">
        <div className="validate-avatar">📄</div>
        <h2>Upload Document for Validation</h2>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleValidate} disabled={loading}>
          {loading ? "Validating..." : "Validate"}
        </button>
      </div>
    </div>
  );
}

export default Validate;
