require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require('pdfkit');
const docx = require('docx');

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
(async () => {
  try {
    const url = new URL(process.env.POSTGRES_URL);
    console.log('Connecting to database host:', url.host);
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connected successfully at:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
})();

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
      CREATE TABLE IF NOT EXISTS budget_entries (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        interval TEXT NOT NULL,
        month_allocation TEXT NOT NULL DEFAULT 'month 1',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS operations_data (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL UNIQUE,
        project_description TEXT,
        important_details TEXT,
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        important_links JSONB
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regular_documents (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        type TEXT,
        file_data BYTEA
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotes_documents (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        type TEXT,
        file_data BYTEA
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS important_files_documents (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        upload_date TIMESTAMPTZ DEFAULT NOW(),
        type TEXT,
        file_data BYTEA
      );
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS word_reports (
        id SERIAL PRIMARY KEY,
        project_name TEXT NOT NULL,
        report_name TEXT NOT NULL,
        report_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        uploader_username TEXT NOT NULL,
        generation_date TIMESTAMPTZ DEFAULT NOW(),
        file_data BYTEA
      );
    `);
    await pool.query(`ALTER TABLE word_reports ADD COLUMN IF NOT EXISTS report_type TEXT DEFAULT 'general';`);
    await pool.query(`ALTER TABLE word_reports ADD COLUMN IF NOT EXISTS file_name TEXT;`);
    console.log('Database schema updated successfully.');
    console.log('Entry tables checked/created successfully.');
  } catch (err) {
    console.error('Error creating entry tables:', err.stack);
  }
})();

// --- End of table creation logic ---

// Multer setup for file uploads (using memory storage for serverless environments)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'API is working!' });
});

// Basic projects endpoint (demonstrates fetching from DB)
app.get('/api/projects', async (req, res) => {
  console.log('GET /api/projects hit');
  try {
    const result = await pool.query('SELECT id, name, is_archived FROM projects ORDER BY name');
    res.status(200).json({ projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error.stack);
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// API endpoint for project data (general project info - this might be redundant or need clarification)
app.get('/api/project-data', async (req, res) => {
  const { project_name } = req.query;
  console.log('GET /api/project-data hit with project_name:', project_name);
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    // Fetch social media spend
    const socialMediaSpendResult = await pool.query(
      'SELECT date, cost FROM social_media_entries WHERE project_name = $1 ORDER BY date ASC',
      [project_name]
    );
    console.log('Successfully fetched social media spend:', socialMediaSpendResult.rows);

    // Fetch physical marketing spend
    const physicalMarketingSpendResult = await pool.query(
      'SELECT date, cost FROM physical_marketing_entries WHERE project_name = $1 ORDER BY date ASC',
      [project_name]
    );
    console.log('Successfully fetched physical marketing spend:', physicalMarketingSpendResult.rows);

    // Combine and format spend data
    const combinedSpend = [
      ...socialMediaSpendResult.rows.map(row => ({ date: row.date, amount: parseFloat(row.cost || 0), type: 'socialMedia' })),
      ...physicalMarketingSpendResult.rows.map(row => ({ date: row.date, amount: parseFloat(row.cost || 0), type: 'physicalMarketing' }))
    ];

    res.status(200).json({ spend: combinedSpend });
  } catch (error) {
    console.error('Error fetching project spend data:', error.stack);
    res.status(500).json({ message: 'Error fetching project spend data', error: error.message });
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
  const uploader_username = req.headers['x-user-username'];

  // In a real-world scenario, you would upload the file to a cloud storage service here.
  // For now, we'll just log its buffer size to confirm it was received.
  console.log(`Received file: ${req.file.originalname}, size: ${req.file.buffer.length} bytes`);
  const file_path = `/${project_name}/socialmedia/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
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

app.delete('/api/socialmedia/uploads/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM social_media_uploads WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Upload not found.' });
    }
    res.status(200).json({ message: 'Social media upload deleted successfully.' });
  } catch (error) {
    console.error('Error deleting social media upload:', error.stack);
    res.status(500).json({ message: 'Error deleting social media upload', error: error.message });
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
  const uploader_username = req.headers['x-user-username'];

  // In a real-world scenario, you would upload the file to a cloud storage service here.
  // For now, we'll just log its buffer size to confirm it was received.
  console.log(`Received file: ${req.file.originalname}, size: ${req.file.buffer.length} bytes`);
  const file_path = `/${project_name}/physicalmarketing/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
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

app.delete('/api/physicalmarketing/uploads/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM physical_marketing_uploads WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Upload not found.' });
    }
    res.status(200).json({ message: 'Physical marketing upload deleted successfully.' });
  } catch (error) {
    console.error('Error deleting physical marketing upload:', error.stack);
    res.status(500).json({ message: 'Error deleting physical marketing upload', error: error.message });
  }
});

// API endpoint for AI report generation
app.post('/api/generate-report', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { reportType, startDate, endDate, project_name, prompt } = req.body;

  if (!reportType || !project_name) {
    return res.status(400).json({ message: 'Missing required fields: reportType, project_name.' });
  }

  let dataForAI = [];
  try {
    if (reportType === 'socialMedia' || reportType === 'general' || reportType === 'admin') {
      const socialResult = await pool.query(
        'SELECT * FROM social_media_entries WHERE project_name = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
        [project_name, startDate, endDate]
      );
      dataForAI = dataForAI.concat(socialResult.rows);
    }
    if (reportType === 'physicalMarketing' || reportType === 'general' || reportType === 'admin') {
      const physicalResult = await pool.query(
        'SELECT * FROM physical_marketing_entries WHERE project_name = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
        [project_name, startDate, endDate]
      );
      dataForAI = dataForAI.concat(physicalResult.rows);
    }

    if (dataForAI.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected criteria.' });
    }

    const fullPrompt = `Generate a ${reportType} report for project ${project_name} from ${startDate} to ${endDate}. Analyze the following data and respond to the user's prompt: "${prompt}".\n\nData: ${JSON.stringify(dataForAI)}`;

    console.log('Full prompt:', fullPrompt);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    res.status(200).json({ report: text });

  } catch (error) {
    console.error('Error generating AI report:', error);
    res.status(500).json({ message: 'Error generating AI report', error: error });
  }
});

app.post('/api/generate-and-save-word-report', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { reportType, startDate, endDate, project_name, prompt, reportName, summary } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!reportType || !project_name || !reportName) {
    return res.status(400).json({ message: 'Missing required fields: reportType, project_name, reportName.' });
  }

  let dataForAI = [];
  try {
    if (reportType === 'socialMedia' || reportType === 'general' || reportType === 'admin') {
      const socialResult = await pool.query(
        'SELECT * FROM social_media_entries WHERE project_name = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
        [project_name, startDate, endDate]
      );
      dataForAI = dataForAI.concat(socialResult.rows);
    }
    if (reportType === 'physicalMarketing' || reportType === 'general' || reportType === 'admin') {
      const physicalResult = await pool.query(
        'SELECT * FROM physical_marketing_entries WHERE project_name = $1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
        [project_name, startDate, endDate]
      );
      dataForAI = dataForAI.concat(physicalResult.rows);
    }

    if (dataForAI.length === 0) {
      return res.status(404).json({ message: 'No data found for the selected criteria.' });
    }

    const fullPrompt = `Generate a ${reportType} report for project ${project_name} from ${startDate} to ${endDate}. Analyze the following data and respond to the user's prompt: "${prompt}".\n\nData: ${JSON.stringify(dataForAI)}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    console.log('Raw AI output:', text);

    const paragraphs = text.split(/\r?\n/).map(p => {
      if (p.startsWith('# ')) {
        return new docx.Paragraph({ text: p.substring(2), heading: docx.HeadingLevel.HEADING_1 });
      } else if (p.startsWith('## ')) {
        return new docx.Paragraph({ text: p.substring(3), heading: docx.HeadingLevel.HEADING_2 });
      } else if (p.startsWith('* ')) {
        const level = (p.match(/^\s*\*/) || [''])[0].length - 1;
        const text = p.replace(/^\s*\* /, '');
        const runs = [];
        let lastIndex = 0;
        const regex = /\*\*(.*?)\*\*/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            runs.push(new docx.TextRun(text.substring(lastIndex, match.index)));
          }
          runs.push(new docx.TextRun({ text: match[1], bold: true }));
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < text.length) {
          runs.push(new docx.TextRun(text.substring(lastIndex)));
        }
        return new docx.Paragraph({ children: runs, bullet: { level } });
      } else {
        const runs = [];
        let lastIndex = 0;
        const regex = /\*\*(.*?)\*\*/g;
        let match;
        while ((match = regex.exec(p)) !== null) {
          if (match.index > lastIndex) {
            runs.push(new docx.TextRun(p.substring(lastIndex, match.index)));
          }
          runs.push(new docx.TextRun({ text: match[1], bold: true }));
          lastIndex = regex.lastIndex;
        }
        if (lastIndex < p.length) {
          runs.push(new docx.TextRun(p.substring(lastIndex)));
        }
        return new docx.Paragraph({ children: runs });
      }
    });

    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    const file_path = `/${project_name}/word_reports/${reportName}.docx`;

    await pool.query(
      'INSERT INTO word_reports(project_name, report_name, report_type, file_path, uploader_username, file_data) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, reportName, reportType, file_path, uploader_username, buffer]
    );

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${reportName}.docx"`);
    res.send(buffer);

  } catch (error) {
    console.error('Error generating and saving Word report:', error);
    res.status(500).json({ message: 'Error generating and saving Word report', error: error });
  }
});

// API endpoint to save generated reports as PDF
app.post('/api/save-report-as-word', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { reportContent, reportName, project_name } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!reportContent || !reportName || !project_name || !uploader_username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun(reportContent),
            ],
          }),
        ],
      }],
    });

    const buffer = await docx.Packer.toBuffer(doc);
    const file_path = `/${project_name}/word_reports/${reportName}.docx`;

    const result = await pool.query(
      'INSERT INTO word_reports(project_name, report_name, file_path, uploader_username, file_data) VALUES($1, $2, $3, $4, $5) RETURNING *'
      , [project_name, reportName, file_path, uploader_username, buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error generating Word document or saving report:', error.stack);
    res.status(500).json({ message: 'Error generating Word document or saving report', error: error.message });
  }
});

// API endpoint to save generated reports as PDF
app.post('/api/save-report', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { reportContent, reportName, reportType, project_name } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!reportContent || !reportName || !reportType || !project_name || !uploader_username) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      let pdfBuffer = Buffer.concat(buffers);
      // In a real-world scenario, upload pdfBuffer to cloud storage (e.g., S3)
      // For now, we simulate a file path and save metadata to DB
      const file_path = `/${project_name}/generated_reports/${reportName}.pdf`;

      try {
        const result = await pool.query(
          'INSERT INTO generated_reports(project_name, report_name, report_type, file_path, uploader_username) VALUES($1, $2, $3, $4, $5) RETURNING *',
          [project_name, reportName, reportType, file_path, uploader_username]
        );
        res.status(201).json(result.rows[0]);
      } catch (dbError) {
        console.error('Error saving generated report metadata to DB:', dbError.stack);
        res.status(500).json({ message: 'Error saving report metadata', error: dbError.message });
      }
    });
    doc.text(reportContent);
    doc.end();

  } catch (error) {
    console.error('Error generating PDF or saving report:', error.stack);
    res.status(500).json({ message: 'Error generating PDF or saving report', error: error.message });
  }
});

// API endpoint to list generated reports
app.get('/api/generated-reports', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM generated_reports WHERE project_name = $1 ORDER BY generation_date DESC', [project_name]);
    res.status(200).json({ reports: result.rows });
  } catch (error) {
    console.error('Error fetching generated reports:', error.stack);
    res.status(500).json({ message: 'Error fetching generated reports', error: error.message });
  }
});

// API endpoint to view a generated report (PDF)
app.get('/api/generated-reports/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT file_path FROM generated_reports WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    const report = result.rows[0];
    // In a real-world scenario, you would fetch the PDF from cloud storage using report.file_path
    // For now, we'll simulate a PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${report.file_path.split('/').pop()}"`);
    const doc = new PDFDocument();
    doc.text(`Simulated PDF content for report ID: ${id}\n\nPath: ${report.file_path}`);
    doc.end();
    doc.pipe(res);

  } catch (error) {
    console.error('Error viewing generated report:', error.stack);
    res.status(500).json({ message: 'Error viewing generated report', error: error.message });
  }
});

// API endpoint to delete a generated report
app.delete('/api/generated-reports/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM generated_reports WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    res.status(200).json({ message: 'Generated report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting generated report:', error.stack);
    res.status(500).json({ message: 'Error deleting generated report', error: error.message });
  }
});

// API endpoint to list saved Word reports
app.get('/api/word-reports', async (req, res) => {
  const { project_name } = req.query;
  console.log('GET /api/word-reports hit with project_name:', project_name);
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT id, project_name, report_name, uploader_username, generation_date, report_type FROM word_reports WHERE project_name = $1 ORDER BY generation_date DESC', [project_name]);
    console.log('Successfully fetched word reports:', result.rows);
    res.status(200).json({ reports: result.rows });
  } catch (error) {
    console.error('Error fetching word reports:', error.stack);
    res.status(500).json({ message: 'Error fetching word reports', error: error.message });
  }
});

// API endpoint to view a saved Word report
app.get('/api/word-reports/:id/view', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT file_name, file_data FROM word_reports WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    const report = result.rows[0];
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `inline; filename="${report.file_name}"`);
    res.send(report.file_data);

  } catch (error) {
    console.error('Error viewing Word report:', error.stack);
    res.status(500).json({ message: 'Error viewing Word report', error: error.message });
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

// Budget Entries Endpoints
app.get('/api/budget-entries', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT * FROM budget_entries WHERE project_name = $1 ORDER BY created_at DESC', [project_name]);
    res.status(200).json({ entries: result.rows });
  } catch (error) {
    console.error('Error fetching budget entries:', error.stack);
    res.status(500).json({ message: 'Error fetching budget entries', error: error.message });
  }
});

app.post('/api/budget-entries', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { project_name, type, amount, interval, month_allocation } = req.body;
  if (!project_name || !type || !amount || !interval || !month_allocation) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO budget_entries(project_name, type, amount, interval, month_allocation) VALUES($1::text, $2::text, $3::numeric, $4::text, $5::text) RETURNING *'
      , [project_name, type, amount, interval, month_allocation]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding budget entry:', error.stack);
    res.status(500).json({ message: 'Error adding budget entry', error: error.message });
  }
});

app.delete('/api/budget-entries/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM budget_entries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Budget entry not found.' });
    }
    res.status(200).json({ message: 'Budget entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting budget entry:', error.stack);
    res.status(500).json({ message: 'Error deleting budget entry', error: error.message });
  }
});

app.delete('/api/budget-entries/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM budget_entries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Budget entry not found.' });
    }
    res.status(200).json({ message: 'Budget entry deleted successfully.' });
  } catch (error) {
    console.error('Error deleting budget entry:', error.stack);
    res.status(500).json({ message: 'Error deleting budget entry', error: error.message });
  }
});

// Operations Data Endpoints
app.get('/api/operations-data', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  try {
    const result = await pool.query('SELECT * FROM operations_data WHERE project_name = $1', [project_name]);
    if (result.rows.length === 0) {
      // Return default empty values if no data exists
      return res.status(200).json({
        project_name,
        project_description: '',
        important_details: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        important_links: []
      });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching operations data:', error.stack);
    res.status(500).json({ message: 'Error fetching operations data', error: error.message });
  }
});

app.put('/api/operations-data', authorizeRole(['admin']), async (req, res) => {
  const { project_name, project_description, important_details, contact_name, contact_phone, contact_email, important_links } = req.body;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO operations_data (project_name, project_description, important_details, contact_name, contact_phone, contact_email, important_links)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (project_name) 
       DO UPDATE SET 
         project_description = EXCLUDED.project_description, 
         important_details = EXCLUDED.important_details, 
         contact_name = EXCLUDED.contact_name, 
         contact_phone = EXCLUDED.contact_phone, 
         contact_email = EXCLUDED.contact_email, 
         important_links = EXCLUDED.important_links
       RETURNING *`,
      [project_name, project_description, important_details, contact_name, contact_phone, contact_email, JSON.stringify(important_links)]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating operations data:', error.stack);
    res.status(500).json({ message: 'Error updating operations data', error: error.message });
  }
});

// Regular Documents Endpoints
app.get('/api/regular-documents', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT id, project_name, file_name, file_path, uploader_username, upload_date, type FROM regular_documents WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching regular documents:', error.stack);
    res.status(500).json({ message: 'Error fetching regular documents', error: error.message });
  }
});

app.get('/api/regular-documents/download', async (req, res) => {
  const { file_path } = req.query;

  if (!file_path) {
    return res.status(400).send('File path is required.');
  }

  try {
    // Retrieve the document metadata and file data from the database
    const result = await pool.query('SELECT file_name, file_data, type FROM regular_documents WHERE file_path = $1', [file_path]);

    if (result.rowCount === 0) {
      return res.status(404).send('File not found.');
    }

    const document = result.rows[0];

    // Set appropriate headers for file download
    res.setHeader('Content-Type', document.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);

    // Send the file data
    res.send(document.file_data);

  } catch (error) {
    console.error('Error downloading regular document:', error.stack);
    res.status(500).send('Error downloading file.');
  }
});

app.post('/api/regular-documents', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  console.log(`Received file: ${req.file.originalname}, size: ${req.file.buffer.length} bytes`);
  const file_path = `/${project_name}/regular_documents/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO regular_documents(project_name, file_name, file_path, uploader_username, type, file_data) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, file_name, file_path, uploader_username, type, req.file.buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding regular document:', error.stack);
    res.status(500).json({ message: 'Error adding regular document', error: error.message });
  }
});

app.delete('/api/regular-documents/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM regular_documents WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json({ message: 'Regular document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting regular document:', error.stack);
    res.status(500).json({ message: 'Error deleting regular document', error: error.message });
  }
});

// Quotes Documents Endpoints
app.get('/api/quotes-documents', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT id, project_name, file_name, file_path, uploader_username, upload_date, type FROM quotes_documents WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching quotes documents:', error.stack);
    res.status(500).json({ message: 'Error fetching quotes documents', error: error.message });
  }
});

app.get('/api/quotes-documents/download', async (req, res) => {
  const { file_path } = req.query;

  if (!file_path) {
    return res.status(400).send('File path is required.');
  }

  try {
    const result = await pool.query('SELECT file_name, file_data, type FROM quotes_documents WHERE file_path = $1', [file_path]);

    if (result.rowCount === 0) {
      return res.status(404).send('File not found.');
    }

    const document = result.rows[0];

    res.setHeader('Content-Type', document.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    res.send(document.file_data);

  } catch (error) {
    console.error('Error downloading quote document:', error.stack);
    res.status(500).send('Error downloading file.');
  }
});

app.post('/api/quotes-documents', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const file_path = `/${project_name}/quotes_documents/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO quotes_documents(project_name, file_name, file_path, uploader_username, type, file_data) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, file_name, file_path, uploader_username, type, req.file.buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding quote document:', error.stack);
    res.status(500).json({ message: 'Error adding quote document', error: error.message });
  }
});

app.delete('/api/quotes-documents/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM quotes_documents WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json({ message: 'Quote document deleted successfully.' });
  } catch (error) {
    console.error('Error deleting quote document:', error.stack);
    res.status(500).json({ message: 'Error deleting quote document', error: error.message });
  }
});

// Important Files Documents Endpoints
app.get('/api/important-files-documents', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT id, project_name, file_name, file_path, uploader_username, upload_date, type FROM important_files_documents WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching important files documents:', error.stack);
    res.status(500).json({ message: 'Error fetching important files documents', error: error.message });
  }
});

app.get('/api/important-files-documents/download', async (req, res) => {
  const { file_path } = req.query;

  if (!file_path) {
    return res.status(400).send('File path is required.');
  }

  try {
    const result = await pool.query('SELECT file_name, file_data, type FROM important_files_documents WHERE file_path = $1', [file_path]);

    if (result.rowCount === 0) {
      return res.status(404).send('File not found.');
    }

    const document = result.rows[0];

    res.setHeader('Content-Type', document.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    res.send(document.file_data);

  } catch (error) {
    console.error('Error downloading important file:', error.stack);
    res.status(500).send('Error downloading file.');
  }
});

app.post('/api/important-files-documents', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const file_path = `/${project_name}/important_files_documents/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO important_files_documents(project_name, file_name, file_path, uploader_username, type, file_data) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, file_name, file_path, uploader_username, type, req.file.buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding important file:', error.stack);
    res.status(500).json({ message: 'Error adding important file', error: error.message });
  }
});

app.delete('/api/important-files-documents/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM important_files_documents WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json({ message: 'Important file deleted successfully.' });
  } catch (error) {
    console.error('Error deleting important file:', error.stack);
    res.status(500).json({ message: 'Error deleting important file', error: error.message });
  }
});

// Important Files Documents Endpoints
app.get('/api/important-files-documents', async (req, res) => {
  const { project_name } = req.query;
  if (!project_name) {
    return res.status(400).json({ message: 'Project name is required.' });
  }
  try {
    const result = await pool.query('SELECT id, project_name, file_name, file_path, uploader_username, upload_date, type FROM important_files_documents WHERE project_name = $1 ORDER BY upload_date DESC', [project_name]);
    res.status(200).json({ documents: result.rows });
  } catch (error) {
    console.error('Error fetching important files documents:', error.stack);
    res.status(500).json({ message: 'Error fetching important files documents', error: error.message });
  }
});

app.get('/api/important-files-documents/download', async (req, res) => {
  const { file_path } = req.query;

  if (!file_path) {
    return res.status(400).send('File path is required.');
  }

  try {
    const result = await pool.query('SELECT file_name, file_data, type FROM important_files_documents WHERE file_path = $1', [file_path]);

    if (result.rowCount === 0) {
      return res.status(404).send('File not found.');
    }

    const document = result.rows[0];

    res.setHeader('Content-Type', document.type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.file_name}"`);
    res.send(document.file_data);

  } catch (error) {
    console.error('Error downloading important file:', error.stack);
    res.status(500).send('Error downloading file.');
  }
});

app.post('/api/important-files-documents', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
  const { project_name, file_name, type } = req.body;
  const uploader_username = req.headers['x-user-username'];

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const file_path = `/${project_name}/important_files_documents/${file_name}`; // Simulate a file path

  if (!project_name || !file_name || !uploader_username || !type) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO important_files_documents(project_name, file_name, file_path, uploader_username, type, file_data) VALUES($1, $2, $3, $4, $5, $6) RETURNING *'
      , [project_name, file_name, file_path, uploader_username, type, req.file.buffer]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding important file:', error.stack);
    res.status(500).json({ message: 'Error adding important file', error: error.message });
  }
});

app.delete('/api/important-files-documents/:id', authorizeRole(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM important_files_documents WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Document not found.' });
    }
    res.status(200).json({ message: 'Important file deleted successfully.' });
  } catch (error) {
    console.error('Error deleting important file:', error.stack);
    res.status(500).json({ message: 'Error deleting important file', error: error.message });
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
app.put('/api/users/:username/password', authorizeRole(['admin', 'internal']), async (req, res) => {
  const { username } = req.params;
  const { oldPassword, newPassword } = req.body;
  const requesterRole = req.headers['x-user-role'];
  const requesterUsername = req.headers['x-user-username'];

  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required.' });
  }

  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Internal users can only change their own password
    if (requesterRole === 'internal' && username !== requesterUsername) {
      return res.status(403).json({ message: 'Forbidden: Internal users can only change their own password.' });
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

module.exports = app;
