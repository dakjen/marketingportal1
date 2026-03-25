const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit');
const { authorizeRole } = require('../middleware/auth');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const USER_PROMPT = 'Summarize analytics data gathered within these dates and present analytics data for all platforms and categories included within that date range. Please highlight any wins or significant changes in data.';

module.exports = (pool) => {
  router.post('/generate-report', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { reportType, startDate, endDate, project_name } = req.body;

    if (!reportType || !project_name) {
      return res.status(400).json({ message: 'Missing required fields: reportType, project_name.' });
    }

    let dataForAI = [];
    try {
      if (reportType === 'socialMedia' || reportType === 'general') {
        const socialResult = await pool.query(
          'SELECT * FROM social_media_entries WHERE project_name=$1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
          [project_name, startDate, endDate]
        );
        dataForAI = dataForAI.concat(socialResult.rows);
      }
      if (reportType === 'physicalMarketing' || reportType === 'general') {
        const physicalResult = await pool.query(
          'SELECT * FROM physical_marketing_entries WHERE project_name=$1 AND date BETWEEN $2 AND $3 ORDER BY date DESC',
          [project_name, startDate, endDate]
        );
        dataForAI = dataForAI.concat(physicalResult.rows);
      }

      if (dataForAI.length === 0) {
        return res.status(404).json({ message: 'No data found for the selected criteria.' });
      }

      const fullPrompt = `Generate a ${reportType} report for project ${project_name} from ${startDate} to ${endDate}. Analyze the following data and respond to the user's prompt: "${USER_PROMPT}".\n\nData: ${JSON.stringify(dataForAI)}`;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      res.status(200).json({ report: response.text() });
    } catch (error) {
      console.error('Error generating AI report:', error.stack);
      res.status(500).json({ message: 'Error generating AI report', error: error.message });
    }
  });

  router.post('/save-report', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { reportContent, reportName, reportType, project_name } = req.body;
    const uploader_username = req.headers['x-user-username'];

    if (!reportContent || !reportName || !reportType || !project_name || !uploader_username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      const doc = new PDFDocument();
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
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

  router.get('/generated-reports', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM generated_reports WHERE project_name=$1 ORDER BY generation_date DESC',
        [project_name]
      );
      res.status(200).json({ reports: result.rows });
    } catch (error) {
      console.error('Error fetching generated reports:', error.stack);
      res.status(500).json({ message: 'Error fetching generated reports', error: error.message });
    }
  });

  router.get('/generated-reports/:id/view', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT file_path FROM generated_reports WHERE id=$1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Report not found.' });
      }
      const report = result.rows[0];
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

  router.delete('/generated-reports/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM generated_reports WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Report not found.' });
      }
      res.status(200).json({ message: 'Generated report deleted successfully.' });
    } catch (error) {
      console.error('Error deleting generated report:', error.stack);
      res.status(500).json({ message: 'Error deleting generated report', error: error.message });
    }
  });

  return router;
};
