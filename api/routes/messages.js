const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/auth');

module.exports = (pool) => {
  router.get('/messages/unread-count', authorizeRole(['admin', 'internal']), async (req, res) => {
    const username = req.headers['x-user-username'];
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM messages WHERE recipient_username=$1 AND is_read=false',
        [username]
      );
      res.status(200).json({ unreadCount: parseInt(result.rows[0].count, 10) });
    } catch (error) {
      console.error('Error fetching unread message count:', error.stack);
      res.status(500).json({ message: 'Error fetching unread message count', error: error.message });
    }
  });

  router.get('/messages', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name } = req.query;
    const userRole = req.headers['x-user-role'];
    const username = req.headers['x-user-username'];

    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    try {
      let query, queryParams;
      if (userRole === 'admin') {
        query = 'SELECT * FROM messages WHERE project_name=$1 ORDER BY timestamp DESC';
        queryParams = [project_name];
      } else {
        query = 'SELECT * FROM messages WHERE project_name=$1 AND (sender_username=$2 OR recipient_username=$2) ORDER BY timestamp DESC';
        queryParams = [project_name, username];
      }
      const result = await pool.query(query, queryParams);
      res.status(200).json({ messages: result.rows });
    } catch (error) {
      console.error('Error fetching messages:', error.stack);
      res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
  });

  router.post('/messages', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name, recipient_username, message_text, message_type, related_entry_id, related_entry_type } = req.body;
    const sender_username = req.headers['x-user-username'];

    if (!project_name || !message_text || !message_type) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      const result = await pool.query(
        'INSERT INTO messages(project_name, sender_username, recipient_username, message_text, message_type, related_entry_id, related_entry_type) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [project_name, sender_username, recipient_username, message_text, message_type, related_entry_id, related_entry_type]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating message:', error.stack);
      res.status(500).json({ message: 'Error creating message', error: error.message });
    }
  });

  router.put('/messages/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { id } = req.params;
    const { is_read } = req.body;
    try {
      const result = await pool.query(
        'UPDATE messages SET is_read=$1 WHERE id=$2 RETURNING *',
        [is_read, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Message not found.' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating message:', error.stack);
      res.status(500).json({ message: 'Error updating message', error: error.message });
    }
  });

  return router;
};
