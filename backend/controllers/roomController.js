const { pool } = require('../config/database');
const { validationResult } = require('express-validator');


exports.createRoom = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, topic, description, max_capacity } = req.body;
  const cover_image = req.file ? req.file.path.replace(/\\/g, "/") : null; // Normalize path


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

exports.getAllRooms = async (req, res) => {
  const { search, sort } = req.query;
  const userId = req.user ? req.user.id : null;

  try {
    let params = [];
    let paramIndex = 1;
    let userIdParamIndex = 0;

    if (userId) {
        userIdParamIndex = paramIndex;
        params.push(userId);
        paramIndex++;
    }

    // Correctly reference userId parameter index if it exists, for is_member check
    const isMemberSubquery = userId 
        ? `, (SELECT EXISTS(SELECT 1 FROM room_members rm2 WHERE rm2.room_id = s.id AND rm2.user_id = $${userIdParamIndex})) as is_member` 
        : '';

    let query = `
      SELECT 
        s.*, 
        u.full_name as creator_name,
        (SELECT COUNT(rm.user_id) FROM room_members rm WHERE rm.room_id = s.id) as current_members
        ${isMemberSubquery}
      FROM study_rooms s 
      LEFT JOIN users u ON s.created_by = u.id
    `;
    
    if (search) {
      query += ` WHERE s.name ILIKE $${paramIndex} OR s.topic ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
    query += ` ORDER BY s.created_at ${sortOrder}`;

    const rooms = await pool.query(query, params);
    res.json(rooms.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

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


exports.joinRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;


        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        

        const existingMember = await pool.query('SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);
        if (existingMember.rows.length > 0) {
            return res.status(400).json({ msg: 'Already a member of this room' });
        }


        const memberCount = await pool.query('SELECT COUNT(*) FROM room_members WHERE room_id = $1', [roomId]);
        if (parseInt(memberCount.rows[0].count) >= room.rows[0].max_capacity) {
            return res.status(400).json({ msg: 'Room is full' });
        }


        await pool.query('INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)', [roomId, userId]);

        res.json({ msg: 'Joined room successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

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


        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        if (room.rows[0].created_by !== userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }


        let capacity = room.rows[0].max_capacity;
        if (max_capacity) {
            capacity = parseInt(max_capacity);
            if (capacity < 2 || capacity > 50) {
                return res.status(400).json({ errors: [{ msg: 'Max capacity must be between 2 and 50' }] });
            }
        }


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

exports.leaveRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;


        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }


        await pool.query('DELETE FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);

        res.json({ msg: 'Left room successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

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


        const isMember = await pool.query('SELECT * FROM room_members WHERE room_id = $1 AND user_id = $2', [roomId, userId]);
        const isOwner = await pool.query('SELECT * FROM study_rooms WHERE id = $1 AND created_by = $2', [roomId, userId]);

        if (isMember.rows.length === 0 && isOwner.rows.length === 0) {
            return res.status(403).json({ msg: 'Not authorized to upload to this room' });
        }

        const newMaterial = await pool.query(
            'INSERT INTO room_materials (room_id, user_id, file_name, file_path, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [roomId, userId, fileName, filePath, fileSize]
        );


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

exports.getMaterials = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user ? req.user.id : null;
        
        let query = `
            SELECT m.*, u.full_name as uploaded_by_name 
            ${userId ? `, (SELECT EXISTS(SELECT 1 FROM saved_materials sm WHERE sm.material_id = m.id AND sm.user_id = $2)) as is_saved` : ''}
            FROM room_materials m 
            JOIN users u ON m.user_id = u.id 
            WHERE m.room_id = $1 
            ORDER BY m.created_at DESC
        `;
        
        const params = [roomId];
        if (userId) {
            params.push(userId);
        }

        const materials = await pool.query(query, params);

        res.json(materials.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.toggleSaveMaterial = async (req, res) => {
    try {
        const materialId = req.params.id;
        const userId = req.user.id;


        const material = await pool.query('SELECT * FROM room_materials WHERE id = $1', [materialId]);
        if (material.rows.length === 0) {
            return res.status(404).json({ msg: 'Material not found' });
        }


        const saved = await pool.query('SELECT * FROM saved_materials WHERE user_id = $1 AND material_id = $2', [userId, materialId]);

        if (saved.rows.length > 0) {

            await pool.query('DELETE FROM saved_materials WHERE user_id = $1 AND material_id = $2', [userId, materialId]);
            res.json({ msg: 'Material unsaved', is_saved: false });
        } else {

            await pool.query('INSERT INTO saved_materials (user_id, material_id) VALUES ($1, $2)', [userId, materialId]);
            res.json({ msg: 'Material saved', is_saved: true });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getSavedMaterials = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        let query = `
            SELECT 
                m.*, 
                sm.created_at as saved_at,
                r.name as room_name,
                r.topic as room_topic
            FROM saved_materials sm
            JOIN room_materials m ON sm.material_id = m.id
            JOIN study_rooms r ON m.room_id = r.id
            WHERE sm.user_id = $1
        `;
        
        const params = [userId];

        if (search) {
            query += ` AND m.file_name ILIKE $2`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY sm.created_at DESC`;

        const materials = await pool.query(query, params);
        res.json(materials.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.clearSavedMaterials = async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query('DELETE FROM saved_materials WHERE user_id = $1', [userId]);
        res.json({ msg: 'All materials cleared' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteRoom = async (req, res) => {
    try {
        const roomId = req.params.id;
        const userId = req.user.id;


        const room = await pool.query('SELECT * FROM study_rooms WHERE id = $1', [roomId]);
        
        if (room.rows.length === 0) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        if (room.rows[0].created_by !== userId) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await pool.query('DELETE FROM study_rooms WHERE id = $1', [roomId]);

        res.json({ msg: 'Room removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.getMyRooms = async (req, res) => {
  try {
    const userId = req.user.id;
    const { filter } = req.query; // 'created' or 'joined' (default)

    let queryText = '';
    let params = [userId];

    if (filter === 'created') {

      queryText = `
        SELECT 
          s.*, 
          u.full_name as creator_name,
          (SELECT COUNT(rm.user_id) FROM room_members rm WHERE rm.room_id = s.id) as current_members,
          (SELECT EXISTS(SELECT 1 FROM room_members rm2 WHERE rm2.room_id = s.id AND rm2.user_id = $1)) as is_member 
        FROM study_rooms s 
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.created_by = $1
        ORDER BY s.created_at DESC
      `;
    } else {

      // Since creating a room doesn't strictly mean joining in current logic (unless we auto-join), 
      // we need to decide if we query room_members or (room_members OR created_by).
      // Assuming creators join their rooms:
      queryText = `
        SELECT 
          s.*, 
          u.full_name as creator_name,
          (SELECT COUNT(rm.user_id) FROM room_members rm WHERE rm.room_id = s.id) as current_members,
          true as is_member
        FROM study_rooms s 
        JOIN room_members rm_join ON s.id = rm_join.room_id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE rm_join.user_id = $1
        ORDER BY s.created_at DESC
      `;
    }

    const { rows } = await pool.query(queryText, params);
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.reportMaterial = async (req, res) => {
  try {
    const materialId = req.params.id;
    const userId = req.user.id;
    const { comment } = req.body;


    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ msg: 'Comment is required' });
    }

    if (comment.length > 500) {
      return res.status(400).json({ msg: 'Comment must be 500 characters or less' });
    }


    const material = await pool.query('SELECT * FROM room_materials WHERE id = $1', [materialId]);
    if (material.rows.length === 0) {
      return res.status(404).json({ msg: 'Material not found' });
    }


    await pool.query(
      'INSERT INTO material_reports (material_id, user_id, comment) VALUES ($1, $2, $3)',
      [materialId, userId, comment.trim()]
    );

    res.json({ msg: 'Material reported successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getMaterialReports = async (req, res) => {
  try {
    const materialId = req.params.id;

    const reports = await pool.query(`
      SELECT 
        r.id,
        r.comment,
        r.created_at,
        u.full_name as reporter_name,
        u.email as reporter_email
      FROM material_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.material_id = $1
      ORDER BY r.created_at DESC
    `, [materialId]);

    res.json(reports.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllReportedMaterials = async (req, res) => {
  try {
    const materials = await pool.query(`
      SELECT 
        m.*,
        r.name as room_name,
        r.topic as room_topic,
        u.full_name as uploader_name,
        COUNT(DISTINCT mr.id) as report_count,
        MAX(mr.created_at) as last_reported_at,
        json_agg(
          json_build_object(
            'id', mr.id,
            'comment', mr.comment,
            'reporter_name', reporter.full_name,
            'created_at', mr.created_at
          ) ORDER BY mr.created_at DESC
        ) as reports
      FROM room_materials m
      JOIN material_reports mr ON m.id = mr.material_id
      JOIN study_rooms r ON m.room_id = r.id
      LEFT JOIN users u ON m.user_id = u.id
      LEFT JOIN users reporter ON mr.user_id = reporter.id
      GROUP BY m.id, r.name, r.topic, u.full_name
      ORDER BY last_reported_at DESC
    `);

    res.json(materials.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

