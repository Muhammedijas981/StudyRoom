const { pool } = require('../config/database');

const checkTableContent = async () => {
  try {
    const res = await pool.query('SELECT * FROM room_materials');
    console.log('Materials count:', res.rowCount);
  } catch (err) {
    console.error('Error querying materials:', err);
  } finally {
    pool.end();
  }
};

checkTableContent();
