const { pool } = require('./db');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Sites Controllers
const getAllSites = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grm_sites ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createSite = async (req, res) => {
  try {
    const { sites } = req.body;
    if (!sites) {
      return res.status(400).json({ success: false, error: 'Site name is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO grm_sites (sites) VALUES ($1) RETURNING *',
      [sites]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM grm_sites WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Site not found' });
    }
    
    res.json({ success: true, message: 'Site deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Violations Controllers
const getAllViolations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grm_violations ORDER BY id ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createViolation = async (req, res) => {
  try {
    const { violations } = req.body;
    if (!violations) {
      return res.status(400).json({ success: false, error: 'Violation is required' });
    }
    
    const result = await pool.query(
      'INSERT INTO grm_violations (violations) VALUES ($1) RETURNING *',
      [violations]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM grm_violations WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Violation not found' });
    }
    
    res.json({ success: true, message: 'Violation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateViolationOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { violations } = req.body;
    
    await client.query('BEGIN');
    
    for (let i = 0; i < violations.length; i++) {
      await client.query(
        'UPDATE grm_violations SET violations = $1 WHERE id = $2',
        [violations[i].violations, violations[i].id]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Violation order updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

// Checklist Controllers
const getAllChecklists = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
        COUNT(cp.id) as total_items,
        COUNT(CASE WHEN cp.is_checked = true THEN 1 END) as completed_items
      FROM grm_checklist c
      LEFT JOIN grm_checklist_progress cp ON c.id = cp.checklist_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT c.*, 
        v.id as violation_id, 
        v.violations,
        cp.is_checked,
        cp.checked_at,
        cp.notes
      FROM grm_checklist c
      LEFT JOIN unnest(c.violations) WITH ORDINALITY t(violation_id, ord) ON true
      LEFT JOIN grm_violations v ON v.id = t.violation_id
      LEFT JOIN grm_checklist_progress cp ON cp.checklist_id = c.id AND cp.violation_id = v.id
      WHERE c.id = $1
      ORDER BY t.ord
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Checklist not found' });
    }
    
    // Group the results
    const checklist = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      site: result.rows[0].site,
      img_url: result.rows[0].img_url,
      created_at: result.rows[0].created_at,
      updated_at: result.rows[0].updated_at,
      items: result.rows.map(row => ({
        violation_id: row.violation_id,
        violations: row.violations,
        is_checked: row.is_checked || false,
        checked_at: row.checked_at,
        notes: row.notes
      }))
    };
    
    res.json({ success: true, data: checklist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const createChecklist = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, site, violations } = req.body; // Accept both violations and criterias for compatibility
    const img_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    console.log('Request body:', req.body); // Debug log
    console.log('File:', req.file); // Debug log
    
    if (!name || !site) {
      return res.status(400).json({ success: false, error: 'Name and site are required' });
    }
    
    await client.query('BEGIN');
    
    // Get all violation IDs if not provided
    let violationIds = violations;
    if (!violationIds) {
      const allViolationsResult = await client.query('SELECT id FROM grm_violations ORDER BY id ASC');
      violationIds = allViolationsResult.rows.map(v => v.id);
    }
    
    console.log('Using violation IDs:', violationIds); // Debug log
    
    // Create checklist
    const result = await client.query(
      'INSERT INTO grm_checklist (name, site, img_url, violations) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, site, img_url, violationIds]
    );
    
    const checklistId = result.rows[0].id;
    console.log('Created checklist with ID:', checklistId); // Debug log
    
    // Initialize progress entries for each violation
    for (const violationId of violationIds) {
      await client.query(
        'INSERT INTO grm_checklist_progress (checklist_id, violation_id, is_checked) VALUES ($1, $2, false)',
        [checklistId, violationId]
      );
    }
    
    await client.query('COMMIT');
    console.log('Checklist created successfully'); // Debug log
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating checklist:', error); // Debug log
    res.status(500).json({ success: false, error: error.message });
  } finally {
    client.release();
  }
};

const updateChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, site, violations } = req.body; // Accept violations
    const img_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    let updateQuery = 'UPDATE grm_checklist SET ';
    let updateParams = [];
    let updateFields = [];
    let paramCount = 1;
    
    if (name) {
      updateFields.push(`name = $${paramCount}`);
      updateParams.push(name);
      paramCount++;
    }
    
    if (site) {
      updateFields.push(`site = $${paramCount}`);
      updateParams.push(site);
      paramCount++;
    }
    
    if (violations) {
      updateFields.push(`violations = $${paramCount}`);
      updateParams.push(violations);
      paramCount++;
    }
    
    if (img_url) {
      updateFields.push(`img_url = $${paramCount}`);
      updateParams.push(img_url);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }
    
    updateQuery += updateFields.join(', ') + ` WHERE id = $${paramCount} RETURNING *`;
    updateParams.push(id);
    
    const result = await pool.query(updateQuery, updateParams);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Checklist not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM grm_checklist WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: 'Checklist not found' });
    }
    
    res.json({ success: true, message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Checklist Progress Controllers
const updateChecklistProgress = async (req, res) => {
  try {
    const { checklistId, violationId } = req.params;
    const { is_checked, notes } = req.body;
    
    const checked_at = is_checked ? 'CURRENT_TIMESTAMP' : null;
    
    const result = await pool.query(`
      INSERT INTO grm_checklist_progress (checklist_id, violation_id, is_checked, checked_at, notes)
      VALUES ($1, $2, $3, ${checked_at}, $4)
      ON CONFLICT (checklist_id, violation_id)
      DO UPDATE SET 
        is_checked = $3,
        checked_at = ${checked_at},
        notes = $4,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [checklistId, violationId, is_checked, notes || null]);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getChecklistProgress = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const result = await pool.query(`
      SELECT cp.*, v.violations
      FROM grm_checklist_progress cp
      JOIN grm_violations v ON cp.violation_id = v.id
      WHERE cp.checklist_id = $1
      ORDER BY cp.violation_id
    `, [checklistId]);
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const resetChecklistProgress = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const result = await pool.query(`
      UPDATE grm_checklist_progress 
      SET is_checked = false, checked_at = null, notes = null, updated_at = CURRENT_TIMESTAMP
      WHERE checklist_id = $1
    `, [checklistId]);
    
    res.json({ success: true, message: 'Checklist progress reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  upload,
  // Sites
  getAllSites,
  createSite,
  deleteSite,
  // Violations
  getAllViolations,
  createViolation,
  deleteViolation,
  updateViolationOrder,
  // Checklists
  getAllChecklists,
  getChecklistById,
  createChecklist,
  updateChecklist,
  deleteChecklist,
  // Checklist Progress
  updateChecklistProgress,
  getChecklistProgress,
  resetChecklistProgress
};