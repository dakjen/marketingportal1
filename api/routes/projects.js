const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/auth');

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, name, is_archived FROM projects ORDER BY name');
      res.status(200).json({ projects: result.rows });
    } catch (error) {
      console.error('Error fetching projects:', error.stack);
      res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
  });

  router.post('/', authorizeRole(['admin']), async (req, res) => {
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
      } catch (adminUpdateError) {
        console.error('Error updating admin permissions for new project:', adminUpdateError.stack);
      }
    } catch (error) {
      console.error('Error adding project:', error.stack);
      if (error.code === '23505') {
        return res.status(409).json({ message: 'Project with this name already exists.' });
      }
      res.status(500).json({ message: 'Error adding project', error: error.message });
    }
  });

  router.delete('/:name', authorizeRole(['admin']), async (req, res) => {
    const { name } = req.params;
    try {
      const result = await pool.query('DELETE FROM projects WHERE name = $1 RETURNING name', [name]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Project not found.' });
      }
      res.status(200).json({ message: `Project ${name} deleted successfully.` });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: 'Error deleting project', error: error.message });
    }
  });

  return router;
};
