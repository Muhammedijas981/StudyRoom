const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const runSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, '../database/init.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Running schema...');
    
    // Remove comments and split by semicolon
    const cleanSql = schemaSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comment lines
      .join('\n');

    const queries = cleanSql
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    for (const query of queries) {
      await pool.query(query);
    }
    
    console.log('✅ Schema applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
};

runSchema();
