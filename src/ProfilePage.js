import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { currentUser, updateCurrentUser, changePassword, logout } = useContext(AuthContext);
  console.log('ProfilePage: currentUser on render:', currentUser);
  const [changeOldPassword, setChangeOldPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmNewPassword, setChangeConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
  const [editedUsername, setEditedUsername] = useState(''); // New state for editing username
  const [editedPassword, setEditedPassword] = useState(''); // New state for editing password

  const [editingMyProfile, setEditingMyProfile] = useState(false); // State for editing current user's profile
  const [myEditedName, setMyEditedName] = useState(currentUser ? currentUser.name : '');
  const [myEditedEmail, setMyEditedEmail] = useState(currentUser ? currentUser.email : '');
  const [myEditedUsername, setMyEditedUsername] = useState(currentUser ? currentUser.username : '');
  const [myEditedPassword, setMyEditedPassword] = useState(currentUser ? currentUser.password : '');

  // Fetch users from API on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        alert('Failed to load users. Please try again.');
      }
    };
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Update myEditedName and myEditedEmail when currentUser changes
    if (currentUser) {
      setMyEditedName(currentUser.name);
      setMyEditedEmail(currentUser.email);
      setMyEditedUsername(currentUser.username);
      setMyEditedPassword(currentUser.password);
    }
  }, [currentUser]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (newUsername.trim() === '' || newPassword.trim() === '' || newName.trim() === '' || newEmail.trim() === '') {
      alert('Please enter username, password, name, and email.');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          name: newName,
          email: newEmail,
          role: newRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add user');
      }

      const addedUser = await response.json();
      setUsers(prevUsers => [...prevUsers, addedUser]);
      alert('User added successfully!');
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewEmail('');
      setNewRole('external');
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.message || 'Failed to add user. Please try again.');
    }
  };

  const handleDeleteUser = async (usernameToDelete) => {
    if (window.confirm(`Are you sure you want to delete user ${usernameToDelete}?`)) {
      console.log('handleDeleteUser: Current User Role:', currentUser?.role);
      try {
        const response = await fetch(`/api/users/${usernameToDelete}`, {
          method: 'DELETE',
          headers: {
            'X-User-Role': currentUser?.role || '',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }

        setUsers(prevUsers => prevUsers.filter(user => user.username !== usernameToDelete));
        alert(`User ${usernameToDelete} deleted successfully.`);

        // Also ensure the current user is logged out if their own account is deleted
        if (currentUser && currentUser.username === usernameToDelete) {
          logout();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.message || 'Failed to delete user. Please try again.');
      }
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.username);
    setEditedName(user.name);
    setEditedEmail(user.email);
    setEditedRole(user.role);
    setEditedUsername(user.username); // Set the current username for editing
    setEditedPassword(''); // Never pre-fill password for security
  };

  const handleSaveEdit = async (originalUsername) => {
    try {
      // Update user details
      const userDetailsResponse = await fetch(`/api/users/${originalUsername}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || '',
        },
        body: JSON.stringify({
          newUsername: editedUsername,
          name: editedName,
          email: editedEmail,
          role: editedRole,
        }),
      });

      if (!userDetailsResponse.ok) {
        const errorData = await userDetailsResponse.json();
        throw new Error(errorData.message || 'Failed to update user details');
      }

      // Update password if a new one is provided
      if (editedPassword) {
        const passwordResponse = await fetch(`/api/users/${originalUsername}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Role': currentUser?.role || '',
          },
          body: JSON.stringify({
            newPassword: editedPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || 'Failed to update password');
        }
      }

      // Refetch users to get the updated data
      const usersResponse = await fetch('/api/users');
      const usersData = await usersResponse.json();
      setUsers(usersData.users);

      alert('User updated successfully!');
      setEditingUser(null); // Exit edit mode
    } catch (error) {
      console.error('Error saving user edit:', error);
      alert(error.message || 'Failed to save user edit. Please try again.');
    }
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

  const handleSaveMyProfile = async () => {
    try {
      const success = await updateCurrentUser({
        oldUsername: currentUser.username,
        username: myEditedUsername,
        name: myEditedName,
        email: myEditedEmail,
        // password: myEditedPassword, // Password changes handled by changePassword
        role: currentUser.role, // Role not editable here
        allowedProjects: currentUser.allowed_projects, // Permissions not editable here, send current ones
      });
      if (success) {
        alert('Profile updated successfully!');
        setEditingMyProfile(false);
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving my profile:', error);
      alert(error.message || 'Failed to save profile. Please try again.');
    }
  };

  const handleCancelMyProfileEdit = () => {
    setEditingMyProfile(false);
    setMyEditedName(currentUser.name);
    setMyEditedEmail(currentUser.email);
    setMyEditedUsername(currentUser.username);
    setMyEditedPassword(currentUser.password);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === 'oldPassword') setChangeOldPassword(value);
    else if (name === 'newPassword') setChangeNewPassword(value);
    else if (name === 'confirmNewPassword') setChangeConfirmNewPassword(value);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (changeNewPassword !== changeConfirmNewPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    if (!currentUser || !currentUser.username) {
      alert('User not logged in.');
      return;
    }

    const success = changePassword(currentUser.username, changeOldPassword, changeNewPassword);

    if (success) {
      alert('Password changed successfully!');
      setChangeOldPassword('');
      setChangeNewPassword('');
      setChangeConfirmNewPassword('');
      setIsChangingPassword(false);
    } else {
      alert('Failed to change password. Please check your old password.');
    }
  };

  if (!currentUser) {
    return <div className="profile-page-container">Loading profile...</div>;
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
          {currentUser && currentUser.role === 'admin' && (
          <button onClick={handleMyProfileEditClick} className="edit-profile-button">Edit My Profile</button>
          )}
        </div>
      )}
      {currentUser && currentUser.role && (
        <p className="user-role-display">Role: {currentUser.role === 'admin2' ? 'Viewer' : currentUser.role}</p>
      )}

      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'admin2') && (
        <div className="user-management-section">
          <h3>Manage Users</h3>

          {currentUser && currentUser.role === 'admin' && (
          <form onSubmit={handleAddUser} className="add-user-form">
            <div>
              <label htmlFor="newUsername">New Username:</label>
              <input
                type="text"
                id="newUsername"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                disabled={currentUser.role === 'admin2'}
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
                disabled={currentUser.role === 'admin2'}
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
                disabled={currentUser.role === 'admin2'}
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
                disabled={currentUser.role === 'admin2'}
              />
            </div>
            <div>
              <label htmlFor="newRole">Role:</label>
              <select
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                disabled={currentUser.role === 'admin2'}
              >
                <option value="external">External</option>
                <option value="internal">Internal</option>
                <option value="admin">Admin</option>
                <option value="admin2">Viewer</option>
              </select>
            </div>
            <button type="submit" disabled={currentUser.role === 'admin2'}>Add User</button>
          </form>
          )}

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
                          value={editedUsername}
                          onChange={(e) => setEditedUsername(e.target.value)}
                          placeholder="Username"
                          disabled={currentUser.role === 'admin2'}
                        />
                        <input
                          type="password"
                          value={editedPassword}
                          onChange={(e) => setEditedPassword(e.target.value)}
                          placeholder="New Password (leave blank to keep current)"
                          disabled={currentUser.role === 'admin2'}
                        />
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={currentUser.role === 'admin2'}
                        />
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          disabled={currentUser.role === 'admin2'}
                        />
                        <select
                          value={editedRole}
                          onChange={(e) => setEditedRole(e.target.value)}
                          disabled={currentUser.role === 'admin2'}
                        >
                          <option value="external">External</option>
                          <option value="internal">Internal</option>
                          <option value="admin">Admin</option>
                          <option value="admin2">Viewer</option>
                        </select>
                        <button onClick={() => handleSaveEdit(user.username)} className="save-user-button" disabled={currentUser.role === 'admin2'}>Save</button>
                        <button onClick={() => handleCancelEdit} className="cancel-user-button" disabled={currentUser.role === 'admin2'}>Cancel</button>
                      </div>
                    ) : (
                      <> 
                        <span>{user.username} - {user.name} ({user.email})</span>
                        {currentUser && currentUser.role === 'admin' && (
                        <div className="user-actions">
                          <button onClick={() => handleDeleteUser(user.username)} className="delete-user-button">Delete</button>
                          <button onClick={() => handleEditClick(user)} className="edit-user-button">Edit</button>
                        </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'internal') && (
      <div className="password-change-section">
        <h3>Change Password</h3>
        {!isChangingPassword ? (
          <button onClick={() => setIsChangingPassword(true)}>Change Password</button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div>
              <label htmlFor="oldPassword">Old Password:</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={changeOldPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div>
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={changeNewPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div>
              <label htmlFor="confirmNewPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={changeConfirmNewPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <button type="submit">Save New Password</button>
            <button type="button" onClick={() => setIsChangingPassword(false)}>Cancel</button>
          </form>
        )}
      </div>
      )}
    </div>
  );
}

export default ProfilePage;