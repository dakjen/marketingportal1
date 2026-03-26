const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/auth');

module.exports = (pool) => {
  // --- Social Media Entries ---

  router.get('/socialmediaentries', async (req, res) => {
    const { project_name } = req.query;
    const userRole = req.headers['x-user-role'];
    const allowedProjects = req.headers['x-user-allowed-projects']
      ? JSON.parse(req.headers['x-user-allowed-projects'])
      : [];

    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    if (userRole === 'external' && !allowedProjects.includes(project_name)) {
      return res.status(403).json({ message: 'Forbidden: Not allowed to view entries for this project.' });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM social_media_entries WHERE project_name = $1 ORDER BY date DESC',
        [project_name]
      );
      res.status(200).json({ entries: result.rows });
    } catch (error) {
      console.error('Error fetching social media entries:', error.stack);
      res.status(500).json({ message: 'Error fetching social media entries', error: error.message });
    }
  });

  router.post('/socialmediaentries', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name, date, cost, platform, username, notes } = req.body;
    if (!project_name || !date || !cost || !platform || !username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO social_media_entries(project_name, date, cost, platform, username, notes) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
        [project_name, date, cost, platform, username, notes]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding social media entry:', error.stack);
      res.status(500).json({ message: 'Error adding social media entry', error: error.message });
    }
  });

  router.put('/socialmediaentries/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { id } = req.params;
    const { project_name, date, cost, platform, username, notes } = req.body;
    if (!project_name || !date || !cost || !platform || !username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        'UPDATE social_media_entries SET project_name=$1, date=$2, cost=$3, platform=$4, username=$5, notes=$6 WHERE id=$7 RETURNING *',
        [project_name, date, cost, platform, username, notes, id]
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

  router.delete('/socialmediaentries/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM social_media_entries WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entry not found.' });
      }
      res.status(200).json({ message: 'Social media entry deleted successfully.' });
    } catch (error) {
      console.error('Error deleting social media entry:', error.stack);
      res.status(500).json({ message: 'Error deleting social media entry', error: error.message });
    }
  });

  // --- Physical Marketing Entries ---

  router.get('/physicalmarketingentries', async (req, res) => {
    const { project_name } = req.query;
    const userRole = req.headers['x-user-role'];
    const allowedProjects = req.headers['x-user-allowed-projects']
      ? JSON.parse(req.headers['x-user-allowed-projects'])
      : [];

    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    if (userRole === 'external' && !allowedProjects.includes(project_name)) {
      return res.status(403).json({ message: 'Forbidden: Not allowed to view entries for this project.' });
    }

    try {
      const result = await pool.query(
        'SELECT * FROM physical_marketing_entries WHERE project_name = $1 ORDER BY date DESC',
        [project_name]
      );
      res.status(200).json({ entries: result.rows });
    } catch (error) {
      console.error('Error fetching physical marketing entries:', error.stack);
      res.status(500).json({ message: 'Error fetching physical marketing entries', error: error.message });
    }
  });

  router.post('/physicalmarketingentries', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name, date, cost, type, length_of_time, username, notes } = req.body;
    if (!project_name || !date || !cost || !type || !length_of_time || !username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        'INSERT INTO physical_marketing_entries(project_name, date, cost, type, length_of_time, username, notes) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [project_name, date, cost, type, length_of_time, username, notes]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding physical marketing entry:', error.stack);
      res.status(500).json({ message: 'Error adding physical marketing entry', error: error.message });
    }
  });

  router.put('/physicalmarketingentries/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { id } = req.params;
    const { project_name, date, cost, type, length_of_time, username, notes } = req.body;
    if (!project_name || !date || !cost || !type || !length_of_time || !username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        'UPDATE physical_marketing_entries SET project_name=$1, date=$2, cost=$3, type=$4, length_of_time=$5, username=$6, notes=$7 WHERE id=$8 RETURNING *',
        [project_name, date, cost, type, length_of_time, username, notes, id]
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

  router.delete('/physicalmarketingentries/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM physical_marketing_entries WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entry not found.' });
      }
      res.status(200).json({ message: 'Physical marketing entry deleted successfully.' });
    } catch (error) {
      console.error('Error deleting physical marketing entry:', error.stack);
      res.status(500).json({ message: 'Error deleting physical marketing entry', error: error.message });
    }
  });

  // --- Archive ---

  router.put('/entries/:entryType/:id/archive', authorizeRole(['admin']), async (req, res) => {
    const { entryType, id } = req.params;
    const tableMap = { social: 'social_media_entries', physical: 'physical_marketing_entries' };
    const tableName = tableMap[entryType];
    if (!tableName) {
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

  return router;
};
