const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function createAuthTables() {
  const client = await pool.connect();
  
  try {
    console.log('Creating authentication tables...');
    
    // Create grm_pic table
    await client.query(`
      CREATE TABLE IF NOT EXISTS grm_pic (
        id SERIAL PRIMARY KEY,
        empid TEXT UNIQUE NOT NULL
      )
    `);
    console.log('grm_pic table created');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        empid TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);
    console.log('users table created');

    // Insert admin if not exists
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query('INSERT INTO grm_pic (empid) VALUES ($1) ON CONFLICT DO NOTHING', ['admin']);
    await client.query('INSERT INTO users (empid, password) VALUES ($1, $2) ON CONFLICT DO NOTHING', ['admin', hashedPassword]);

    console.log('Auth tables ready');
  } catch (error) {
    console.error('Auth setup error:', error);
  } finally {
    client.release();
  }
}

module.exports = { createAuthTables };