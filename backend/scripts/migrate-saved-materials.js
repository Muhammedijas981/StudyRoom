const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('../config/database');

const migrateSavedMaterials = async () => {
    try {
        console.log('Migrating saved_materials table...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS saved_materials (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                material_id INTEGER REFERENCES room_materials(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, material_id)
            );
        `);

        console.log('Saved materials table migration completed successfully');
    } catch (err) {
        console.error('Saved materials migration failed:', err);
    } finally {
        pool.end();
    }
};

migrateSavedMaterials();
