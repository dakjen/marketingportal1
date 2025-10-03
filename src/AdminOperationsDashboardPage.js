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
  const [selectedImportantFile, setSelectedImportantFile] = useState(null);
  const [uploadedImportantFiles, setUploadedImportantFiles] = useState([]);
  const [importantLinks, setImportantLinks] = useState([]);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (activeProject) {
      setProjectName(activeProject.name);
      fetch(`/api/operations-data?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => {
          setProjectDescription(data.project_description || '');
          setImportantDetails(data.important_details || '');
          setImportantLinks(data.important_links || []); // Fetch important links
        })
        .catch(err => console.error("Error fetching operations data:", err));

      // Fetch uploaded quotes for the active project
      fetch(`/api/quotes-documents?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => setUploadedQuotes(data.documents || []))
        .catch(err => console.error("Error fetching quotes documents:", err));

      // Fetch uploaded important files for the active project
      fetch(`/api/important-files-documents?project_name=${activeProject.name}`)
        .then(res => res.json())
        .then(data => setUploadedImportantFiles(data.documents || []))
        .catch(err => console.error("Error fetching important files documents:", err));
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

  const handleImportantFileChange = (event) => {
    setSelectedImportantFile(event.target.files[0]);
  };

  const handleImportantFileUpload = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    if (!selectedImportantFile) {
      alert('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedImportantFile);
    formData.append('project_name', activeProject.name);
    formData.append('file_name', selectedImportantFile.name);
    formData.append('type', selectedImportantFile.type);

    try {
      const response = await fetch('/api/important-files-documents', {
        method: 'POST',
        headers: {
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload important file');
      }

      const uploadedDoc = await response.json();
      setUploadedImportantFiles(prevDocs => [...prevDocs, uploadedDoc]);
      setSelectedImportantFile(null);
      alert('Important file uploaded successfully!');
    } catch (error) {
      console.error('Error uploading important file:', error);
      alert(`Error uploading important file: ${error.message}. Please try again.`);
    }
  };

  const handleImportantFileDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this important file?')) {
      return;
    }

    try {
      const response = await fetch(`/api/important-files-documents/${id}`,
        {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser.role,
          },
        });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete important file');
      }

      setUploadedImportantFiles(prevDocs => prevDocs.filter(doc => doc.id !== id));
      alert('Important file deleted successfully!');
    } catch (error) {
      console.error('Error deleting important file:', error);
      alert(`Error deleting important file: ${error.message}. Please try again.`);
    }
  };

  const handleSaveImportantLinks = async () => {
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }

    try {
      const response = await fetch('/api/operations-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({
          project_name: activeProject.name,
          important_links: importantLinks,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save important links');
      }

      alert('Important links saved successfully!');
    } catch (error) {
      console.error('Error saving important links:', error);
      alert(`Error saving important links: ${error.message}. Please try again.`);
    }
  };

  const handleAddLink = () => {
    if (newLinkName && newLinkUrl) {
      setImportantLinks([...importantLinks, { name: newLinkName, url: newLinkUrl }]);
      setNewLinkName('');
      setNewLinkUrl('');
    } else {
      alert('Please enter both link name and URL.');
    }
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = importantLinks.filter((_, i) => i !== index);
    setImportantLinks(updatedLinks);
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
          <h3>Important Files Uploads</h3>
          <div className="important-file-upload-section">
            <input type="file" onChange={handleImportantFileChange} />
            <button onClick={handleImportantFileUpload} disabled={!selectedImportantFile}>Upload File</button>
          </div>
          <div className="uploaded-important-files-list">
            <h4>Uploaded Files:</h4>
            {uploadedImportantFiles.length === 0 ? (
              <p>No important files uploaded yet.</p>
            ) : (
              <ul className="file-list">
                {uploadedImportantFiles.map((doc) => (
                  <li key={doc.id} className="file-list-item">
                    <a href={`/api/important-files-documents/download?file_path=${encodeURIComponent(doc.file_path)}`} target="_blank" rel="noopener noreferrer">{doc.file_name}</a>
                    <button onClick={() => handleImportantFileDelete(doc.id)} className="delete-button">Delete</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="important-links-section">
            <h3>Important Links</h3>
            {importantLinks.map((link, index) => (
              <div key={index} className="link-item">
                <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
                <button onClick={() => handleRemoveLink(index)}>Remove</button>
              </div>
            ))}
            <div className="add-link-form">
              <input
                type="text"
                placeholder="Link Name"
                value={newLinkName}
                onChange={(e) => setNewLinkName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Link URL"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <button onClick={handleAddLink}>Add Link</button>
            </div>
            <button onClick={handleSaveImportantLinks}>Save Important Links</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOperationsDashboardPage;