import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './PhysicalMarketingReportingPage.css';

function PhysicalMarketingReportingPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [uploads, setUploads] = useState([]);
  const [fileName, setFileName] = useState('');
  const [file, setFile] = useState(null);
  const [type, setType] = useState(''); // New state for type

  const fetchUploads = async () => {
    if (!activeProject) {
      setUploads([]);
      return;
    }
    try {
      const response = await fetch(`/api/physicalmarketing/uploads?project_name=${activeProject.name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUploads(data.uploads);
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
      alert('Failed to load uploads. Please try again.');
    }
  };

  useEffect(() => {
    fetchUploads();
  }, [activeProject]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
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
      const response = await fetch('/api/physicalmarketing/uploads', {
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
      fetchUploads(); // Re-fetch uploads to update the list
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(error.message || 'Failed to upload file. Please try again.');
    }
  };

  const handleDeleteUpload = async (idToDelete) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }
    try {
      const response = await fetch(`/api/physicalmarketing/uploads/${idToDelete}`, {
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
      fetchUploads(); // Re-fetch uploads to update the list
    } catch (error) {
      console.error('Error deleting upload:', error);
      alert(error.message || 'Failed to delete upload. Please try again.');
    }
  };

  return (
    <div className="physical-marketing-reporting-page-container">
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
          <div>
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value="">Select Type</option>
              <option value="Billboards">Billboards</option>
              <option value="Podcasts">Podcasts</option>
              <option value="Radio Ads">Radio Ads</option>
              <option value="Newspaper">Newspaper</option>
              <option value="Jobsite banners">Jobsite banners</option>
              <option value="Printed collateral">Printed collateral</option>
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
                      <button onClick={() => handleDeleteUpload(upload.id)}>Delete</button>
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

export default PhysicalMarketingReportingPage;