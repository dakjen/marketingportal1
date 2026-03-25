const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authorizeRole } = require('../middleware/auth');

module.exports = (pool) => {
  router.post('/register', async (req, res) => {
    const { username, password, role, name, email } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'INSERT INTO users(username, password_hash, role, name, email) VALUES($1, $2, $3, $4, $5) RETURNING id, username, role, name, email',
        [username, hashedPassword, role || 'external', name, email]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error registering user:', error.stack);
      if (error.code === '23505') {
        return res.status(409).json({ message: 'User with this username already exists.' });
      }
      res.status(500).json({ message: 'Error registering user', error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
      const result = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid username or password.' });
      }
      res.status(200).json({
        message: 'Login successful!',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          email: user.email,
          allowedProjects: user.allowed_projects,
        },
      });
    } catch (error) {
      console.error('Error logging in user:', error.stack);
      res.status(500).json({ message: 'Error logging in', error: error.message });
    }
  });

  router.get('/users', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT id, username, role, name, email, allowed_projects FROM users ORDER BY username'
      );
      const users = result.rows.map(user => ({ ...user, allowedProjects: user.allowed_projects }));
      res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching users:', error.stack);
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  });

  router.put('/users/:username/permissions', authorizeRole(['admin']), async (req, res) => {
    const { username } = req.params;
    const { allowedProjects } = req.body;
    try {
      const pgArrayLiteral = `{${allowedProjects.join(',')}}`;
      const result = await pool.query(
        'UPDATE users SET allowed_projects=$1 WHERE username=$2 RETURNING id, username, role, name, email, allowed_projects',
        [pgArrayLiteral, username]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ message: 'User permissions updated successfully.', user: result.rows[0] });
    } catch (error) {
      console.error('Error updating user permissions:', error.stack);
      res.status(500).json({ message: 'Error updating user permissions', error: error.message });
    }
  });

  router.put('/users/:username/password', authorizeRole(['admin']), async (req, res) => {
    const { username } = req.params;
    const { oldPassword, newPassword } = req.body;
    const requesterRole = req.headers['x-user-role'];

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required.' });
    }
    try {
      const result = await pool.query('SELECT password_hash FROM users WHERE username=$1', [username]);
      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      if (requesterRole !== 'admin') {
        if (!oldPassword) {
          return res.status(400).json({ message: 'Old password is required.' });
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);
        if (!passwordMatch) {
          return res.status(401).json({ message: 'Old password does not match.' });
        }
      }
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash=$1 WHERE username=$2', [hashedNewPassword, username]);
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Error changing password:', error.stack);
      res.status(500).json({ message: 'Error changing password', error: error.message });
    }
  });

  router.put('/users/:username', authorizeRole(['admin']), async (req, res) => {
    const { username } = req.params;
    const { newUsername, name, email, role } = req.body;
    try {
      const result = await pool.query(
        'UPDATE users SET username=COALESCE($1, username), name=COALESCE($2, name), email=COALESCE($3, email), role=COALESCE($4, role) WHERE username=$5 RETURNING id, username, name, email, role, allowed_projects',
        [newUsername, name, email, role, username]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ message: 'User updated successfully.', user: result.rows[0] });
    } catch (error) {
      console.error('Error updating user:', error.stack);
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  });

  router.delete('/users/:username', authorizeRole(['admin']), async (req, res) => {
    const { username } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE username=$1 RETURNING username', [username]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.status(200).json({ message: `User ${username} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting user:', error.stack);
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  });

  return router;
};
