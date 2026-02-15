const { pool } = require('../config/database');

const createMaterialsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS room_materials (
        id SERIAL PRIMARY KEY,
        room_id INTEGER REFERENCES study_rooms(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Materials table created successfully');
  } catch (err) {
    console.error('Error creating materials table:', err);
  } finally {
    pool.end();
  }
};

createMaterialsTable();
