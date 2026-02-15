const { pool } = require('../config/database');

const runMigration = async () => {
  try {
    console.log('Running migration: Create room_members table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_members (
        room_id INTEGER REFERENCES study_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, user_id)
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
