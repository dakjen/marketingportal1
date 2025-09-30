import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './OperationsWinsPage.css';

function OperationsWinsPage() {
  const { currentUser } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState('');
  const [winDescription, setWinDescription] = useState('');
  const [winDate, setWinDate] = useState('');
  const [winCategory, setWinCategory] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAllUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        alert('Failed to load users. Please try again.');
      }
    };
    fetchAllUsers();
  }, []);

  const handleWinSubmit = (event) => {
    event.preventDefault();
    // Here you would typically send this data to your backend API
    console.log({
      selectedUser,
      winDescription,
      winDate,
      winCategory,
    });
    alert('Win submitted! Check console for data.');
    // Clear form
    setSelectedUser('');
    setWinDescription('');
    setWinDate('');
    setWinCategory('');
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
                {allUsers.map(user => (
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
          <p>This is where the list of recent wins will be displayed.</p>
        </div>
      </div>
    </div>
  );
}

export default OperationsWinsPage;