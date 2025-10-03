import React, { useState, useEffect, useContext } from 'react';
import { ProjectContext } from './ProjectContext';
import { AuthContext } from './AuthContext'; // Import AuthContext
import './AdminOperationsDashboardPage.css';

function AdminOperationsDashboardPage() {
  const { activeProject } = useContext(ProjectContext);
  const { currentUser } = useContext(AuthContext); // Get currentUser from AuthContext
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [importantDetails, setImportantDetails] = useState('');
  const [selectedQuoteFile, setSelectedQuoteFile] = useState(null);
  const [uploadedQuotes, setUploadedQuotes] = useState([]);

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setProjectDescription(data.project_description || '');
          setImportantDetails(data.important_details || '');
        })
        .catch(err => console.error("Error fetching operations data:", err));

      // Fetch uploaded quotes for the active project
      fetch(`/api/quotes-documents?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => setUploadedQuotes(data.documents || []))
        .catch(err => console.error("Error fetching quotes documents:", err));
    }
  }, [activeProject]);

  const handleQuoteFileChange = (event) => {
    setSelectedQuoteFile(event.target.files[0]);
  };

  const handleQuoteUpload = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!selectedQuoteFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedQuoteFile);
    formData.append('project_name', activeProject.name);
    formData.append('file_name', selectedQuoteFile.name);
    formData.append('type', selectedQuoteFile.type);

    try {
      const response = await fetch('/api/quotes-documents', {
        method: 'POST',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload quote document');
      }

      const uploadedDoc = await response.json();
      setUploadedQuotes(prevDocs => [...prevDocs, uploadedDoc]);
      setSelectedQuoteFile(null);
      alert('Quote document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading quote document:', error);
      alert(`Error uploading quote document: ${error.message}. Please try again.`);
    }
  };

  const handleQuoteDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quote document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/quotes-documents/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser.role,
          },
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete quote document');
      }

      setUploadedQuotes(prevDocs => prevDocs.filter(doc => doc.id !== id));
      alert('Quote document deleted successfully!');
    } catch (error) {
      console.error('Error deleting quote document:', error);
      alert(`Error deleting quote document: ${error.message}. Please try again.`);
    }
  };

  return (
    <div>
      <h2>Admin Operations Dashboard</h2>
      <div className="operations-dashboard-page-container">
        <div className="operations-dashboard-left-column">
          <h3>Quotes</h3>
          <div className="quote-upload-section">
            <input type="file" onChange={handleQuoteFileChange} />
            <button onClick={handleQuoteUpload} disabled={!selectedQuoteFile}>Upload Quote</button>
          </div>
          <div className="uploaded-quotes-list">
            <h4>Uploaded Quotes:</h4>
            {uploadedQuotes.length === 0 ? (
              <p>No quotes uploaded yet.</p>
            ) : (
              <ul className="file-list">
                {uploadedQuotes.map((doc) => (
                  <li key={doc.id} className="file-list-item">
                    <a href={`/api/quotes-documents/download?file_path=${encodeURIComponent(doc.file_path)}`} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                    <button onClick={() => handleQuoteDelete(doc.id)} className="delete-button">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="operations-dashboard-right-column">
          <h3>Important Details</h3>
          <p>{importantDetails || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminOperationsDashboardPage;