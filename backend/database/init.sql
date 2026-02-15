-- Create Database (run this separately if needed)
-- CREATE DATABASE studyroom_db;

-- Connect to the database
\c studyroom_db;

-- This is a placeholder file for your database schema
-- You can add your tables here when you're ready to build the features

-- Example: Create a simple test table to verify connection
CREATE TABLE IF NOT EXISTS connection_test (
  id SERIAL PRIMARY KEY,
  message VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test record
INSERT INTO connection_test (message) VALUES ('Database connection successful!');

-- Verify
SELECT * FROM connection_test;
