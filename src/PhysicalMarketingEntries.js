import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './PhysicalMarketingEntries.css'; // Import the CSS file

function PhysicalMarketingEntries() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject, projects, selectProject } = useContext(ProjectContext);

  const [date, setDate] = useState('');
  const [cost, setCost] = useState('');
  const [type, setType] = useState('');
  const [lengthOfTimeValue, setLengthOfTimeValue] = useState(''); // New state for number input
  const [lengthOfTimeUnit, setLengthOfTimeUnit] = useState('Days'); // New state for dropdown
  const [notes, setNotes] = useState('');

  const [entries, setEntries] = useState(() => {
    // Initialize state from localStorage
    if (!activeProject) return []; // This conditional is fine within the initializer
    const savedEntries = localStorage.getItem(`${activeProject.name}_physicalMarketingEntries`);
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  // Effect to reload entries when activeProject changes
  useEffect(() => {
    if (activeProject) {
      const savedEntries = localStorage.getItem(`${activeProject.name}_physicalMarketingEntries`);
      setEntries(savedEntries ? JSON.parse(savedEntries) : []);
    } else {
      setEntries([]);
    }
  }, [activeProject]);

  const [editingIndex, setEditingIndex] = useState(null); // Stores the index of the entry being edited
  const [editedDate, setEditedDate] = useState('');
  const [editedCost, setEditedCost] = useState('');
  const [editedType, setEditedType] = useState('');
  const [editedLengthOfTimeValue, setEditedLengthOfTimeValue] = useState('');
  const [editedLengthOfTimeUnit, setEditedLengthOfTimeUnit] = useState('Days');
  const [editedNotes, setEditedNotes] = useState('');

  // Save entries to localStorage whenever the entries state changes
  useEffect(() => {
    if (!activeProject) return;
    localStorage.setItem(`${activeProject.name}_physicalMarketingEntries`, JSON.stringify(entries));
  }, [entries, activeProject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeProject) {
      alert('Please select a project first.');
      return;
    }
    const lengthOfTime = `${lengthOfTimeValue} ${lengthOfTimeUnit}`.trim(); // Combine value and unit
    if (!lengthOfTimeValue) {
      alert('Please enter a value for Length of Time.');
      return;
    }
    const newEntry = { date, cost, type, lengthOfTime, name: currentUser.username, notes };
    setEntries([...entries, newEntry]);
    // Clear form fields
    setDate('');
    setCost('');
    setType('');
    setLengthOfTimeValue('');
    setLengthOfTimeUnit('Days'); // Reset to default
    setNotes('');
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
    setEditedType(entry.type);
    const [value, unit] = entry.lengthOfTime.split(' ');
    setEditedLengthOfTimeValue(value || '');
    setEditedLengthOfTimeUnit(unit || 'Days');
    setEditedNotes(entry.notes);
  };

  const handleSaveEdit = (indexToSave) => {
    if (!activeProject) return;
    const updatedEntries = entries.map((entry, index) =>
      index === indexToSave
        ? {
            ...entry,
            date: editedDate,
            cost: editedCost,
            type: editedType,
            lengthOfTime: `${editedLengthOfTimeValue} ${editedLengthOfTimeUnit}`.trim(),
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
    <div className="physical-marketing-container">
      <h2>Physical Marketing Entries</h2>

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
              <label htmlFor="type">Type:</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                disabled={currentUser.role === 'admin2'}
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
            <div className="length-of-time-group">
              <label htmlFor="lengthOfTimeValue">Length of Time:</label>
              <input
                type="number"
                id="lengthOfTimeValue"
                value={lengthOfTimeValue}
                onChange={(e) => setLengthOfTimeValue(e.target.value)}
                required
                min="0"
                disabled={currentUser.role === 'admin2'}
              />
              <select
                id="lengthOfTimeUnit"
                value={lengthOfTimeUnit}
                onChange={(e) => setLengthOfTimeUnit(e.target.value)}
                disabled={currentUser.role === 'admin2'}
              >
                <option value="Days">Days</option>
                <option value="Weeks">Weeks</option>
                <option value="Months">Months</option>
              </select>
            </div>
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
              <th>Type</th>
              <th>Length of Time</th>
              <th>User</th>
              <th>Notes</th>
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
                      <label>Type:</label>
                      <select value={editedType} onChange={(e) => setEditedType(e.target.value)}>
                        <option value="Billboards">Billboards</option>
                        <option value="Podcasts">Podcasts</option>
                        <option value="Radio Ads">Radio Ads</option>
                        <option value="Newspaper">Newspaper</option>
                        <option value="Jobsite banners">Jobsite banners</option>
                        <option value="Printed collateral">Printed collateral</option>
                      </select>
                      <label>Length:</label>
                      <input type="number" value={editedLengthOfTimeValue} onChange={(e) => setEditedLengthOfTimeValue(e.target.value)} />
                      <select value={editedLengthOfTimeUnit} onChange={(e) => setEditedLengthOfTimeUnit(e.target.value)}>
                        <option value="Days">Days</option>
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                      </select>
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
                    <td>{entry.type}</td>
                    <td>{entry.lengthOfTime}</td>
                    <td>{entry.name}</td>
                    <td>{entry.notes}</td>
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

export default PhysicalMarketingEntries;