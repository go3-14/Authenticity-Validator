import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Main component for the validation page
export default function Validate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  const handleVerifyClick = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file first.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

    try {
      const response = await fetch('http://127.0.0.1:5000/api/verify', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Navigate to the Result page with the API data
      navigate('/result', { state: { verificationResult: data } });

    } catch (err) {
      clearTimeout(timeoutId);
      console.error("API call failed:", err);

      if (err.name === 'AbortError') {
        setError('Request timed out. The server is taking too long to respond.');
      } else {
        setError('Verification failed. Please check the server or try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="validate-page">
      <div className="py-8">
        <div className="validate-card">
          <div className="validate-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.5 1.5A1.5 1.5 0 0 0 7 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5a1.5 1.5 0 0 0-3 0V14a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V2a.5.5 0 0 1 .5-.5h5A.5.5 0 0 1 8 .5z"/>
              <path d="m10.854.146 3.353 3.354a.5.5 0 0 1 0 .708l-8 8a.5.5 0 0 1-.708 0l-3.353-3.354a.5.5 0 1 1 .708-.708L8 10.293l7.146-7.147a.5.5 0 0 1 .708 0z"/>
            </svg>
          </div>

          <h2>Certificate Verification</h2>
          <p className="text-gray-300 text-sm mb-4">
            Upload a PDF certificate to verify its authenticity.
          </p>
          
          <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange} 
          />

          <button 
            onClick={handleVerifyClick} 
            disabled={isLoading || !selectedFile}
          >
            {isLoading ? <div className="spinner"></div> : 'Verify Certificate'}
          </button>
          
          {error && <p className="error-message mt-4 text-yellow-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}

