const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// @route   POST api/rooms
// @desc    Create a room
// @access  Private
router.post(
  '/',
  [
    auth,
    upload.single('cover_image'),
    [
      check('name', 'Room name is required').not().isEmpty(),
      check('topic', 'Topic is required').not().isEmpty(),
      check('max_capacity', 'Capacity must be a number').optional().isNumeric(),
    ]
  ],
  roomController.createRoom
);

// @route   GET api/rooms
// @desc    Get all rooms
// @access  Public
// We want to extract user if token is present, but continue if not
// Since `auth` middleware throws 401 if failing, we need a flexible middleware or just use `auth` if we decide browse is private.
// The user has a persistent sidebar, implying the app assumes authentication.
// Let's use `auth` for getAllRooms too if the user is expected to be logged in to see membership status.
// Actually, earlier we said browse might be public.
// Let's assume for now the user is logged in (since redirected from login/register).
// So adding `auth` middleware to `getAllRooms` is the safest way to get `req.user`.
router.get('/', auth, roomController.getAllRooms);

// @route   GET api/rooms/my-rooms
// @desc    Get user's rooms
// @access  Private
router.get('/my-rooms', auth, roomController.getMyRooms);

// @route   GET api/rooms/materials/saved
// @desc    Get saved materials
// @access  Private
router.get('/materials/saved', auth, roomController.getSavedMaterials);

// @route   DELETE api/rooms/materials/saved
// @desc    Clear all saved materials
// @access  Private
router.delete('/materials/saved', auth, roomController.clearSavedMaterials);

// @route   GET api/rooms/:id
// @desc    Get room by ID
// @access  Public
// Optional auth for getting room details to check membership status
// We need to make a middleware that doesn't fail if no token, just sets req.user to null?
// Or just require auth for details if we want personalized "Join/Leave" button state.
// Let's assume public view but authenticated actions.
// To support "is_member" check in getRoomById, we might want to allow optional auth.
// For now, let's keep it simple: getRoomById is public (req.user undefined), or we can make a middleware wrapper.
// Actually, `authMiddleware` typically throws 401 if no token. Let's make a "softAuth" middleware later if needed.
// For now, creating a room requires auth. Joining requires auth.
router.get('/:id', auth, roomController.getRoomById); // Making it protected to easily get user ID for is_member check

router.post('/:id/join', auth, roomController.joinRoom);
router.post('/:id/leave', auth, roomController.leaveRoom);

// @route   PUT api/rooms/:id
// @desc    Update a room
// @access  Private (Owner only)
router.put(
    '/:id',
    [
        auth,
        upload.single('cover_image'),
        [
            check('max_capacity', 'Capacity must be a number').optional().isNumeric(),
        ]
    ],
    roomController.updateRoom
);

// @route   DELETE api/rooms/:id
// @desc    Delete a room
// @access  Private (Owner only)
router.delete('/:id', auth, roomController.deleteRoom);

// @route   POST api/rooms/:id/materials
// @desc    Upload material to room
// @access  Private (Member only)
router.post(
    '/:id/materials',
    [
        auth,
        upload.single('material')
    ],
    roomController.uploadMaterial
);

// @route   GET api/rooms/:id/materials
// @desc    Get all materials for a room
// @access  Public (or Private)
router.get('/:id/materials', roomController.getMaterials);

// @route   POST api/rooms/materials/:id/save
// @desc    Toggle save status of material
// @access  Private
router.post('/materials/:id/save', auth, roomController.toggleSaveMaterial);

module.exports = router;
