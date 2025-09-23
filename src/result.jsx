import React from "react";
import { useLocation } from "react-router-dom";

function Result() {
  const location = useLocation();
  const { isValid } = location.state || {};

  return (
    <div className="result">
      <h2>Validation Result</h2>
      {isValid ? (
        <p className="valid">✅ Document is Authentic!</p>
      ) : (
        <p className="invalid">❌ Document is Fake!</p>
      )}
    </div>
  );
}

export default Result;
