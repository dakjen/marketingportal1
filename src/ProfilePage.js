import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { isLoggedIn, currentUser, logout, updateCurrentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('external'); // Default role

  const [editingUser, setEditingUser] = useState(null); // Stores username of user being edited
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');

  const [editingMyProfile, setEditingMyProfile] = useState(false); // State for editing current user's profile
  const [myEditedName, setMyEditedName] = useState(currentUser ? currentUser.name : '');
  const [myEditedEmail, setMyEditedEmail] = useState(currentUser ? currentUser.email : '');
  const [myEditedUsername, setMyEditedUsername] = useState(currentUser ? currentUser.username : '');
  const [myEditedPassword, setMyEditedPassword] = useState(currentUser ? currentUser.password : '');

  useEffect(() => {
    // Load users from localStorage on mount
    const storedUsers = localStorage.getItem('appUsers');
    if (storedUsers) {
      const parsedUsers = JSON.parse(storedUsers);
      setUsers(parsedUsers);
    }
  }, []);

  useEffect(() => {
    // Update myEditedName and myEditedEmail when currentUser changes
    if (currentUser) {
      setMyEditedName(currentUser.name);
      setMyEditedEmail(currentUser.email);
      setMyEditedUsername(currentUser.username);
      setMyEditedPassword(currentUser.password);
    }
  }, [currentUser]);

  const handleAddUser = (e) => {
    e.preventDefault();
    if (newUsername.trim() === '' || newPassword.trim() === '' || newName.trim() === '' || newEmail.trim() === '') {
      alert('Please enter username, password, name, and email.');
      return;
    }
    // Check if username already exists
    if (users.some(user => user.username === newUsername)) {
      alert('Username already exists. Please choose a different one.');
      return;
    }

    const newUser = { username: newUsername, password: newPassword, name: newName, email: newEmail,
     role: newRole, allowedProjects: [] }; // Include name and email
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
console.log("Saving users to localStorage:", updatedUsers);
    localStorage.setItem('appUsers', JSON.stringify(updatedUsers)); // Directly update localStorage
    setNewUsername('');
    setNewPassword('');
    setNewName(''); // Reset newName
    setNewEmail(''); // Reset newEmail
    setNewRole('external'); // Reset to default
  };

  const handleDeleteUser = (usernameToDelete) => {
    if (window.confirm(`Are you sure you want to delete user ${usernameToDelete}?`)) {
      const updatedUsers = users.filter(user => user.username !== usernameToDelete);
      setUsers(updatedUsers);
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers)); // Directly update localStorage
      // Also ensure the current user is logged out if their own account is deleted
      if (currentUser && currentUser.username === usernameToDelete) {
        logout(); // Assuming logout is available from AuthContext
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.username);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedRole(user.role);
  };

  const handleSaveEdit = (usernameToSave) => {
  setUsers(prevUsers => {
    const updatedUsers = prevUsers.map(user => {
      if (user.username === usernameToSave) {
        return { ...user, name: editedName, email: editedEmail, role: editedRole };
       }
       return user;
       });
      localStorage.setItem('appUsers', JSON.stringify(updatedUsers));
      return updatedUsers;
   });
  setEditingUser(null);
 };

  const handleCancelEdit = () => {
    setEditingUser(null); // Exit edit mode without saving
  };

  const handleMyProfileEditClick = () => {
    setEditingMyProfile(true);
    setMyEditedName(currentUser.name);
    setMyEditedEmail(currentUser.email);
    setMyEditedUsername(currentUser.username);
    setMyEditedPassword(currentUser.password);
  };

  const handleSaveMyProfile = () => {
   updateCurrentUser({ oldUsername: currentUser.username, username: myEditedUsername, password:
     myEditedPassword, name: myEditedName, email: myEditedEmail, role: currentUser.role, allowedProjects:
     currentUser.allowedProjects });
    setEditingMyProfile(false);
  };

  const handleCancelMyProfileEdit = () => {
    setEditingMyProfile(false);
    setMyEditedName(currentUser.name);
    setMyEditedEmail(currentUser.email);
    setMyEditedUsername(currentUser.username);
    setMyEditedPassword(currentUser.password);
  };

  if (!isLoggedIn) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {editingMyProfile ? (
        <div className="profile-info-edit">
          <div>
            <label htmlFor="myEditedUsername">Username:</label>
            <input
              type="text"
              id="myEditedUsername"
              value={myEditedUsername}
              onChange={(e) => setMyEditedUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="myEditedPassword">Password:</label>
            <input
              type="text"
              id="myEditedPassword"
              value={myEditedPassword}
              onChange={(e) => setMyEditedPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="myEditedName">Name:</label>
            <input
              type="text"
              id="myEditedName"
              value={myEditedName}
              onChange={(e) => setMyEditedName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="myEditedEmail">Email:</label>
            <input
              type="email"
              id="myEditedEmail"
              value={myEditedEmail}
              onChange={(e) => setMyEditedEmail(e.target.value)}
            />
          </div>
          <button onClick={handleSaveMyProfile} className="save-profile-button">Save</button>
          <button onClick={handleCancelMyProfileEdit} className="cancel-profile-button">Cancel</button>
        </div>
      ) : (
        <div className="profile-info">
          <p><strong>Username:</strong> {currentUser ? currentUser.username : 'Guest'}</p>
          <p><strong>Name:</strong> {currentUser ? currentUser.name : 'N/A'}</p>
          <p><strong>Email:</strong> {currentUser ? currentUser.email : 'N/A'}</p>
          <button onClick={handleMyProfileEditClick} className="edit-profile-button">Edit My Profile</button>
        </div>
      )}
      {currentUser && currentUser.role && (
        <p className="user-role-display">Role: {currentUser.role}</p>
      )}

      {currentUser && currentUser.role === 'admin' && (
        <div className="user-management-section">
          <h3>Manage Users</h3>

          <form onSubmit={handleAddUser} className="add-user-form">
            <div>
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="text"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newName">Name:</label>
              <input
                type="text"
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newEmail">Email:</label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="newRole">Role:</label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="external">External</option>
                <option value="internal">Internal</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit">Add User</button>
          </form>

          <div className="user-list">
            <h4>Existing Users:</h4>
            {users.length === 0 ? (
              <p>No users added yet.</p>
            ) : (
              <ul>
                {users.map((user, index) => (
                  <li key={index}>
                    {editingUser === user.username ? (
                      <div className="edit-user-form-inline">
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                        />
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                        />
                        <select
                          value={editedRole}
                          onChange={(e) => setEditedRole(e.target.value)}
                        >
                          <option value="external">External</option>
                          <option value="internal">Internal</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button onClick={() => handleSaveEdit(user.username)} className="save-user-button">Save</button>
                        <button onClick={() => handleCancelEdit} className="cancel-user-button">Cancel</button>
                      </div>
                    ) : (
                      <> 
                        <span>{user.username} - {user.name} ({user.email})</span>
                        <div className="user-actions">
                          <button onClick={() => handleDeleteUser(user.username)} className="delete-user-button">Delete</button>
                          <button onClick={() => handleEditClick(user)} className="edit-user-button">Edit</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
