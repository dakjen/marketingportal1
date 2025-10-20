import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext'; // Import ProjectContext
import './OperationsWinsPage.css';

function OperationsWinsPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject } = useContext(ProjectContext); // Access activeProject
  const [selectedUser, setSelectedUser] = useState('');
  const [winDescription, setWinDescription] = useState('');
  const [winDate, setWinDate] = useState('');
  const [winCategory, setWinCategory] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]); // New state for filtered users
  const [wins, setWins] = useState([]);

  const [wins, setWins] = useState([]);

  const fetchWins = useCallback(async () => {
    if (!activeProject) {
      setWins([]);
      return;
    }
    try {
      const response = await fetch(`/api/wins?project_name=${activeProject.name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWins(data.wins);
    } catch (error) {
      console.error("Failed to fetch wins:", error);
      alert('Failed to load wins. Please try again.');
    }
  }, [activeProject]);

  const handleWinSubmit = async (event) => {
    event.preventDefault();
    if (!activeProject) {
      alert('Please select an active project first.');
      return;
    }
    try {
      const response = await fetch('/api/wins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Username': currentUser.username,
          'X-User-Role': currentUser.role,
        },
        body: JSON.stringify({
          projectName: activeProject.name,
          selectedUser,
          winDescription,
          winDate,
          winCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit win');
      }

      alert('Win submitted successfully!');
      fetchWins(); // Re-fetch wins to update the list
      // Clear form
      setSelectedUser('');
      setWinDescription('');
      setWinDate('');
      setWinCategory('');
    } catch (error) {
      console.error('Error submitting win:', error);
      alert(error.message || 'Failed to submit win. Please try again.');
    }
  };

  return (
    <div>
      <h2>Operations Wins</h2>
      <div className="operations-wins-page-container">
        <div className="operations-wins-left-column">
          <h3>Submit a New Win</h3>
          <form onSubmit={handleWinSubmit} className="win-form">
            <div className="form-group">
              <label htmlFor="user-select">Project User:</label>
              <select
                id="user-select"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select a user</option>
                {filteredUsers.map(user => (
                  <option key={user.username} value={user.username}>{user.username}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="win-description">Win Description:</label>
              <textarea
                id="win-description"
                value={winDescription}
                onChange={(e) => setWinDescription(e.target.value)}
                rows="5"
                placeholder="Describe the win..."
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="win-date">Date:</label>
              <input
                type="date"
                id="win-date"
                value={winDate}
                onChange={(e) => setWinDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="win-category">Category:</label>
              <select
                id="win-category"
                value={winCategory}
                onChange={(e) => setWinCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                <option value="Social Media">Social Media</option>
                <option value="Physical">Physical</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit">Submit Win</button>
          </form>
        </div>
        <div className="operations-wins-right-column">
          <h3>Recent Wins</h3>
          {wins.length > 0 ? (
            <ul>
              {wins.map(win => (
                <li key={win.id}>
                  <strong>{win.win_description}</strong> by {win.user_name} on {new Date(win.win_date).toLocaleDateString()} ({win.win_category})
                </li>
              ))}
            </ul>
          ) : (
            <p>No wins submitted yet for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OperationsWinsPage;