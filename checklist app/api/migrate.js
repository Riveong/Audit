const { pool } = require('./db');

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');
    
    // Check if old tables exist and rename them
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'grm_criterions'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Renaming grm_criterions to grm_violations...');
      await client.query('ALTER TABLE grm_criterions RENAME TO grm_violations');
      await client.query('ALTER TABLE grm_violations RENAME COLUMN criterias TO violations');
    }
    
    // Check if old column exists in checklist table
    const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'grm_checklist' 
        AND column_name = 'criterias'
      );
    `);
    
    if (columnExists.rows[0].exists) {
      console.log('Renaming criterias column to violations...');
      await client.query('ALTER TABLE grm_checklist RENAME COLUMN criterias TO violations');
    }
    
    // Check if old column exists in progress table
    const progressColumnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'grm_checklist_progress' 
        AND column_name = 'criterion_id'
      );
    `);
    
    if (progressColumnExists.rows[0].exists) {
      console.log('Renaming criterion_id column to violation_id...');
      await client.query('ALTER TABLE grm_checklist_progress RENAME COLUMN criterion_id TO violation_id');
    }
    
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateDatabase()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateDatabase };