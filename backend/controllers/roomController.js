const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

// @route   POST api/rooms
// @desc    Create a new study room
// @access  Private
exports.createRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, topic, description, max_capacity } = req.body;
  const cover_image = req.file ? req.file.path.replace(/\\/g, "/") : null; // Normalize path

  // Validate max_capacity range
  const capacity = parseInt(max_capacity) || 10;
  if (capacity < 2 || capacity > 50) {
    return res.status(400).json({ errors: [{ msg: 'Max capacity must be between 2 and 50' }] });
  }

  try {
    const newRoom = await pool.query(
      'INSERT INTO study_rooms (name, topic, description, max_capacity, cover_image, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, topic, description, capacity, cover_image, req.user.id]
    );

    res.json(newRoom.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all study rooms with optional search (name or topic)
// @access  Public (or Private if preferred)
// Get all rooms (with member count)
exports.getAllRooms = async (req, res) => {
  const { search } = req.query;
  const userId = req.user ? req.user.id : null;

  try {
    let query = `
      SELECT 
        s.*, 
        u.full_name as creator_name,
        (SELECT COUNT(rm.user_id) FROM room_members rm WHERE rm.room_id = s.id) as current_members
        ${userId ? `, (SELECT EXISTS(SELECT 1 FROM room_members rm2 WHERE rm2.room_id = s.id AND rm2.user_id = $${search ? 2 : 1})) as is_member` : ''}
      FROM study_rooms s 
      LEFT JOIN users u ON s.created_by = u.id
    `;
    let params = [];
    if (userId) {
        params.push(userId);
    }
    if (search) {
      query += ` WHERE s.name ILIKE $${params.length + 1} OR s.topic ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY s.created_at DESC';
    const rooms = await pool.query(query, params);
    res.json(rooms.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Public
exports.getRoomById = async (req, res) => {
  try {
    const room = await pool.query(`
      SELECT 
        s.*, 
        u.full_name as creator_name,
        (SELECT COUNT(rm.user_id) FROM room_members rm WHERE rm.room_id = s.id) as current_members,
        (
            SELECT json_agg(json_build_object('id', u2.id, 'full_name', u2.full_name, 'avatar_url', u2.avatar_url))
            FROM room_members rm2
            JOIN users u2 ON rm2.user_id = u2.id
            WHERE rm2.room_id = s.id
        ) as members
      FROM study_rooms s 
      LEFT JOIN users u ON s.created_by = u.id 
      WHERE s.id = $1
    `, [req.params.id]);

    if (room.rows.length === 0) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if current user is a member
    let isMember = false;
    if (req.user) {
        const checkMember = await pool.query('SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        isMember = checkMember.rows.length > 0;
    }

    res.json({ ...room.rows[0], is_member: isMember });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Join a room
exports.joinRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;

        // Check if room exists and get capacity
        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        
        // Check if already a member
        const existingMember = await pool.query('SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);
        if (existingMember.rows.length > 0) {
            return res.status(400).json({ msg: 'Already a member of this room' });
        }

        // Check capacity
        const memberCount = await pool.query('SELECT COUNT(*) FROM room_members WHERE room_id = $1', [roomId]);
        if (parseInt(memberCount.rows[0].count) >= room.rows[0].max_capacity) {
            return res.status(400).json({ msg: 'Room is full' });
        }

        // Add member
        await pool.query('INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)', [roomId, userId]);

        res.json({ msg: 'Joined room successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Update a room
exports.updateRoom = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, topic, description, max_capacity } = req.body;
    const cover_image = req.file ? req.file.path.replace(/\\/g, "/") : undefined; // Undefined means no change

    try {
        const roomId = req.params.id;
        const userId = req.user.id;

        // Check ownership
        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        if (room.rows[0].created_by !== userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Validate max_capacity range if provided
        let capacity = room.rows[0].max_capacity;
        if (max_capacity) {
            capacity = parseInt(max_capacity);
            if (capacity < 2 || capacity > 50) {
                return res.status(400).json({ errors: [{ msg: 'Max capacity must be between 2 and 50' }] });
            }
        }

        // Construct update query dynamically
        let updateQuery = 'UPDATE study_rooms SET name = $1, topic = $2, description = $3, max_capacity = $4';
        let queryParams = [
            name || room.rows[0].name,
            topic || room.rows[0].topic,
            description || room.rows[0].description,
            capacity
        ];
        
        if (cover_image) {
            updateQuery += ', cover_image = $5';
            queryParams.push(cover_image);
        }
        
        updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING *`;
        queryParams.push(roomId);

        const updatedRoom = await pool.query(updateQuery, queryParams);
        
        res.json(updatedRoom.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Leave a room
exports.leaveRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;

        // Check if room exists
        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Remove member
        await pool.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);

        res.json({ msg: 'Left room successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Upload material
exports.uploadMaterial = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;
        
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const filePath = req.file.path.replace(/\\/g, "/");
        const fileName = req.file.originalname;
        const fileSize = req.file.size;

        // Check if user is member (optional, but good practice)
        const isMember = await pool.query('SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);
        const isOwner = await pool.query('SELECT * FROM study_rooms WHERE id = $1 AND created_by = $2', [roomId, userId]);

        if (isMember.rows.length === 0 && isOwner.rows.length === 0) {
            return res.status(403).json({ msg: 'Not authorized to upload to this room' });
        }

        const newMaterial = await pool.query(
            'INSERT INTO room_materials (room_id, user_id, file_name, file_path, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [roomId, userId, fileName, filePath, fileSize]
        );

        // Fetch user name for response
        const user = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
        
        const material = {
            ...newMaterial.rows[0],
            uploaded_by_name: user.rows[0].full_name
        };

        res.json(material);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Get materials
exports.getMaterials = async (req, res) => {
    try {
        const roomId = req.params.id;
        
        const materials = await pool.query(`
            SELECT m.*, u.full_name as uploaded_by_name 
            FROM room_materials m 
            JOIN users u ON m.user_id = u.id 
            WHERE m.room_id = $1 
            ORDER BY m.created_at DESC
        `, [roomId]);

        res.json(materials.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
