import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './SocialMediaEntries.css'; // Import the CSS file

function SocialMediaEntries() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject, projects, selectProject } = useContext(ProjectContext);

  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [notes, setNotes] = useState(''); // New state for notes

  const [entries, setEntries] = useState(() => {
    // Initialize state from localStorage
    if (!activeProject) return [];
    const savedEntries = localStorage.getItem(`${activeProject.name}_socialMediaEntries`);
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // Effect to load entries when activeProject changes
  useEffect(() => {
    if (activeProject) {
      const savedEntries = localStorage.getItem(`${activeProject.name}_socialMediaEntries`);
      setEntries(savedEntries ? JSON.parse(savedEntries) : []);
    } else {
      setEntries([]);
    }
  }, [activeProject]);

  const [editingIndex, setEditingIndex] = useState(null); // Stores the index of the entry being edited
  const [editedDate, setEditedDate] = useState('');
  const [editedCost, setEditedCost] = useState('');
  const [editedPlatform, setEditedPlatform] = useState('');
  const [editedCustomPlatform, setEditedCustomPlatform] = useState('');
  const [editedNotes, setEditedNotes] = useState('');

  // Save entries to localStorage whenever the entries state changes
  useEffect(() => {
    if (!activeProject) return;
    localStorage.setItem(`${activeProject.name}_socialMediaEntries`, JSON.stringify(entries));
  }, [entries, activeProject]);

  const handlePlatformChange = (e) => {
    const selectedPlatform = e.target.value;
    setPlatform(selectedPlatform);
    if (selectedPlatform !== 'Other') {
      setCustomPlatform('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }
    const finalPlatform = platform === 'Other' ? customPlatform : platform;
    if (!finalPlatform) {
      alert('Please select a platform or enter a custom platform name.');
      return;
    }
    const newEntry = { date, cost, platform: finalPlatform, name: currentUser.username, notes }; // Include notes
    setEntries([...entries, newEntry]);
    // Clear form fields
    setDate('');
    setCost('');
    setPlatform('');
    setCustomPlatform('');
    setNotes(''); // Clear notes
  };

  const handleDeleteEntry = (indexToDelete) => {
    if (!activeProject) return;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = entries.filter((_, index) => index !== indexToDelete);
      setEntries(updatedEntries);
    }
  };

  const handleEditClick = (entry, index) => {
    setEditingIndex(index);
    setEditedDate(entry.date);
    setEditedCost(entry.cost);
    setEditedPlatform(entry.platform);
    setEditedNotes(entry.notes);
    if (entry.platform === 'Other') {
      setEditedCustomPlatform(entry.platform);
    }
  };

  const handleSaveEdit = (indexToSave) => {
    if (!activeProject) return;
    const finalPlatform = editedPlatform === 'Other' ? editedCustomPlatform : editedPlatform;
    if (!finalPlatform) {
      alert('Please select a platform or enter a custom platform name.');
      return;
    }
    const updatedEntries = entries.map((entry, index) =>
      index === indexToSave
        ? {            ...entry,
            date: editedDate,
            cost: editedCost,
            platform: finalPlatform,
            notes: editedNotes,
          }
        : entry
    );
    setEntries(updatedEntries);
    setEditingIndex(null); // Exit edit mode
  };

  const handleCancelEdit = () => {
    setEditingIndex(null); // Exit edit mode without saving
  };

  return (
    <div className="social-media-container">
      <h2>Social Media Entries</h2>

      <div className="project-selection">
        <label htmlFor="project-select">Select Project:</label>
        <select
          id="project-select"
          value={activeProject ? activeProject.name : ''}
          onChange={(e) => selectProject(e.target.value)}
        >
          <option value="">-- Select a Project --</option>
          {projects.map((project) => (
            <option key={project.name} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
        {activeProject && <p>Current Project: <strong>{activeProject.name}</strong></p>}
        {!activeProject && <p className="no-project-selected">Please select a project to view/add entries.</p>}
      </div>

      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'internal' || currentUser.role === 'admin2') && (
        <>
          <h3>Create New Entry</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={currentUser.role === 'admin2'}
              />
            </div>
            <div>
              <label htmlFor="cost">Cost:</label>
              <input
                type="number"
                id="cost"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
                disabled={currentUser.role === 'admin2'}
              />
            </div>
            <div>
              <label htmlFor="platform">Platform:</label>
              <select
                id="platform"
                value={platform}
                onChange={handlePlatformChange}
                required
                disabled={currentUser.role === 'admin2'}
              >
                <option value="">Select Platform</option>
                <option value="Facebook">Facebook</option>
                <option value="Instagram">Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Bluesky">Bluesky</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {platform === 'Other' && (
              <div className="custom-platform-input">
                <label htmlFor="customPlatform">Custom Platform Name:</label>
                <input
                  type="text"
                  id="customPlatform"
                  value={customPlatform}
                  onChange={(e) => setCustomPlatform(e.target.value)}
                  required
                  disabled={currentUser.role === 'admin2'}
                />
              </div>
            )}
            <div>
              <label htmlFor="notes">Notes:</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="3"
                disabled={currentUser.role === 'admin2'}
              ></textarea>
            </div>
            <button type="submit" disabled={currentUser.role === 'admin2'}>Add Entry</button>
          </form>
        </>
      )}

      <h3>Recorded Entries</h3>
      {entries.length === 0 ? (
        <p>No entries recorded yet.</p>
      ) : (
        <table className="entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Cost</th>
              <th>Platform</th>
              <th>User</th>
              <th>Notes</th>{/* New column header */}
              {currentUser && (currentUser.role === 'admin' || currentUser.role === 'internal') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                {editingIndex === index ? (
                  <td colSpan={currentUser && (currentUser.role === 'admin' || currentUser.role === 'internal') ? 7 : 6}> {/* Adjust colspan based on admin or internal role */}
                    <div className="edit-entry-form-inline">
                      <label>Date:</label>
                      <input type="date" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} />
                      <label>Cost:</label>
                      <input type="number" value={editedCost} onChange={(e) => setEditedCost(e.target.value)} />
                      <label>Platform:</label>
                      <select value={editedPlatform} onChange={(e) => setEditedPlatform(e.target.value)}>
                        <option value="Facebook">Facebook</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Bluesky">Bluesky</option>
                        <option value="Other">Other</option>
                      </select>
                      {editedPlatform === 'Other' && (
                        <div className="custom-platform-input">
                          <label htmlFor="editedCustomPlatform">Custom Platform Name:</label>
                          <input
                            type="text"
                            id="editedCustomPlatform"
                            value={editedCustomPlatform}
                            onChange={(e) => setEditedCustomPlatform(e.target.value)}
                            required
                          />
                        </div>
                      )}
                      <label>Notes:</label>
                      <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} rows="1"></textarea>
                      <button onClick={() => handleSaveEdit(index)} className="save-entry-button">Save</button>
                      <button onClick={handleCancelEdit} className="cancel-entry-button">Cancel</button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{entry.date}</td>
                    <td>{entry.cost}</td>
                    <td>{entry.platform}</td>
                    <td>{entry.name}</td>
                    <td>{entry.notes}</td>{/* New data cell */}
                    {currentUser && (currentUser.role === 'admin' || currentUser.role === 'internal') && (
                      <td>
                        <button onClick={() => handleDeleteEntry(index)} className="delete-entry-button">Delete</button>
                        <button onClick={() => handleEditClick(entry, index)} className="edit-entry-button">Edit</button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SocialMediaEntries;
