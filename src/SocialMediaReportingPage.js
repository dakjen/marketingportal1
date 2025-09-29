import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './SocialMediaReportingPage.css';

function SocialMediaReportingPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [uploads, setUploads] = useState([]);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);

  // Placeholder for fetching uploads
  useEffect(() => {
    if (activeProject) {
      // TODO: Fetch uploads for the active project
      setUploads([
        { id: 1, name: 'Social Media Report Q1.csv', uploader: 'dakota', date: '2025-09-29' },
        { id: 2, name: 'Instagram Campaign Analysis.csv', uploader: 'jennifer', date: '2025-09-28' },
      ]);
    }
  }, [activeProject]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !fileName) {
      alert('Please provide a file and a name.');
      return;
    }
    // TODO: Implement file upload logic
    alert(`Uploading ${fileName}...`);
  };

  return (
    <div className="social-media-reporting-page-container">
      <div className="upload-section">
        <h3>Upload Analytics Data</h3>
        <form onSubmit={handleUpload}>
          <div>
            <label htmlFor="fileName">File Name:</label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="file-upload">CSV File:</label>
            <input
              type="file"
              id="file-upload"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
          </div>
          <button type="submit">Upload</button>
        </form>
      </div>
      <div className="list-section">
        <h3>Uploaded Files</h3>
        {uploads.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Uploader</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>{upload.name}</td>
                  <td>{upload.uploader}</td>
                  <td>{upload.date}</td>
                  <td>
                    <button>View</button>
                    {currentUser && currentUser.role !== 'internal' && (
                      <button>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No files uploaded yet.</p>
        )}
      </div>
    </div>
  );
}

export default SocialMediaReportingPage;