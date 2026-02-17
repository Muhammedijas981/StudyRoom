const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('full_name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST api/auth/login
// @desc    Auth user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// @route   GET api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', auth, authController.getProfile);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, authController.updateProfile);

// @route   POST api/auth/avatar
// @desc    Upload user avatar
// @access  Private
const upload = require('../middleware/uploadMiddleware');
router.post('/avatar', [auth, upload.single('avatar')], authController.uploadAvatar);

// @route   PUT api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', auth, authController.updatePassword);

// @route   PUT api/auth/email
// @desc    Update email
// @access  Private
router.put('/email', auth, authController.updateEmail);

// @route   DELETE api/auth/account
// @desc    Delete account
// @access  Private
router.delete('/account', auth, authController.deleteAccount);

module.exports = router;
