import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Main component for the validation page
export default function Validate() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationType, setValidationType] = useState(null); // 'digital' or 'nonDigital'
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
  };

  const handleVerifyClick = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    const controller = new AbortController();
    // Increased timeout to 2 minutes to handle slow CPU processing
    const timeoutId = setTimeout(() => controller.abort(), 120000); 

    try {
      const endpoint = validationType === 'digital' 
        ? 'http://127.0.0.1:5000/api/verify' // ocr.py
        : 'http://127.0.0.1:5001/api/verify'; // non_ocr.py

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
        throw new Error(errorData.detail || `Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      navigate('/result', { state: { verificationResult: data } });

    } catch (err) {
      clearTimeout(timeoutId);
      console.error("API call failed:", err);
      
      let errorMessage = 'Verification failed. Please check the server or try again.';
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. The server is taking too long to respond.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      navigate('/result', { 
        state: { 
          verificationResult: { 
            is_verified: false, 
            error: errorMessage, 
            filename: selectedFile.name 
          } 
        } 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderSelection = () => (
    <>
        <h2>Select Document Type</h2>
        <p className="text-gray-600 text-sm mb-4">
            How would you like to provide the certificate for validation?
        </p>
        <div className="validation-options">
            <div className="validation-option-card" onClick={() => setValidationType('digital')}>
                <div className="option-icon">📁</div>
                <h3>Digital Document</h3>
                <p>Upload a PDF file directly from your device.</p>
            </div>
            <div className="validation-option-card" onClick={() => setValidationType('nonDigital')}>
                <div className="option-icon">📷</div>
                <h3>Non-Digital Document</h3>
                <p>Use your camera or upload an image of a physical certificate.</p>
            </div>
        </div>
    </>
  );

  const renderUploader = () => (
    <>
        <h2>{validationType === 'digital' ? 'Digital' : 'Non-Digital'} Verification</h2>
        <p className="text-gray-600 text-sm mb-4">
            Upload a certificate to verify its authenticity.
        </p>
        
        {/* Standard file input */}
        <label className="file-input-label">
            Choose from folder
            <input 
              type="file" 
              accept={validationType === 'digital' ? ".pdf" : ".pdf,.png,.jpg,.jpeg"}
              onChange={handleFileChange} 
            />
        </label>

        {/* Camera input for non-digital */}
        {validationType === 'nonDigital' && (
            <>
                <p className="or-divider">OR</p>
                <label className="file-input-label camera">
                    <span role="img" aria-label="camera">📷</span> Use Camera
                    <input 
                      type="file" 
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange} 
                    />
                </label>
            </>
        )}

        {selectedFile && <p className="file-name">Selected: {selectedFile.name}</p>}
        
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p className="loading-text">
                Analyzing document...<br/>
                This can take up to two minutes for complex files.
            </p>
          </div>
        ) : (
          <button 
            onClick={handleVerifyClick} 
            disabled={!selectedFile}
          >
            Verify Certificate
          </button>
        )}
        
        <button onClick={() => setValidationType(null)} className="back-btn">← Choose a different type</button>
    </>
  );

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
          
          {validationType ? renderUploader() : renderSelection()}
          
          {error && <p className="error-message mt-4 text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}

