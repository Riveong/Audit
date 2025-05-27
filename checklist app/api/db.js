const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'checklist_app',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize database tables
async function initDB() {
  const client = await pool.connect();
  
  try {
    // Create grm_sites table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grm_sites (
        id SERIAL PRIMARY KEY,
        sites TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Rename grm_criterions to grm_violations
    await client.query(`
      CREATE TABLE IF NOT EXISTS grm_violations (
        id SERIAL PRIMARY KEY,
        violations TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create grm_checklist table (updated to reference violations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS grm_checklist (
        id SERIAL PRIMARY KEY,
        violations INTEGER[],
        site TEXT NOT NULL,
        img_url TEXT,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create grm_checklist_progress table (updated to reference violations)
    await client.query(`
      CREATE TABLE IF NOT EXISTS grm_checklist_progress (
        id SERIAL PRIMARY KEY,
        checklist_id INTEGER REFERENCES grm_checklist(id) ON DELETE CASCADE,
        violation_id INTEGER REFERENCES grm_violations(id) ON DELETE CASCADE,
        is_checked BOOLEAN DEFAULT FALSE,
        checked_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(checklist_id, violation_id)
      )
    `);

    // Create update triggers
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_grm_checklist_updated_at ON grm_checklist;
      CREATE TRIGGER update_grm_checklist_updated_at
        BEFORE UPDATE ON grm_checklist
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_grm_checklist_progress_updated_at ON grm_checklist_progress;
      CREATE TRIGGER update_grm_checklist_progress_updated_at
        BEFORE UPDATE ON grm_checklist_progress
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Insert default sites if table is empty
    const siteResult = await client.query('SELECT COUNT(*) FROM grm_sites');
    if (parseInt(siteResult.rows[0].count) === 0) {
      const defaultSites = ['Personal', 'Office', 'Grocery Store', 'Home', 'Gym', 'School'];
      for (const site of defaultSites) {
        await client.query('INSERT INTO grm_sites (sites) VALUES ($1)', [site]);
      }
    }

    // Insert default violations if table is empty
    const violationsResult = await client.query('SELECT COUNT(*) FROM grm_violations');
    if (parseInt(violationsResult.rows[0].count) === 0) {
      const defaultViolations = [
        'Equipment not properly maintained',
        'Safety protocols not followed',
        'Documentation incomplete or missing',
        'Work area not clean or organized',
        'Standard procedures not adhered to',
        'Personal protective equipment not used',
        'Emergency exits blocked or unmarked'
      ];
      for (const violation of defaultViolations) {
        await client.query('INSERT INTO grm_violations (violations) VALUES ($1)', [violation]);
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, initDB };