import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import { canDeleteEntries, isInternalOrAbove, ROLES } from './roles';
import './SocialMediaEntries.css';

// Platforms per DJC Marketing protocols
const PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Bluesky', 'Pinterest', 'YouTube', 'Other'];

function SocialMediaEntries() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject, projects, selectProject } = useContext(ProjectContext);

  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [platform, setPlatform] = useState('');
  const [customPlatform, setCustomPlatform] = useState('');
  const [notes, setNotes] = useState('');

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [editedDate, setEditedDate] = useState('');
  const [editedCost, setEditedCost] = useState('');
  const [editedPlatform, setEditedPlatform] = useState('');
  const [editedCustomPlatform, setEditedCustomPlatform] = useState('');
  const [editedNotes, setEditedNotes] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      if (!activeProject || !currentUser) {
        setEntries([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`/api/socialmediaentries?project_name=${activeProject.name}`, {
          headers: {
            'X-User-Role': currentUser.role,
            'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
          },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setEntries(data.entries);
      } catch (error) {
        console.error('Failed to fetch social media entries:', error);
        alert('Failed to load social media entries. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, [activeProject, currentUser]);

  const handlePlatformChange = (e) => {
    const selected = e.target.value;
    setPlatform(selected);
    if (selected !== 'Other') setCustomPlatform('');
  };

  const handleSubmit = async (e) => {
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

    const newEntryData = {
      project_name: activeProject.name,
      date,
      cost: parseFloat(cost),
      platform: finalPlatform,
      username: currentUser.username,
      notes,
    };

    try {
      const response = await fetch('/api/socialmediaentries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
        },
        body: JSON.stringify(newEntryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add entry');
      }

      const addedEntry = await response.json();
      setEntries(prev => [...prev, addedEntry]);
      alert('Entry added successfully!');
      setDate('');
      setCost('');
      setPlatform('');
      setCustomPlatform('');
      setNotes('');
    } catch (error) {
      console.error('Error adding social media entry:', error);
      alert(error.message || 'Failed to add entry. Please try again.');
    }
  };

  const handleDeleteEntry = async (idToDelete) => {
    if (!activeProject) return;
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`/api/socialmediaentries/${idToDelete}`, {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser.role,
            'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete entry');
        }
        setEntries(prev => prev.filter(entry => entry.id !== idToDelete));
        alert('Entry deleted successfully!');
      } catch (error) {
        console.error('Error deleting social media entry:', error);
        alert(error.message || 'Failed to delete entry. Please try again.');
      }
    }
  };

  const handleEditClick = (entry) => {
    setEditingIndex(entry.id);
    setEditedDate(entry.date);
    setEditedCost(entry.cost);
    setEditedPlatform(entry.platform);
    setEditedNotes(entry.notes);
    if (entry.platform === 'Other') setEditedCustomPlatform(entry.platform);
  };

  const handleSaveEdit = async (idToSave) => {
    if (!activeProject) return;
    const finalPlatform = editedPlatform === 'Other' ? editedCustomPlatform : editedPlatform;
    if (!finalPlatform) {
      alert('Please select a platform or enter a custom platform name.');
      return;
    }

    try {
      const response = await fetch(`/api/socialmediaentries/${idToSave}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Allowed-Projects': JSON.stringify(currentUser.allowedProjects || []),
        },
        body: JSON.stringify({
          project_name: activeProject.name,
          date: editedDate,
          cost: parseFloat(editedCost),
          platform: finalPlatform,
          username: currentUser.username,
          notes: editedNotes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update entry');
      }

      const updatedEntry = await response.json();
      setEntries(prev => prev.map(entry => entry.id === idToSave ? updatedEntry : entry));
      alert('Entry updated successfully!');
      setEditingIndex(null);
    } catch (error) {
      console.error('Error updating social media entry:', error);
      alert(error.message || 'Failed to update entry. Please try again.');
    }
  };

  const handleCancelEdit = () => setEditingIndex(null);

  const handleRequestArchive = async (entryId, entryType) => {
    if (!activeProject) return;
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          project_name: activeProject.name,
          message_text: `Archive request for ${entryType} entry #${entryId}`,
          message_type: 'archive_request',
          related_entry_id: entryId,
          related_entry_type: entryType,
          recipient_username: 'admin',
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send archive request');
      }
      alert('Archive request sent successfully!');
    } catch (error) {
      console.error('Error sending archive request:', error);
      alert(error.message || 'Failed to send archive request. Please try again.');
    }
  };

  const isReadOnly = currentUser?.role === ROLES.ADMIN2;
  const canWrite = currentUser && (currentUser.role === ROLES.ADMIN || currentUser.role === ROLES.INTERNAL || currentUser.role === ROLES.ADMIN2);
  const showActions = currentUser && isInternalOrAbove(currentUser.role);

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
            <option key={project.name} value={project.name}>{project.name}</option>
          ))}
        </select>
        {activeProject && <p>Current Project: <strong>{activeProject.name}</strong></p>}
        {!activeProject && <p className="no-project-selected">Please select a project to view/add entries.</p>}
      </div>

      {canWrite && (
        <>
          <h3>Create New Entry</h3>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="date">Date:</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="cost">Cost:</label>
              <input type="number" id="cost" value={cost} onChange={(e) => setCost(e.target.value)} required disabled={isReadOnly} />
            </div>
            <div>
              <label htmlFor="platform">Platform:</label>
              <select id="platform" value={platform} onChange={handlePlatformChange} required disabled={isReadOnly}>
                <option value="">Select Platform</option>
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {platform === 'Other' && (
              <div className="custom-platform-input">
                <label htmlFor="customPlatform">Custom Platform Name:</label>
                <input type="text" id="customPlatform" value={customPlatform} onChange={(e) => setCustomPlatform(e.target.value)} required disabled={isReadOnly} />
              </div>
            )}
            <div>
              <label htmlFor="notes">Notes:</label>
              <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" disabled={isReadOnly}></textarea>
            </div>
            <button type="submit" disabled={isReadOnly}>Add Entry</button>
          </form>
        </>
      )}

      <h3>Recorded Entries</h3>
      {isLoading ? (
        <p>Loading entries...</p>
      ) : entries.length === 0 ? (
        <p>No entries recorded yet.</p>
      ) : (
        <table className="entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Cost</th>
              <th>Platform</th>
              <th>User</th>
              <th>Notes</th>
              {showActions && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                {editingIndex === entry.id ? (
                  <td colSpan={showActions ? 6 : 5}>
                    <div className="edit-entry-form-inline">
                      <label>Date:</label>
                      <input type="date" value={editedDate} onChange={(e) => setEditedDate(e.target.value)} />
                      <label>Cost:</label>
                      <input type="number" value={editedCost} onChange={(e) => setEditedCost(e.target.value)} />
                      <label>Platform:</label>
                      <select value={editedPlatform} onChange={(e) => setEditedPlatform(e.target.value)}>
                        {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {editedPlatform === 'Other' && (
                        <div className="custom-platform-input">
                          <label htmlFor="editedCustomPlatform">Custom Platform Name:</label>
                          <input type="text" id="editedCustomPlatform" value={editedCustomPlatform} onChange={(e) => setEditedCustomPlatform(e.target.value)} required />
                        </div>
                      )}
                      <label>Notes:</label>
                      <textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} rows="1"></textarea>
                      <button onClick={() => handleSaveEdit(entry.id)} className="save-entry-button">Save</button>
                      <button onClick={handleCancelEdit} className="cancel-entry-button">Cancel</button>
                    </div>
                  </td>
                ) : (
                  <>
                    <td>{entry.date}</td>
                    <td>{entry.cost}</td>
                    <td>{entry.platform}</td>
                    <td>{entry.username}</td>
                    <td>{entry.notes}</td>
                    {showActions && (
                      <td>
                        {canDeleteEntries(currentUser.role) && (
                          <button onClick={() => handleDeleteEntry(entry.id)} className="delete-entry-button">Delete</button>
                        )}
                        <button onClick={() => handleEditClick(entry)} className="edit-entry-button">Edit</button>
                        {currentUser.role === ROLES.INTERNAL && (
                          <button onClick={() => handleRequestArchive(entry.id, 'social')} className="archive-request-button">Request Archive</button>
                        )}
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
