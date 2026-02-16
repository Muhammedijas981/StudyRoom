const { pool } = require('../config/database');

const checkUserSchema = async () => {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);
    console.log('Columns in users:', res.rows);
  } catch (err) {
    console.error('Error checking user schema:', err);
  } finally {
    pool.end();
  }
};

checkUserSchema();
