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
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const filteredUsers = data.users.filter(user => (user.role === 'admin' || user.role === 'internal') && user.username !== currentUser.username);
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, [currentUser.username]);

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

  const handleSendMessage = async () => {
    if (!activeProject || !newMessage || !recipient) {
      alert('Please select a project, recipient, and write a message.');
      return;
    }

    const messageData = {
      project_name: activeProject.name,
      recipient_username: recipient,
      message_text: newMessage,
      message_type: 'regular',
    };

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }

      const sentMessage = await response.json();
      setMessages(prevMessages => [sentMessage, ...prevMessages]);
      setNewMessage('');
      setRecipient('');
      setShowNewMessageModal(false);
      alert('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert(error.message || 'Failed to send message. Please try again.');
    }
  };

  const handleArchive = async (message) => {
    // ... (implementation from before)
  };

  const archiveRequests = messages.filter(msg => msg.message_type === 'archive_request' && !msg.is_read);
  const regularMessages = messages.filter(msg => msg.message_type === 'regular');

  const conversations = [...new Set(regularMessages.flatMap(msg => [msg.sender_username, msg.recipient_username]))].filter(username => username && username !== currentUser.username);

  return (
    <div className="messages-container">
      <div className="messages-header">
        <h2>Messages</h2>
        <button className="start-message-button" onClick={() => setShowNewMessageModal(true)}>Start Message</button>
      </div>

      <div className="project-selection">
        {/* ... project selection ... */}
      </div>

      {currentUser.role === 'admin' && (
        <div className="archive-requests">
          {/* ... archive requests ... */}
        </div>
      )}

      <div className="messages-body">
        <div className="conversations-sidebar">
          <h3>Conversations</h3>
          <ul>
            {conversations.map(username => (
              <li key={username} onClick={() => setSelectedConversation(username)} className={selectedConversation === username ? 'active' : ''}>
                {username}
              </li>
            ))}
          </ul>
        </div>
        <div className="conversation-view">
          {selectedConversation ? (
            <>
              <h3>Conversation with {selectedConversation}</h3>
              <div className="message-list">
                {regularMessages
                  .filter(msg => [msg.sender_username, msg.recipient_username].includes(selectedConversation))
                  .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                  .map(msg => (
                    <div key={msg.id} className={`message ${msg.sender_username === currentUser.username ? 'sent' : 'received'}`}>
                      <strong>{msg.sender_username}:</strong> {msg.message_text}
                    </div>
                  ))}
              </div>
              <div className="message-input">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                />
                <button onClick={() => {
                  setRecipient(selectedConversation);
                  handleSendMessage();
                }}>Send</button>
              </div>
            </>
          ) : (
            <p>Select a conversation to view messages.</p>
          )}
        </div>
      </div>

      {showNewMessageModal && (
        <div className="new-message-modal">
          <div className="modal-content">
            <h3>Start New Message</h3>
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
            <button onClick={() => setShowNewMessageModal(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
