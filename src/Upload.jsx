import React from "react";
import "../index.css";

function Upload() {
  return (
    <div className="validate-page">
      <div className="validate-card">
        <div className="validate-avatar">📤</div>
        <h2>Upload Certificate</h2>
        <form>
          <input type="file" accept=".pdf,.png,.jpg" />
          <button type="submit">Upload</button>
        </form>
      </div>
    </div>
  );
}

export default Upload;
