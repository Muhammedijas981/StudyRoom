-- Create Database (run this separately if needed)
-- CREATE DATABASE studyroom_db;

-- Connect to the database
-- \c studyroom_db;

-- This is a placeholder file for your database schema
-- You can add your tables here when you're ready to build the features

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert a test user (password: 'password123')
-- Note: In a real app, passwords should be hashed. This is just for initial schema verification if needed manually.
-- INSERT INTO users (full_name, email, password_hash) VALUES ('Test User', 'test@example.com', '$2b$10$YourHashedPasswordHere');

-- Verify
SELECT * FROM users;
