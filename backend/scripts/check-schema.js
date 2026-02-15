const { pool } = require('../config/database');

const checkSchema = async () => {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Tables:', res.rows.map(r => r.table_name));

    const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'room_materials';
    `);
    console.log('Columns in room_materials:', columns.rows);
    
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    pool.end();
  }
};

checkSchema();
