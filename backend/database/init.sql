-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(255),
  major VARCHAR(255),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Study Rooms Table
CREATE TABLE IF NOT EXISTS study_rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  max_capacity INTEGER DEFAULT 10,
  cover_image VARCHAR(512),
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room Members Table (Many-to-Many: User <-> Room)
CREATE TABLE IF NOT EXISTS room_members (
  room_id INTEGER REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, user_id)
);

-- Materials Table
CREATE TABLE IF NOT EXISTS room_materials (
  id SERIAL PRIMARY KEY,
  room_id INTEGER REFERENCES study_rooms(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Saved Materials Table (User Bookmarks)
CREATE TABLE IF NOT EXISTS saved_materials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES room_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, material_id)
);

-- Material Reports Table
CREATE TABLE IF NOT EXISTS material_reports (
  id SERIAL PRIMARY KEY,
  material_id INTEGER REFERENCES room_materials(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
