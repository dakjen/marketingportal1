import React from 'react';
import './MonthlyReportsPage.css';

function MonthlyReportsPage({ uploadedFiles, handleFileUpload, handleFileDelete }) {
  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="monthly-reports-page-container">
      <h2>Monthly Reports Upload</h2>
      <div className="upload-section">
        <label htmlFor="file-upload" className="file-upload-label">
          Choose Report to Upload
        </label>
        <input 
          id="file-upload" 
          type="file" 
          onChange={onFileChange} 
          className="file-upload-input"
        />
      </div>
      <div className="file-list-container">
        <h3>Uploaded Reports</h3>
        {uploadedFiles.length > 0 ? (
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="file-list-item">
                <span>{file.name}</span>
                <button onClick={() => handleFileDelete(file.name)} className="delete-button">
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reports uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default MonthlyReportsPage;
