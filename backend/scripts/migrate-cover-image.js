const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('Running migration: Add cover_image column...');
    
    await pool.query(`
      ALTER TABLE study_rooms 
      ADD COLUMN IF NOT EXISTS cover_image VARCHAR(512);
    `);
    
    console.log('✅ Migration applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
};

runMigration();
