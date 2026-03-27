require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const projectsRouter = require('./routes/projects');
const entriesRouter = require('./routes/entries');
const uploadsRouter = require('./routes/uploads');
const reportsRouter = require('./routes/reports');
const messagesRouter = require('./routes/messages');
const usersRouter = require('./routes/users');
const workflowRouter = require('./routes/workflow');

const app = express();
app.use(express.json());

// PostgreSQL connection (Vercel Neon)
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

// Test DB connection and ensure tables exist on startup
pool.connect((err, client, release) => {
  if (err) return console.error('Error acquiring client', err.stack);
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) return console.error('Error executing query', err.stack);
    console.log('Database connected at:', result.rows[0].now);
  });
});

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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS generated_reports (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        report_name TEXT NOT NULL,
        report_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        generation_date TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_checklist_items (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        category TEXT NOT NULL,
        item_text TEXT NOT NULL,
        is_checked BOOLEAN DEFAULT false,
        checked_by_username TEXT,
        checked_at TIMESTAMPTZ,
        sort_order INTEGER DEFAULT 0
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_budgets (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        category TEXT NOT NULL,
        budget_type TEXT NOT NULL,
        amount NUMERIC NOT NULL DEFAULT 0,
        period TEXT DEFAULT 'monthly',
        UNIQUE (project_name, category)
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS apartment_listings (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        platform TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        listing_url TEXT,
        posted_date DATE,
        notes TEXT,
        created_by_username TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_team_roles (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        djc_role TEXT NOT NULL,
        assigned_username TEXT,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        assigned_by_username TEXT,
        UNIQUE (project_name, djc_role)
      );
    `);
    // Add columns that may be missing from tables created before schema updates
    await pool.query(`ALTER TABLE social_media_entries ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`);
    await pool.query(`ALTER TABLE physical_marketing_entries ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false`);
    console.log('Tables checked/created successfully.');
  } catch (err) {
    console.error('Error creating tables:', err.stack);
  }
})();

// Health check
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Routes
app.use('/api/projects', projectsRouter(pool));
app.use('/api', entriesRouter(pool));
app.use('/api', uploadsRouter(pool));
app.use('/api', reportsRouter(pool));
app.use('/api', messagesRouter(pool));
app.use('/api', usersRouter(pool));
app.use('/api', workflowRouter(pool));

// Vercel serverless function entry point
module.exports = app;
