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

// Vercel serverless function entry point
module.exports = app;
