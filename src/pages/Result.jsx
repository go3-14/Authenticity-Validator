import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Result() {
  const location = useLocation();
  const { verificationResult } = location.state || {};

  // Handle case where user navigates to this page directly without data
  if (!verificationResult) {
    return (
      <div className="result-page">
        <div className="result-card">
            <h2>No Result Found</h2>
            <p>Please go back and validate a certificate first.</p>
            <Link to="/validate">
              <button style={{ marginTop: '1rem' }}>Go to Validator</button>
            </Link>
        </div>
      </div>
    );
  }

  const { 
    is_verified, 
    filename, 
    rollno_found, 
    certificate_id_found,
    database_record,
    mismatched_fields,
    error
  } = verificationResult;

  const identifier_type = rollno_found ? "Roll Number" : "Certificate ID";
  const identifier_value = rollno_found || certificate_id_found || 'None';

  return (
    <div className="result-page">
      <div className="result-card">
        <div className={`result-status ${is_verified ? 'valid' : 'invalid'}`}>
            {is_verified ? '✅' : '❌'}
        </div>

        <h2 className="result-title">Validation Result</h2>
        
        <p className={`result-summary ${is_verified ? 'valid-text' : 'invalid-text'}`}>
          {is_verified ? 'Document is Authentic!' : 'Document Could Not Be Verified!'}
        </p>

        <div className="result-details">
          <p><strong>File Name:</strong> {filename}</p>
          <p><strong>{identifier_type} Found:</strong> {identifier_value}</p>
        </div>
        
        {/* If verification failed, show the specific issues */}
        {!is_verified && (
          <div className="result-issues">
             <h4>Verification Issues:</h4>
             {/* Display the primary error message from the backend */}
             {error && <p>- {error}</p>}
             
             {/* If there are mismatched fields, list them clearly */}
             {mismatched_fields && mismatched_fields.length > 0 && (
               <p>- The following fields on the document did not match the database record: <strong>{mismatched_fields.join(', ')}</strong>.</p>
             )}
          </div>
        )}

        {/* If verification succeeded, show the full record */}
        {is_verified && database_record && (
          <div className="result-record">
            <h4>Student Details from Record:</h4>
            <p><strong>Name:</strong> {database_record.name}</p>
            <p><strong>College:</strong> {database_record.college}</p>
            <p><strong>Branch:</strong> {database_record.branch}</p>
            <p><strong>Year of Passing:</strong> {database_record.year_of_passing}</p>
            <p><strong>CGPA:</strong> {database_record.cgpa}</p>
            <p><strong>Date of Issue:</strong> {database_record.date_of_issue}</p>
          </div>
        )}

        <Link to="/validate">
          <button className="result-button">Verify Another Document</button>
        </Link>
      </div>
    </div>
  );
}

