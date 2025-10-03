import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './MonthlyReportsPage.css';

function MonthlyReportsPage({ uploadedFiles, handleFileUpload, handleFileDelete }) {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext);
  const [regularDocuments, setRegularDocuments] = useState([]);
  const [newDocumentFile, setNewDocumentFile] = useState(null);

  const canUpload = currentUser?.role === 'admin' || currentUser?.role === 'internal';

  useEffect(() => {
    if (activeProject) {
      fetch(`/api/regular-documents?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => setRegularDocuments(data.documents || []))
        .catch(err => console.error("Error fetching regular documents:", err));
    }
  }, [activeProject]);

  const handleRegularDocumentUpload = async () => {
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }
    if (!newDocumentFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', newDocumentFile);
    formData.append('project_name', activeProject.name);
    formData.append('file_name', newDocumentFile.name);
    formData.append('type', newDocumentFile.type || 'application/octet-stream');

    try {
      const response = await fetch('/api/regular-documents', {
        method: 'POST',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      const uploadedDoc = await response.json();
      setRegularDocuments(prevDocs => [...prevDocs, uploadedDoc]);
      setNewDocumentFile(null);
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(`Error uploading document: ${error.message}. Please try again.`);
    }
  };

  const handleRegularDocumentDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/regular-documents/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser.role,
          },
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }

      setRegularDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Error deleting document: ${error.message}. Please try again.`);
    }
  };

  const onFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="monthly-reports-page-container">
      <div className="regular-documents-section">
        <h2>Templates</h2>
        <div className="thin-box">
          {regularDocuments.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <ul className="file-list">
              {regularDocuments.map((doc) => (
                <li key={doc.id} className="file-list-item">
                  <a href={doc.file_path} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                  {canUpload && (
                    <button onClick={() => handleRegularDocumentDelete(doc.id)} className="delete-button">
                      Delete
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          {canUpload && (
            <div className="upload-controls">
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!selectedFile}>Upload Document</button>
              <button onClick={handleRegularDocumentUpload} disabled={!newDocumentFile}>
                Upload Document
              </button>
            </div>
          )}
        </div>
      </div>

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
