import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Result() {
  const location = useLocation();
  const { verificationResult } = location.state || {};

  // Handle case where user navigates directly without data
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
    certificate_id_found,
    database_record,
    mismatched_fields,
    error,
    signature_status,
    signature_distance
  } = verificationResult;

  // Determine overall document validity: forged signature or mismatched fields
  const overall_validity = is_verified && signature_status === 'Genuine';

  return (
    <div className="result-page">
      <div className="result-card">
        {/* Overall status */}
        <div className={`result-status ${overall_validity ? 'valid' : 'invalid'}`}>
          {overall_validity ? '✅' : '❌'}
        </div>

        <h2 className="result-title">Validation Result</h2>
        
        <p className={`result-summary ${overall_validity ? 'valid-text' : 'invalid-text'}`}>
          {overall_validity ? 'Document is Authentic!' : 'Document is Not Authentic!'}
        </p>

        <div className="result-details">
          <p><strong>File Name:</strong> {filename}</p>
          <p><strong>Certificate ID Found:</strong> {certificate_id_found || 'None'}</p>
        </div>

        {/* Signature Verification */}
        {signature_status && (
          <div className={`signature-status ${signature_status === 'Genuine' ? 'genuine' : signature_status === 'Forged' ? 'forged' : 'missing'}`}>
            <p><strong>Signature Verification:</strong></p>
            <p>Status: {signature_status}</p>
            {signature_distance !== null && <p>Distance: {signature_distance.toFixed(4)}</p>}
          </div>
        )}

        {/* Verification issues if any */}
        {!overall_validity && (
          <div className="result-issues">
            {error && <p>- {error}</p>}
            {mismatched_fields && mismatched_fields.length > 0 && (
              <p>- The following fields did not match the database record: <strong>{mismatched_fields.join(', ')}</strong>.</p>
            )}
          </div>
        )}

        {/* Student details if fully verified */}
        {overall_validity && database_record && (
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
