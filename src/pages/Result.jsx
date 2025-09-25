import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Result() {
  const location = useLocation();
  // Get the verificationResult from the state passed during navigation
  const { verificationResult } = location.state || {};

  // Handle case where user navigates to this page directly without data
  if (!verificationResult) {
    return (
      <div className="result">
        <h2>No Result Found</h2>
        <p>Please go back and validate a certificate first.</p>
        <Link to="/validate">
          <button style={{ marginTop: '1rem' }}>Go to Validator</button>
        </Link>
      </div>
    );
  }

  const { is_verified, filename, rollno_found, database_record } = verificationResult;

  return (
    <div className="result">
      <h2 className="text-2xl font-bold mb-4">Validation Result</h2>
      
      <p className={is_verified ? 'valid' : 'invalid'}>
        {is_verified ? '✅ Document is Authentic!' : '❌ Document Could Not Be Verified!'}
      </p>

      <div className="mt-4 pt-4 border-t text-left">
        <p><strong>File Name:</strong> {filename}</p>
        <p><strong>Roll Number Found:</strong> {rollno_found || 'None'}</p>
      </div>
      
      {is_verified && database_record && (
        <div className="verified-details mt-4 pt-4 border-t text-left">
          <h4 className="text-xl font-semibold mt-4 mb-2">Student Details from Record:</h4>
          <p><strong>Name:</strong> {database_record.name}</p>
          <p><strong>College:</strong> {database_record.college}</p>
          <p><strong>Branch:</strong> {database_record.branch}</p>
          <p><strong>Year of Passing:</strong> {database_record.year_of_passing}</p>
          <p><strong>CGPA:</strong> {database_record.cgpa}</p>
          <p><strong>Date of Issue:</strong> {database_record.date_of_issue}</p>
        </div>
      )}

      <Link to="/validate">
        <button style={{ marginTop: '2rem' }}>Verify Another Document</button>
      </Link>
    </div>
  );
}
