const express = require('express');
const router = express.Router();
const { authorizeRole } = require('../middleware/auth');

// Standard checklist items seeded per-project on first view
const STANDARD_CHECKLIST = [
  // Preparation
  { category: 'Preparation', item_text: 'Proposal developed and sent to client', sort_order: 1 },
  { category: 'Preparation', item_text: 'Budget created from template', sort_order: 2 },
  { category: 'Preparation', item_text: 'Budget vs. actuals chart set up', sort_order: 3 },
  // Social Media Setup
  { category: 'Social Media Setup', item_text: 'Google Voice number created for property', sort_order: 1 },
  { category: 'Social Media Setup', item_text: 'Brand guide created', sort_order: 2 },
  { category: 'Social Media Setup', item_text: 'Instagram account access obtained', sort_order: 3 },
  { category: 'Social Media Setup', item_text: 'Facebook account access obtained', sort_order: 4 },
  { category: 'Social Media Setup', item_text: 'LinkedIn account access obtained', sort_order: 5 },
  { category: 'Social Media Setup', item_text: 'Google Ads account set up', sort_order: 6 },
  { category: 'Social Media Setup', item_text: 'Analytics review completed for all platforms', sort_order: 7 },
  // Social Media Campaigns
  { category: 'Social Media Campaigns', item_text: 'Instagram posting schedule active (3x/week)', sort_order: 1 },
  { category: 'Social Media Campaigns', item_text: 'Facebook posting schedule active (3x/week)', sort_order: 2 },
  { category: 'Social Media Campaigns', item_text: 'LinkedIn posting schedule active (2-3x/week)', sort_order: 3 },
  { category: 'Social Media Campaigns', item_text: 'Google Ads campaigns live', sort_order: 4 },
  { category: 'Social Media Campaigns', item_text: 'Meta paid ads running (Facebook/Instagram)', sort_order: 5 },
  // Apartment Listings
  { category: 'Apartment Listings', item_text: 'Listing content prepared (photos + property details)', sort_order: 1 },
  { category: 'Apartment Listings', item_text: 'Master listing document drafted', sort_order: 2 },
  { category: 'Apartment Listings', item_text: 'Listings approved by Project Lead', sort_order: 3 },
  { category: 'Apartment Listings', item_text: 'Posted to Zillow', sort_order: 4 },
  { category: 'Apartment Listings', item_text: 'Posted to Apartments.com', sort_order: 5 },
  { category: 'Apartment Listings', item_text: 'Posted to Rent.com', sort_order: 6 },
  { category: 'Apartment Listings', item_text: 'Posted to HotPads', sort_order: 7 },
  { category: 'Apartment Listings', item_text: 'Posted to Apartment Guide', sort_order: 8 },
  { category: 'Apartment Listings', item_text: 'All listings verified on each platform', sort_order: 9 },
  // Physical Marketing
  { category: 'Physical Marketing', item_text: 'Billboard companies researched and contacted', sort_order: 1 },
  { category: 'Physical Marketing', item_text: 'Billboard(s) placed', sort_order: 2 },
  { category: 'Physical Marketing', item_text: 'Radio/podcast outreach completed', sort_order: 3 },
  { category: 'Physical Marketing', item_text: 'Newspaper ad(s) placed', sort_order: 4 },
  { category: 'Physical Marketing', item_text: 'Jobsite banner designed and installed', sort_order: 5 },
  { category: 'Physical Marketing', item_text: 'Website access obtained or set up', sort_order: 6 },
  { category: 'Physical Marketing', item_text: 'Community engagement plan in place (if applicable)', sort_order: 7 },
];

module.exports = (pool) => {
  // ─── CHECKLIST ────────────────────────────────────────────────────────────

  router.get('/workflow/checklist', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    try {
      // Seed on first view
      const count = await pool.query(
        'SELECT COUNT(*) FROM project_checklist_items WHERE project_name=$1',
        [project_name]
      );
      if (parseInt(count.rows[0].count, 10) === 0) {
        const values = STANDARD_CHECKLIST.map((item, i) => {
          const offset = i * 3;
          return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
        }).join(', ');
        const params = STANDARD_CHECKLIST.flatMap(item => [project_name, item.category, item.item_text]);
        // Use individual inserts to preserve sort_order cleanly
        for (const item of STANDARD_CHECKLIST) {
          await pool.query(
            'INSERT INTO project_checklist_items(project_name, category, item_text, sort_order) VALUES($1, $2, $3, $4)',
            [project_name, item.category, item.item_text, item.sort_order]
          );
        }
      }

      const result = await pool.query(
        'SELECT * FROM project_checklist_items WHERE project_name=$1 ORDER BY category, sort_order',
        [project_name]
      );
      res.status(200).json({ items: result.rows });
    } catch (error) {
      console.error('Error fetching checklist:', error.stack);
      res.status(500).json({ message: 'Error fetching checklist', error: error.message });
    }
  });

  router.put('/workflow/checklist/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { id } = req.params;
    const { is_checked, assigned_to, item_text } = req.body;
    const username = req.headers['x-user-username'];

    try {
      let result;
      if (assigned_to !== undefined) {
        result = await pool.query(
          `UPDATE project_checklist_items SET assigned_to=$1 WHERE id=$2 RETURNING *`,
          [assigned_to || null, id]
        );
      } else if (item_text !== undefined) {
        result = await pool.query(
          `UPDATE project_checklist_items SET item_text=$1 WHERE id=$2 RETURNING *`,
          [item_text, id]
        );
      } else {
        result = await pool.query(
          `UPDATE project_checklist_items
           SET is_checked=$1, checked_by_username=$2, checked_at=$3
           WHERE id=$4 RETURNING *`,
          [is_checked, is_checked ? username : null, is_checked ? new Date() : null, id]
        );
      }
      if (result.rowCount === 0) return res.status(404).json({ message: 'Checklist item not found.' });
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating checklist item:', error.stack);
      res.status(500).json({ message: 'Error updating checklist item', error: error.message });
    }
  });

  router.post('/workflow/checklist', authorizeRole(['admin']), async (req, res) => {
    const { project_name, category, item_text } = req.body;
    if (!project_name || !category || !item_text) {
      return res.status(400).json({ message: 'project_name, category, and item_text are required.' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO project_checklist_items(project_name, category, item_text, sort_order)
         VALUES($1, $2, $3, 999) RETURNING *`,
        [project_name, category, item_text]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding checklist item:', error.stack);
      res.status(500).json({ message: 'Error adding checklist item', error: error.message });
    }
  });

  router.delete('/workflow/checklist/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM project_checklist_items WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) return res.status(404).json({ message: 'Item not found.' });
      res.status(200).json({ message: 'Deleted.' });
    } catch (error) {
      console.error('Error deleting checklist item:', error.stack);
      res.status(500).json({ message: 'Error deleting checklist item', error: error.message });
    }
  });

  router.delete('/workflow/checklist-category', authorizeRole(['admin']), async (req, res) => {
    const { project_name, category } = req.query;
    if (!project_name || !category) {
      return res.status(400).json({ message: 'project_name and category are required.' });
    }
    try {
      const result = await pool.query(
        'DELETE FROM project_checklist_items WHERE project_name=$1 AND category=$2',
        [project_name, category]
      );
      res.status(200).json({ deleted: result.rowCount });
    } catch (error) {
      console.error('Error deleting checklist category:', error.stack);
      res.status(500).json({ message: 'Error deleting category', error: error.message });
    }
  });

  // ─── BUDGET VS. ACTUALS ───────────────────────────────────────────────────

  router.get('/workflow/budget', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }

    try {
      const budgets = await pool.query(
        'SELECT * FROM project_budgets WHERE project_name=$1 ORDER BY budget_type, category',
        [project_name]
      );

      // Aggregate actual spend from both entry tables
      const socialActuals = await pool.query(
        `SELECT platform AS category, SUM(cost) AS actual_spend
         FROM social_media_entries
         WHERE project_name=$1 AND is_archived=false
         GROUP BY platform`,
        [project_name]
      );
      const physicalActuals = await pool.query(
        `SELECT type AS category, SUM(cost) AS actual_spend
         FROM physical_marketing_entries
         WHERE project_name=$1 AND is_archived=false
         GROUP BY type`,
        [project_name]
      );

      const actuals = {};
      for (const row of [...socialActuals.rows, ...physicalActuals.rows]) {
        actuals[row.category] = parseFloat(row.actual_spend) || 0;
      }

      res.status(200).json({ budgets: budgets.rows, actuals });
    } catch (error) {
      console.error('Error fetching budget:', error.stack);
      res.status(500).json({ message: 'Error fetching budget', error: error.message });
    }
  });

  router.put('/workflow/budget', authorizeRole(['admin']), async (req, res) => {
    const { project_name, category, budget_type, amount, period } = req.body;
    if (!project_name || !category || !budget_type || amount === undefined) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO project_budgets(project_name, category, budget_type, amount, period)
         VALUES($1, $2, $3, $4, $5)
         ON CONFLICT (project_name, category, period)
         DO UPDATE SET amount=$4, budget_type=$3
         RETURNING *`,
        [project_name, category, budget_type, amount, period || 'cadence']
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error saving budget:', error.stack);
      res.status(500).json({ message: 'Error saving budget', error: error.message });
    }
  });

  router.delete('/workflow/budget/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM project_budgets WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Budget line not found.' });
      }
      res.status(200).json({ message: 'Budget line deleted.' });
    } catch (error) {
      console.error('Error deleting budget:', error.stack);
      res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
  });

  // ─── APARTMENT LISTINGS ───────────────────────────────────────────────────

  router.get('/workflow/listings', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM apartment_listings WHERE project_name=$1 ORDER BY platform',
        [project_name]
      );
      res.status(200).json({ listings: result.rows });
    } catch (error) {
      console.error('Error fetching listings:', error.stack);
      res.status(500).json({ message: 'Error fetching listings', error: error.message });
    }
  });

  router.post('/workflow/listings', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { project_name, platform, status, listing_url, posted_date, notes } = req.body;
    const created_by_username = req.headers['x-user-username'];
    if (!project_name || !platform || !created_by_username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO apartment_listings(project_name, platform, status, listing_url, posted_date, notes, created_by_username)
         VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [project_name, platform, status || 'Pending', listing_url || null, posted_date || null, notes || null, created_by_username]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error adding listing:', error.stack);
      res.status(500).json({ message: 'Error adding listing', error: error.message });
    }
  });

  router.put('/workflow/listings/:id', authorizeRole(['admin', 'internal']), async (req, res) => {
    const { id } = req.params;
    const { platform, status, listing_url, posted_date, notes } = req.body;
    try {
      const result = await pool.query(
        `UPDATE apartment_listings
         SET platform=$1, status=$2, listing_url=$3, posted_date=$4, notes=$5, updated_at=NOW()
         WHERE id=$6 RETURNING *`,
        [platform, status, listing_url || null, posted_date || null, notes || null, id]
      );
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Listing not found.' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error updating listing:', error.stack);
      res.status(500).json({ message: 'Error updating listing', error: error.message });
    }
  });

  router.delete('/workflow/listings/:id', authorizeRole(['admin']), async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM apartment_listings WHERE id=$1 RETURNING id', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Listing not found.' });
      }
      res.status(200).json({ message: 'Listing deleted.' });
    } catch (error) {
      console.error('Error deleting listing:', error.stack);
      res.status(500).json({ message: 'Error deleting listing', error: error.message });
    }
  });

  // ─── TEAM ROLE ASSIGNMENTS ────────────────────────────────────────────────

  router.get('/workflow/team', async (req, res) => {
    const { project_name } = req.query;
    if (!project_name) {
      return res.status(400).json({ message: 'Project name is required.' });
    }
    try {
      const result = await pool.query(
        'SELECT * FROM project_team_roles WHERE project_name=$1 ORDER BY djc_role',
        [project_name]
      );
      res.status(200).json({ team: result.rows });
    } catch (error) {
      console.error('Error fetching team:', error.stack);
      res.status(500).json({ message: 'Error fetching team', error: error.message });
    }
  });

  router.put('/workflow/team', authorizeRole(['admin']), async (req, res) => {
    const { project_name, djc_role, assigned_username } = req.body;
    const assigned_by = req.headers['x-user-username'];
    if (!project_name || !djc_role) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
      const result = await pool.query(
        `INSERT INTO project_team_roles(project_name, djc_role, assigned_username, assigned_by_username, assigned_at)
         VALUES($1, $2, $3, $4, NOW())
         ON CONFLICT (project_name, djc_role)
         DO UPDATE SET assigned_username=$3, assigned_by_username=$4, assigned_at=NOW()
         RETURNING *`,
        [project_name, djc_role, assigned_username || null, assigned_by]
      );
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Error assigning team role:', error.stack);
      res.status(500).json({ message: 'Error assigning team role', error: error.message });
    }
  });

  return router;
};
