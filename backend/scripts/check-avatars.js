const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/database');

const checkAvatars = async () => {
  try {
    const res = await pool.query('SELECT full_name, avatar_url FROM users WHERE avatar_url IS NOT NULL');
    console.log('Users with avatars:', res.rows);
  } catch (err) {
    console.error('Error querying avatars:', err);
  } finally {
    pool.end();
  }
};

checkAvatars();
