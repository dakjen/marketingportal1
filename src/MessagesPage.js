import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { ProjectContext } from './ProjectContext';
import './MessagesPage.css';

// ── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#c07481', '#7b9ec7', '#82b59a', '#c4a86b', '#9b7db5', '#c47a5a'];
const getAvatarColor = (username = '') => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const getInitials = (username = '') => username.slice(0, 2).toUpperCase();

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatDateLabel = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatSidebarTime = (ts) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return formatTime(ts);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ username, size = 36 }) {
  return (
    <div
      className="msg-avatar"
      style={{
        width: size,
        height: size,
        background: getAvatarColor(username),
        fontSize: Math.round(size * 0.38),
        flexShrink: 0,
      }}
    >
      {getInitials(username)}
    </div>
  );
}

// ── MessagesPage ──────────────────────────────────────────────────────────────

function MessagesPage() {
  const { currentUser } = useContext(AuthContext);
  const { activeProject, projects, selectProject } = useContext(ProjectContext);

  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [newConvoRecipient, setNewConvoRecipient] = useState('');
  const [newConvoMessage, setNewConvoMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users', {
          headers: {
            'X-User-Role': currentUser.role,
            'X-User-Username': currentUser.username,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setUsers((data.users || []).filter((u) => u.username !== currentUser.username));
      } catch (e) {}
    };
    fetchUsers();
  }, [currentUser]);

  // Fetch messages + 5s polling
  const fetchMessages = useCallback(async () => {
    if (!activeProject || !currentUser) { setMessages([]); return; }
    try {
      const res = await fetch(
        `/api/messages?project_name=${encodeURIComponent(activeProject.name)}`,
        { headers: { 'X-User-Role': currentUser.role, 'X-User-Username': currentUser.username } }
      );
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {}
  }, [activeProject, currentUser]);

  useEffect(() => {
    fetchMessages();
    setSelectedConversation(null);
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
  }, [fetchMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  // Derived data
  const regularMessages = messages.filter((m) => m.message_type === 'regular');
  const archiveRequests = messages.filter(
    (m) => m.message_type === 'archive_request' && !m.is_read
  );

  const conversations = (() => {
    const map = {};
    regularMessages.forEach((msg) => {
      const other =
        msg.sender_username === currentUser.username
          ? msg.recipient_username
          : msg.sender_username;
      if (!other) return;
      if (!map[other]) map[other] = { username: other, msgs: [], unread: 0 };
      map[other].msgs.push(msg);
      if (msg.sender_username !== currentUser.username && !msg.is_read) map[other].unread++;
    });
    return Object.values(map)
      .map((c) => ({
        ...c,
        last: c.msgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0],
      }))
      .sort((a, b) => new Date(b.last.timestamp) - new Date(a.last.timestamp));
  })();

  const filteredConversations = conversations.filter((c) =>
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationMessages = regularMessages
    .filter(
      (m) =>
        selectedConversation &&
        selectedConversation !== '__archive__' &&
        [m.sender_username, m.recipient_username].includes(selectedConversation)
    )
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const groupedMessages = (() => {
    const groups = [];
    let currentDate = null;
    conversationMessages.forEach((msg) => {
      const d = new Date(msg.timestamp).toDateString();
      if (d !== currentDate) {
        currentDate = d;
        groups.push({
          type: 'date',
          label: formatDateLabel(msg.timestamp),
          key: `d-${msg.timestamp}`,
        });
      }
      groups.push({ type: 'msg', msg });
    });
    return groups;
  })();

  // Actions
  const markAsRead = useCallback(
    async (msg) => {
      try {
        await fetch(`/api/messages/${msg.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role },
          body: JSON.stringify({ is_read: true }),
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, is_read: true } : m))
        );
      } catch (e) {}
    },
    [currentUser]
  );

  const handleSelectConversation = async (username) => {
    setSelectedConversation(username);
    if (username === '__archive__') return;
    const unread = regularMessages.filter(
      (m) => m.sender_username === username && !m.is_read
    );
    for (const msg of unread) await markAsRead(msg);
  };

  const handleSend = async () => {
    if (
      !newMessage.trim() ||
      !selectedConversation ||
      selectedConversation === '__archive__' ||
      !activeProject ||
      isSending
    ) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          project_name: activeProject.name,
          recipient_username: selectedConversation,
          message_text: newMessage.trim(),
          message_type: 'regular',
        }),
      });
      if (res.ok) {
        const sent = await res.json();
        setMessages((prev) => [...prev, sent]);
        setNewMessage('');
        textareaRef.current?.focus();
      }
    } catch (e) {}
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStartNewConvo = async () => {
    if (!newConvoRecipient || !newConvoMessage.trim() || !activeProject || isSending) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role,
          'X-User-Username': currentUser.username,
        },
        body: JSON.stringify({
          project_name: activeProject.name,
          recipient_username: newConvoRecipient,
          message_text: newConvoMessage.trim(),
          message_type: 'regular',
        }),
      });
      if (res.ok) {
        const sent = await res.json();
        setMessages((prev) => [...prev, sent]);
        setSelectedConversation(newConvoRecipient);
        setShowNewConvo(false);
        setNewConvoRecipient('');
        setNewConvoMessage('');
      }
    } catch (e) {}
    setIsSending(false);
  };

  const handleArchiveApprove = async (msg) => {
    try {
      await fetch(`/api/entries/${msg.related_entry_type}/${msg.related_entry_id}/archive`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-User-Role': currentUser.role },
      });
      await markAsRead(msg);
    } catch (e) {}
  };

  const handleArchiveDismiss = async (msg) => { await markAsRead(msg); };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="msg-root">

      {/* ── Sidebar ── */}
      <div className="msg-sidebar">
        <div className="msg-sidebar-header">
          <h2>Messages</h2>
          <button
            className="msg-compose-btn"
            onClick={() => setShowNewConvo(true)}
            title="New conversation"
          >
            <i className="fas fa-edit" />
          </button>
        </div>

        <div className="msg-project-select-wrap">
          <select
            value={activeProject ? activeProject.name : ''}
            onChange={(e) => selectProject(e.target.value)}
          >
            <option value="">Select a project…</option>
            {projects.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="msg-search-wrap">
          <i className="fas fa-search msg-search-icon" />
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {currentUser.role === 'admin' && archiveRequests.length > 0 && (
          <button
            className={`msg-archive-pill ${selectedConversation === '__archive__' ? 'active' : ''}`}
            onClick={() => setSelectedConversation('__archive__')}
          >
            <i className="fas fa-inbox" />
            <span>Archive Requests</span>
            <span className="msg-pill-badge">{archiveRequests.length}</span>
          </button>
        )}

        <div className="msg-conv-list">
          {!activeProject ? (
            <p className="msg-hint">Select a project to view messages</p>
          ) : filteredConversations.length === 0 ? (
            <p className="msg-hint">No conversations yet</p>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.username}
                className={`msg-conv-item ${selectedConversation === conv.username ? 'active' : ''}`}
                onClick={() => handleSelectConversation(conv.username)}
              >
                <div className="msg-conv-avatar-wrap">
                  <Avatar username={conv.username} size={40} />
                  {conv.unread > 0 && (
                    <span className="msg-conv-unread-dot">{conv.unread}</span>
                  )}
                </div>
                <div className="msg-conv-info">
                  <div className="msg-conv-top">
                    <span className="msg-conv-name">@{conv.username}</span>
                    <span className="msg-conv-time">{formatSidebarTime(conv.last.timestamp)}</span>
                  </div>
                  <div className={`msg-conv-preview ${conv.unread > 0 ? 'unread' : ''}`}>
                    {conv.last.sender_username === currentUser.username ? 'You: ' : ''}
                    {conv.last.message_text.length > 46
                      ? conv.last.message_text.slice(0, 46) + '…'
                      : conv.last.message_text}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Chat Pane ── */}
      <div className="msg-chat">
        {!activeProject ? (
          <div className="msg-empty-state">
            <span className="msg-empty-icon">💬</span>
            <p>Select a project to get started</p>
          </div>

        ) : selectedConversation === '__archive__' ? (
          <>
            <div className="msg-chat-header">
              <div className="msg-chat-header-icon">
                <i className="fas fa-inbox" />
              </div>
              <div>
                <div className="msg-chat-header-name">Archive Requests</div>
                <div className="msg-chat-header-sub">{activeProject.name}</div>
              </div>
            </div>
            <div className="msg-archive-list">
              {archiveRequests.length === 0 ? (
                <div className="msg-empty-state">
                  <span className="msg-empty-icon">✅</span>
                  <p>All caught up!</p>
                </div>
              ) : (
                archiveRequests.map((msg) => (
                  <div key={msg.id} className="msg-archive-card">
                    <div className="msg-archive-card-left">
                      <Avatar username={msg.sender_username} size={38} />
                      <div className="msg-archive-card-body">
                        <div className="msg-archive-card-who">
                          <strong>@{msg.sender_username}</strong>
                          <span className="msg-archive-card-tag">requested archive</span>
                        </div>
                        <p className="msg-archive-card-text">{msg.message_text}</p>
                        <span className="msg-archive-card-time">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                    <div className="msg-archive-card-actions">
                      <button className="msg-btn-approve" onClick={() => handleArchiveApprove(msg)}>
                        <i className="fas fa-check" /> Approve
                      </button>
                      <button className="msg-btn-dismiss" onClick={() => handleArchiveDismiss(msg)}>
                        Dismiss
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>

        ) : selectedConversation ? (
          <>
            <div className="msg-chat-header">
              <Avatar username={selectedConversation} size={36} />
              <div>
                <div className="msg-chat-header-name">@{selectedConversation}</div>
                <div className="msg-chat-header-sub">{activeProject.name}</div>
              </div>
            </div>

            <div className="msg-bubbles">
              {conversationMessages.length === 0 && (
                <div className="msg-thread-empty">
                  <p>No messages yet — say hello! 👋</p>
                </div>
              )}
              {groupedMessages.map((item) =>
                item.type === 'date' ? (
                  <div key={item.key} className="msg-date-divider">
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <div
                    key={item.msg.id}
                    className={`msg-bubble-row ${
                      item.msg.sender_username === currentUser.username ? 'sent' : 'received'
                    }`}
                  >
                    {item.msg.sender_username !== currentUser.username && (
                      <Avatar username={item.msg.sender_username} size={28} />
                    )}
                    <div className="msg-bubble-wrap">
                      <div className="msg-bubble">{item.msg.message_text}</div>
                      <div className="msg-bubble-meta">
                        {formatTime(item.msg.timestamp)}
                        {item.msg.sender_username === currentUser.username &&
                          item.msg.is_read && <span className="msg-seen"> · Seen</span>}
                      </div>
                    </div>
                  </div>
                )
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="msg-input-bar">
              <textarea
                ref={textareaRef}
                className="msg-textarea"
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                className="msg-send-btn"
                onClick={handleSend}
                disabled={isSending || !newMessage.trim()}
              >
                <i className="fas fa-paper-plane" />
              </button>
            </div>
          </>

        ) : (
          <div className="msg-empty-state">
            <span className="msg-empty-icon">💬</span>
            <p>Select a conversation or start a new one</p>
            <button className="msg-start-btn" onClick={() => setShowNewConvo(true)}>
              <i className="fas fa-edit" /> New Message
            </button>
          </div>
        )}
      </div>

      {/* ── New Conversation Modal ── */}
      {showNewConvo && (
        <div className="msg-modal-overlay" onClick={() => setShowNewConvo(false)}>
          <div className="msg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="msg-modal-header">
              <h3>New Message</h3>
              <button className="msg-modal-close" onClick={() => setShowNewConvo(false)}>
                ×
              </button>
            </div>
            <div className="msg-modal-body">
              <label>To</label>
              <select
                value={newConvoRecipient}
                onChange={(e) => setNewConvoRecipient(e.target.value)}
              >
                <option value="">Select a team member…</option>
                {users.map((u) => (
                  <option key={u.username} value={u.username}>
                    @{u.username}{u.role ? ` (${u.role})` : ''}
                  </option>
                ))}
              </select>
              <label>Message</label>
              <textarea
                placeholder="Write your message…"
                value={newConvoMessage}
                onChange={(e) => setNewConvoMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartNewConvo();
                  }
                }}
                rows={4}
              />
            </div>
            <div className="msg-modal-footer">
              <button className="msg-modal-cancel" onClick={() => setShowNewConvo(false)}>
                Cancel
              </button>
              <button
                className="msg-modal-send"
                onClick={handleStartNewConvo}
                disabled={!newConvoRecipient || !newConvoMessage.trim() || isSending}
              >
                Send <i className="fas fa-paper-plane" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
