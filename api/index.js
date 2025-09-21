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
    // In a real app, you'd fetch projects from a 'projects' table
    // For now, let's return a dummy project or an empty array
    const result = await pool.query(`SELECT 'Hello from Postgres!' as message`);
    res.status(200).json({ projects: [{ id: 1, name: 'Backend Project 1' }, { id: 2, name: 'Backend Project 2' }], dbMessage: result.rows[0].message });
  } catch (error) {
    console.error('Error fetching projects:', error.stack);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Vercel serverless function entry point
module.exports = app;
