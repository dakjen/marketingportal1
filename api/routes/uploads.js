const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authorizeRole } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

module.exports = (pool) => {
  // --- Social Media Uploads ---

  router.get('/socialmedia/uploads', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM social_media_uploads WHERE project_name = $1 ORDER BY upload_date DESC',
        [project_name]
      );
      res.status(200).json({ uploads: result.rows });
    } catch (error) {
      console.error('Error fetching social media uploads:', error.stack);
      res.status(500).json({ message: 'Error fetching social media uploads', error: error.message });
    }
  });

  router.post('/socialmedia/uploads', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
    const { project_name, file_name, type } = req.body;
    const uploader_username = req.headers['x-user-username'];
    if (!project_name || !file_name || !uploader_username || !type) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const file_path = `/${project_name}/socialmedia/${file_name}`;
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

  router.delete('/socialmedia/uploads/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM social_media_uploads WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Upload not found.' });
      }
      res.status(200).json({ message: 'Social media upload deleted successfully.' });
    } catch (error) {
      console.error('Error deleting social media upload:', error.stack);
      res.status(500).json({ message: 'Error deleting social media upload', error: error.message });
    }
  });

  // --- Physical Marketing Uploads ---

  router.get('/physicalmarketing/uploads', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM physical_marketing_uploads WHERE project_name = $1 ORDER BY upload_date DESC',
        [project_name]
      );
      res.status(200).json({ uploads: result.rows });
    } catch (error) {
      console.error('Error fetching physical marketing uploads:', error.stack);
      res.status(500).json({ message: 'Error fetching physical marketing uploads', error: error.message });
    }
  });

  router.post('/physicalmarketing/uploads', authorizeRole(['admin', 'internal']), upload.single('file'), async (req, res) => {
    const { project_name, file_name, type } = req.body;
    const uploader_username = req.headers['x-user-username'];
    if (!project_name || !file_name || !uploader_username || !type) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const file_path = `/${project_name}/physicalmarketing/${file_name}`;
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

  router.delete('/physicalmarketing/uploads/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM physical_marketing_uploads WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Upload not found.' });
      }
      res.status(200).json({ message: 'Physical marketing upload deleted successfully.' });
    } catch (error) {
      console.error('Error deleting physical marketing upload:', error.stack);
      res.status(500).json({ message: 'Error deleting physical marketing upload', error: error.message });
    }
  });

  return router;
};
