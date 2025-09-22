const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Configure PostgreSQL connection
// Vercel automatically injects POSTGRES_URL from your connected Neon database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Database connected successfully at:', result.rows[0].now);
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Basic projects endpoint (demonstrates fetching from DB)
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, is_archived FROM projects ORDER BY name');
    res.status(200).json({ projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error.stack);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Add a new project
app.post('/api/projects', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO projects(name) VALUES($1) RETURNING id, name, is_archived',
      [name]
    );
    res.status(201).json(result.rows[0]);

    // Automatically grant permission to all admin users for the new project
    try {
      const adminUsers = await pool.query(`SELECT username, allowed_projects FROM users WHERE role = 'admin'`);
      for (const admin of adminUsers.rows) {
        if (!admin.allowed_projects.includes(name)) {
          const updatedAllowedProjects = [...admin.allowed_projects, name];
          await pool.query(
            'UPDATE users SET allowed_projects = $1 WHERE username = $2',
            [updatedAllowedProjects, admin.username]
          );
        }
      }
      console.log(`Project ${name} added to allowed_projects for all admins.`);
    } catch (adminUpdateError) {
      console.error('Error updating admin permissions for new project:', adminUpdateError.stack);
    }

  } catch (error) {
    console.error('Error adding project:', error.stack);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Project with this name already exists.' });
    }
    res.status(500).json({ message: 'Error adding project', error: error.message });
  }
});

// Delete a project
app.delete('/api/projects/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE name = $1 RETURNING name', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ message: `Project ${name} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting project:', error.stack);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// User Management Endpoints
const bcrypt = require('bcryptjs');

// Register a new user
app.post('/api/register', async (req, res) => {
  const { username, password, role, name, email } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const result = await pool.query(
      'INSERT INTO users(username, password_hash, role, name, email) VALUES($1, $2, $3, $4, $5) RETURNING id, username, role, name, email',
      [username, hashedPassword, role || 'external', name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error registering user:', error.stack);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'User with this username already exists.' });
    }
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// Login user
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // In a real app, you'd generate and send a JWT here
    res.status(200).json({ message: 'Login successful!', user: { id: user.id, username: user.username, role: user.role, name: user.name, email: user.email, allowedProjects: user.allowed_projects } });
  } catch (error) {
    console.error('Error logging in user:', error.stack);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get all users (for admin management)
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, role, name, email, allowed_projects FROM users ORDER BY username');
    res.status(200).json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error.stack);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user permissions (role and allowed_projects)
app.put('/api/users/:username/permissions', async (req, res) => {
  const { username: originalUsername } = req.params;
  const { username: newUsername, name, email, role, password, allowedProjects } = req.body;

  try {
    let updateQuery = 'UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), email = COALESCE($3, email), role = COALESCE($4, role), allowed_projects = COALESCE($5, allowed_projects)';
    const queryParams = [newUsername, name, email, role, allowedProjects];
    let paramIndex = 6;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `, password_hash = ${paramIndex++}`;
      queryParams.push(hashedPassword);
    }

    updateQuery += ` WHERE username = ${paramIndex} RETURNING id, username, role, name, email, allowed_projects`;
    queryParams.push(originalUsername);

    const result = await pool.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user permissions:', error.stack);
    if (error.code === '23505') { // Unique violation for username
      return res.status(409).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Error updating user permissions', error: error.message });
  }
});

// Change user password
app.put('/api/users/:username/password', async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Old and new passwords are required.' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Old password does not match.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hashedNewPassword, username]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.stack);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Update general user details (username, name, email, role)
app.put('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  const { newUsername, name, email, role } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET username = COALESCE($1, username), name = COALESCE($2, name), email = COALESCE($3, email), role = COALESCE($4, role) WHERE username = $5 RETURNING id, username, name, email, role, allowed_projects',
      [newUsername, name, email, role, username]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User updated successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error.stack);
    if (error.code === '23505') { // Unique violation for username
      return res.status(409).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete a user
app.delete('/api/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE username = $1 RETURNING username', [username]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.status(200).json({ message: `User ${username} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting user:', error.stack);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Vercel serverless function entry point
module.exports = app;
