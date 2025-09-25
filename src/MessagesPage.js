import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './MessagesPage.css';

function MessagesPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject, projects, selectProject } = useContext(ProjectContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeProject || !currentUser) {
        setMessages([]);
        return;
      }

      try {
        const response = await fetch(`/api/messages?project_name=${activeProject.name}`, {
          headers: {
            'X-User-Role': currentUser.role,
            'X-User-Username': currentUser.username,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        alert('Failed to load messages. Please try again.');
      }
    };
    fetchMessages();
  }, [activeProject, currentUser]);

  const archiveRequests = messages.filter(msg => msg.message_type === 'archive_request');
  const regularMessages = messages.filter(msg => msg.message_type === 'regular');

  return (
    <div className="messages-container">
      <h2>Messages</h2>

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
        {!activeProject && <p className="no-project-selected">Please select a project to view messages.</p>}
      </div>

      {currentUser.role === 'admin' && (
        <div className="archive-requests">
          <h3>Archive Requests</h3>
          {archiveRequests.length === 0 ? (
            <p>No archive requests.</p>
          ) : (
            <ul>
              {archiveRequests.map(msg => (
                <li key={msg.id}>
                  <span>{msg.message_text} from {msg.sender_username}</span>
                  <button onClick={() => handleArchive(msg)}>Archive</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="regular-messages">
        <h3>Messages</h3>
        <div className="message-list">
          {regularMessages.length === 0 ? (
            <p>No messages.</p>
          ) : (
            <ul>
              {regularMessages.map(msg => (
                <li key={msg.id}>
                  <strong>{msg.sender_username}:</strong> {msg.message_text}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="message-input">
          <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
            <option value="">Select Recipient</option>
            {users.map(user => (
              <option key={user.username} value={user.username}>{user.username}</option>
            ))}
          </select>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
