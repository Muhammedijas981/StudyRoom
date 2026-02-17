const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('Running migration: Create material_reports table...');
    
    // Drop table if exists to ensure clean state
    await pool.query(`DROP TABLE IF EXISTS material_reports;`);
    
    await pool.query(`
      CREATE TABLE material_reports (
        id SERIAL PRIMARY KEY,
        material_id INTEGER REFERENCES room_materials(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
};

runMigration();
