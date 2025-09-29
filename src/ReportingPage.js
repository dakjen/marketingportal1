import './ReportingPage.css';

import React, { useState } from 'react';
import './ReportingPage.css';
import ReportingSidebar from './ReportingSidebar'; // New import

function ReportingPage() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first!');
      return;
    }
    // Implement file upload logic here
    console.log('Uploading file:', selectedFile.name);
    alert('File upload initiated for: ' + selectedFile.name);
    // You would typically send this file to a backend API
  };

  return (
    <div className="reporting-page-wrapper"> {/* New wrapper for sidebar and content */}
      <ReportingSidebar /> {/* Reporting page's dedicated sidebar */}
      <div className="reporting-main-content">
        <h2>Reporting Page</h2>
        <p>This is the Reporting page content.</p>

        <div className="upload-section">
          <h3>Upload Analytics Data</h3>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!selectedFile}>Upload</button>
        </div>
      </div>
    </div>
  );
}

export default ReportingPage;