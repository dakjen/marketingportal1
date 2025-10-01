import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './SocialMediaReportingPage.css';

function SocialMediaReportingPage({ uploads, handleUpload, handleDeleteUpload }) {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [type, setType] = useState(''); // New state for type

  // The fetchUploads logic will now be managed by the parent component (ReportingPage)
  // and passed down via the `uploads` prop.

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleLocalUpload = async (e) => {
    e.preventDefault();
    if (!file || !fileName || !type) {
      alert('Please provide a file, a name, and a type.');
      return;
    }
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_name', fileName);
    formData.append('project_name', activeProject.name);
    formData.append('type', type); // Append the type

    try {
      const response = await fetch('/api/socialmedia/uploads', {
        method: 'POST',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }

      alert('File uploaded successfully!');
      setFileName('');
      setFile(null);
      setType(''); // Clear type
      // Call the prop function to update uploads in parent
      handleUpload({ id: Date.now(), file_name: fileName, type: type, uploader_username: currentUser.username, upload_date: new Date().toISOString() });
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file. Please try again.');
    }
  };

  const handleLocalDeleteUpload = async (idToDelete) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }
    try {
      const response = await fetch(`/api/socialmedia/uploads/${idToDelete}`, {
        method: 'DELETE',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete upload');
      }

      alert('Upload deleted successfully!');
      // Call the prop function to update uploads in parent
      handleDeleteUpload(idToDelete);
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert(error.message || 'Failed to delete upload. Please try again.');
    }
  };

  return (
    <div className="social-media-reporting-page-container">
      <div className="upload-section">
        <h3>Upload Analytics Data</h3>
        <form onSubmit={handleLocalUpload}>
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
          <div>
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Google Ads">Google Ads</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Bluesky">Bluesky</option>
              <option value="Other">Other</option>
            </select>
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
                <th>Type</th>
                <th>Uploader</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>{upload.file_name}</td>
                  <td>{upload.type}</td>
                  <td>{upload.uploader_username}</td>
                  <td>{new Date(upload.upload_date).toLocaleDateString()}</td>
                  <td>
                    <button>View</button>
                    {currentUser && currentUser.role !== 'internal' && currentUser.role !== 'view-only' && (
                      <button onClick={() => handleLocalDeleteUpload(upload.id)}>Delete</button>
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