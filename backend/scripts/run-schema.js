const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, '../database/init.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema...');
    
    // Split by semicolons to run individual queries if needed, 
    // but pool.query can often handle multiple statements if configured (though sometimes strictly one).
    // Let's try running it as one block first.
    await pool.query(schemaSql);
    
    console.log('✅ Schema applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
};

runSchema();
