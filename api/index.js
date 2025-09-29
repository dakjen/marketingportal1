require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Import the file system module

const app = express();
app.use(express.json());

// Authorization Middleware
const authorizeRole = (allowedRoles) => (req, res, next) => {
  const userRole = req.headers['x-user-role'];
  
  let effectiveAllowedRoles = [...allowedRoles];
  if (allowedRoles.includes('admin')) {
    effectiveAllowedRoles.push('admin2');
  }

  if (!userRole || !effectiveAllowedRoles.includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  }
  next();
};

// Configure PostgreSQL connection
// Vercel automatically injects POSTGRES_URL from your connected Neon database
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create tables if they don't exist
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_media_entries (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        date DATE NOT NULL,
        cost NUMERIC NOT NULL,
        platform TEXT NOT NULL,
        username TEXT NOT NULL,
        notes TEXT,
        is_archived BOOLEAN DEFAULT false
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS physical_marketing_entries (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        date DATE NOT NULL,
        cost NUMERIC NOT NULL,
        type TEXT NOT NULL,
        length_of_time TEXT NOT NULL,
        username TEXT NOT NULL,
        notes TEXT,
        is_archived BOOLEAN DEFAULT false
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        sender_username TEXT NOT NULL,
        recipient_username TEXT,
        message_text TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        message_type VARCHAR(20) NOT NULL,
        related_entry_id INTEGER,
        related_entry_type VARCHAR(50),
        is_read BOOLEAN DEFAULT false
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_media_uploads (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        type TEXT
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS physical_marketing_uploads (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        type TEXT
      );
    `);
    console.log('Entry tables checked/created successfully.');
  } catch (err) {
    console.error('Error creating entry tables:', err.stack);
  }
})();

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

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
app.post('/api/projects', authorizeRole(['admin']), async (req, res) => {
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
app.delete('/api/projects/:name', authorizeRole(['admin']), async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE name = $1 RETURNING name', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ message: `Project ${name} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting project:', error); // Log the full error object
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// Social Media Uploads Endpoints
app.get('/api/socialmedia/uploads', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM social_media_uploads WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ uploads: result.rows });
  } catch (error) {
    console.error('Error fetching social media uploads:', error.stack);
    res.status(500).json({ message: 'Error fetching social media uploads', error: error.message });
  }
});

app.post('/api/socialmedia/uploads', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const { path: file_path } = req.file;
  const uploader_username = req.headers['x-user-username'];

  if (!project_name || !file_name || !file_path || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO social_media_uploads(project_name, file_name, file_path, uploader_username, type) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [project_name, file_name, file_path, uploader_username, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding social media upload:', error.stack);
    res.status(500).json({ message: 'Error adding social media upload', error: error.message });
  }
});

// Physical Marketing Uploads Endpoints
app.get('/api/physicalmarketing/uploads', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM physical_marketing_uploads WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ uploads: result.rows });
  } catch (error) {
    console.error('Error fetching physical marketing uploads:', error.stack);
    res.status(500).json({ message: 'Error fetching physical marketing uploads', error: error.message });
  }
});

app.post('/api/physicalmarketing/uploads', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const { path: file_path } = req.file;
  const uploader_username = req.headers['x-user-username'];

  if (!project_name || !file_name || !file_path || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO physical_marketing_uploads(project_name, file_name, file_path, uploader_username, type) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [project_name, file_name, file_path, uploader_username, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding physical marketing upload:', error.stack);
    res.status(500).json({ message: 'Error adding physical marketing upload', error: error.message });
  }
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
app.post('/api/projects', authorizeRole(['admin']), async (req, res) => {
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
app.delete('/api/projects/:name', authorizeRole(['admin']), async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query('DELETE FROM projects WHERE name = $1 RETURNING name', [name]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ message: `Project ${name} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting project:', error); // Log the full error object
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// Social Media Uploads Endpoints
app.get('/api/socialmedia/uploads', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM social_media_uploads WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ uploads: result.rows });
  } catch (error) {
    console.error('Error fetching social media uploads:', error.stack);
    res.status(500).json({ message: 'Error fetching social media uploads', error: error.message });
  }
});

app.post('/api/socialmedia/uploads', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const { path: file_path } = req.file;
  const uploader_username = req.headers['x-user-username'];

  if (!project_name || !file_name || !file_path || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO social_media_uploads(project_name, file_name, file_path, uploader_username, type) VALUES($1, $2, $3, $4, $5) RETURNING *',
      [project_name, file_name, file_path, uploader_username, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding social media upload:', error.stack);
    res.status(500).json({ message: 'Error adding social media upload', error: error.message });
  }
});

// Social Media Entries Endpoints
app.get('/api/socialmediaentries', async (req, res) => {
  const { project_name } = req.query;
  const userRole = req.headers['x-user-role'];
  const allowedProjects = req.headers['x-user-allowed-projects'] ? JSON.parse(req.headers['x-user-allowed-projects']) : [];

  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  // Authorization for GET requests
  if (userRole === 'external' && !allowedProjects.includes(project_name)) {
    return res.status(403).json({ message: 'Forbidden: Not allowed to view entries for this project.' });
  }

  try {
    const result = await pool.query('SELECT * FROM social_media_entries WHERE project_name = $1 ORDER BY date DESC', [project_name]);
    res.status(200).json({ entries: result.rows });
  } catch (error) {
    console.error('Error fetching social media entries:', error.stack);
    res.status(500).json({ message: 'Error fetching social media entries', error: error.message });
  }
});

app.post('/api/socialmediaentries', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { project_name, date, cost, platform, username, notes } = req.body;
  if (!project_name || !date || !cost || !platform || !username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO social_media_entries(project_name, date, cost, platform, username, notes) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, date, cost, platform, username, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding social media entry:', error.stack);
    res.status(500).json({ message: 'Error adding social media entry', error: error.message });
  }
});

app.put('/api/socialmediaentries/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { id } = req.params;
  const { project_name, date, cost, platform, username, notes } = req.body;
  if (!project_name || !date || !cost || !platform || !username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const result = await pool.query(
      'UPDATE social_media_entries SET project_name = $1, date = $2, cost = $3, platform = $4, username = $5, notes = $6 WHERE id = $7 RETURNING *'
      , [project_name, date, cost, platform, username, notes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entry not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating social media entry:', error.stack);
    res.status(500).json({ message: 'Error updating social media entry', error: error.message });
  }
});

app.delete('/api/socialmediaentries/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM social_media_entries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entry not found.' });
    }
    res.status(200).json({ message: 'Social media entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting social media entry:', error.stack);
    res.status(500).json({ message: 'Error deleting social media entry', error: error.message });
  }
});

// Physical Marketing Entries Endpoints
app.get('/api/physicalmarketingentries', async (req, res) => {
  const { project_name } = req.query;
  const userRole = req.headers['x-user-role'];
  const allowedProjects = req.headers['x-user-allowed-projects'] ? JSON.parse(req.headers['x-user-allowed-projects']) : [];

  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  // Authorization for GET requests
  if (userRole === 'external' && !allowedProjects.includes(project_name)) {
    return res.status(403).json({ message: 'Forbidden: Not allowed to view entries for this project.' });
  }

  try {
    const result = await pool.query('SELECT * FROM physical_marketing_entries WHERE project_name = $1 ORDER BY date DESC', [project_name]);
    res.status(200).json({ entries: result.rows });
  } catch (error) {
    console.error('Error fetching physical marketing entries:', error.stack);
    res.status(500).json({ message: 'Error fetching physical marketing entries', error: error.message });
  }
});

app.post('/api/physicalmarketingentries', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { project_name, date, cost, type, length_of_time, username, notes } = req.body;
  if (!project_name || !date || !cost || !type || !length_of_time || !username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO physical_marketing_entries(project_name, date, cost, type, length_of_time, username, notes) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *'
      , [project_name, date, cost, type, length_of_time, username, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding physical marketing entry:', error.stack);
    res.status(500).json({ message: 'Error adding physical marketing entry', error: error.message });
  }
});

app.put('/api/physicalmarketingentries/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { id } = req.params;
  const { project_name, date, cost, type, length_of_time, username, notes } = req.body;
  if (!project_name || !date || !cost || !type || !length_of_time || !username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const result = await pool.query(
      'UPDATE physical_marketing_entries SET project_name = $1, date = $2, cost = $3, type = $4, length_of_time = $5, username = $6, notes = $7 WHERE id = $8 RETURNING *'
      , [project_name, date, cost, type, length_of_time, username, notes, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entry not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating physical marketing entry:', error.stack);
    res.status(500).json({ message: 'Error updating physical marketing entry', error: error.message });
  }
});

app.delete('/api/physicalmarketingentries/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM physical_marketing_entries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entry not found.' });
    }
    res.status(200).json({ message: 'Physical marketing entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting physical marketing entry:', error.stack);
    res.status(500).json({ message: 'Error deleting physical marketing entry', error: error.message });
  }
});

// Messages Endpoints
app.get('/api/messages', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { project_name } = req.query;
  const userRole = req.headers['x-user-role'];
  const username = req.headers['x-user-username'];

  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  try {
    let query;
    let queryParams = [project_name];

    if (userRole === 'admin') {
      // Admin sees all messages for the project
      query = 'SELECT * FROM messages WHERE project_name = $1 ORDER BY timestamp DESC';
    } else {
      // Internal users see messages they sent or received
      query = 'SELECT * FROM messages WHERE project_name = $1 AND (sender_username = $2 OR recipient_username = $2) ORDER BY timestamp DESC';
      queryParams.push(username);
    }

    const result = await pool.query(query, queryParams);
    res.status(200).json({ messages: result.rows });
  } catch (error) {
    console.error('Error fetching messages:', error.stack);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

app.post('/api/messages', authorizeRole(['admin', 'internal']), async (req, res) => {
  console.log('POST /api/messages hit');
  console.log('Request body:', req.body);
  const { project_name, recipient_username, message_text, message_type, related_entry_id, related_entry_type } = req.body;
  const sender_username = req.headers['x-user-username'];
  console.log('Sender username from header:', sender_username);

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

app.put('/api/messages/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { id } = req.params;
  const { is_read } = req.body;

  try {
    const result = await pool.query(
      'UPDATE messages SET is_read = $1 WHERE id = $2 RETURNING *',
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

app.get('/api/messages/unread-count', authorizeRole(['admin', 'internal']), async (req, res) => {
  const username = req.headers['x-user-username'];

  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE recipient_username = $1 AND is_read = false',
      [username]
    );
    const unreadCount = parseInt(result.rows[0].count, 10);
    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread message count:', error.stack);
    res.status(500).json({ message: 'Error fetching unread message count', error: error.message });
  }
});

// Archive Endpoint
app.put('/api/entries/:entryType/:id/archive', authorizeRole(['admin']), async (req, res) => {
  const { entryType, id } = req.params;

  let tableName;
  if (entryType === 'social') {
    tableName = 'social_media_entries';
  } else if (entryType === 'physical') {
    tableName = 'physical_marketing_entries';
  } else {
    return res.status(400).json({ message: 'Invalid entry type.' });
  }

  try {
    const result = await pool.query(
      `UPDATE ${tableName} SET is_archived = true WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entry not found.' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error archiving entry:', error.stack);
    res.status(500).json({ message: 'Error archiving entry', error: error.message });
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
  console.log('Login endpoint hit');
  console.log('Attempting login for username:', username, 'password provided:', !!password);

  if (!username || !password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    console.log(`Attempting to find user: ${username}`);
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];
    console.log('DB query result for user:', user ? 'User found' : 'User not found');

    if (!user) {
      console.log(`Login failed: User not found for username: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    console.log(`User found: ${user.username}. Comparing passwords.`);
    console.log(`Stored password hash (first 5 chars): ${user.password_hash ? user.password_hash.substring(0, 5) : 'N/A'}`);
    console.log(`Raw user.allowed_projects from DB:`, user.allowed_projects);

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    console.log(`Password match result for ${username}: ${passwordMatch}`);

    if (!passwordMatch) {
      console.log(`Login failed: Password mismatch for username: ${username}`);
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    console.log(`Login successful for user: ${username}`);
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
    const usersWithParsedPermissions = result.rows.map(user => ({
      ...user,
      allowedProjects: user.allowed_projects
    }));
    res.status(200).json({ users: usersWithParsedPermissions });
  } catch (error) {
    console.error('Error fetching users:', error.stack);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Update user permissions (role and allowed_projects)
app.put('/api/users/:username/permissions', authorizeRole(['admin']), async (req, res) => {
  const { username: originalUsername } = req.params;
  const { allowedProjects } = req.body;

  console.log('PUT /api/users/:username/permissions hit');
  console.log('Received allowedProjects (JS array):', allowedProjects);

  try {
    // Convert JS array to PostgreSQL array literal string
    const pgArrayLiteral = `{${allowedProjects.join(',')}}`;
    console.log('Constructed pgArrayLiteral:', pgArrayLiteral);

    const updateQuery = 'UPDATE users SET allowed_projects = $1 WHERE username = $2 RETURNING id, username, role, name, email, allowed_projects';
    const queryParams = [pgArrayLiteral, originalUsername];

    const result = await pool.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User permissions updated successfully.', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user permissions:', error.stack);
    res.status(500).json({ message: 'Error updating user permissions', error: error.message });
  }
});
app.put('/api/users/:username/password', authorizeRole(['admin']), async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;
  const requesterRole = req.headers['x-user-role'];

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // If the requester is not an admin, they must provide the old password
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
    await pool.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hashedNewPassword, username]);

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error.stack);
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
});

// Update general user details (username, name, email, role)
app.put('/api/users/:username', authorizeRole(['admin']), async (req, res) => {
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
app.delete('/api/users/:username', authorizeRole(['admin']), async (req, res) => {
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