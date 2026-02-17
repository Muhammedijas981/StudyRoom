const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');


const generateToken = (userId) => {
  const payload = {
    user: {
      id: userId
    }
  };
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, password } = req.body;

  try {

    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }


    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);


    const newUser = await pool.query(
      'INSERT INTO users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, created_at',
      [full_name, email, password_hash]
    );


    const token = generateToken(newUser.rows[0].id);

    res.json({ token, user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const user = userResult.rows[0];


    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }


    const token = generateToken(user.id);


    delete user.password_hash;

    res.json({ token, user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;


    const userQuery = await pool.query(
      'SELECT id, full_name, email, avatar_url, major, bio, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = userQuery.rows[0];


    const roomsJoinedCount = await pool.query(
      'SELECT COUNT(*) FROM room_members WHERE user_id = $1',
      [userId]
    );

    const materialsSharedCount = await pool.query(
      'SELECT COUNT(*) FROM room_materials WHERE user_id = $1',
      [userId]
    );

    // Get joined rooms (limit 5 for recent activity)
    const joinedRooms = await pool.query(`
      SELECT r.id, r.name, r.topic, 
      (SELECT COUNT(*) FROM room_members rm WHERE rm.room_id = r.id) as member_count
      FROM study_rooms r
      JOIN room_members m ON r.id = m.room_id
      WHERE m.user_id = $1
      ORDER BY m.joined_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      ...user,
      stats: {
        roomsJoined: parseInt(roomsJoinedCount.rows[0].count),
        materialsShared: parseInt(materialsSharedCount.rows[0].count)
      },
      joinedRooms: joinedRooms.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
    try {
        const { full_name, major, bio } = req.body;
        const userId = req.user.id;


        
        const updateQuery = `
            UPDATE users 
            SET full_name = COALESCE($1, full_name),
                major = COALESCE($2, major),
                bio = COALESCE($3, bio)
            WHERE id = $4
            RETURNING id, full_name, email, avatar_url, major, bio, created_at
        `;

        const updatedUser = await pool.query(updateQuery, [full_name, major, bio, userId]);

        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded' });
        }

        const filePath = req.file.path.replace(/\\/g, "/"); // Normalize path
        

        const result = await pool.query(
            'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING avatar_url',
            [filePath, req.user.id]
        );

        res.json({ avatar_url: result.rows[0].avatar_url });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;


        const user = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
        
        if (user.rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }


        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, userId]);

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.updateEmail = async (req, res) => {
    try {
        const { newEmail } = req.body;
        const userId = req.user.id;


        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [newEmail, userId]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: 'Email already in use' });
        }

        await pool.query('UPDATE users SET email = $1 WHERE id = $2', [newEmail, userId]);

        res.json({ msg: 'Email updated successfully', email: newEmail });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Delete user (cascade handles relations)
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
