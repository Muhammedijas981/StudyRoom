const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const roomController = require('../controllers/roomController');
const auth = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');


/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new study room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - topic
 *             properties:
 *               name:
 *                 type: string
 *               topic:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               cover_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room created successfully
 *       400:
 *         description: Validation error
 */
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


/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all study rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of study rooms
 */
router.get('/', auth, roomController.getAllRooms);


/**
 * @swagger
 * /api/rooms/my-rooms:
 *   get:
 *     summary: Get rooms created or joined by current user
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's rooms
 */
router.get('/my-rooms', auth, roomController.getMyRooms);


/**
 * @swagger
 * /api/rooms/materials/saved:
 *   get:
 *     summary: Get user's saved materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved materials
 */
router.get('/materials/saved', auth, roomController.getSavedMaterials);


/**
 * @swagger
 * /api/rooms/materials/saved:
 *   delete:
 *     summary: Clear all saved materials
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All saved materials cleared
 */
router.delete('/materials/saved', auth, roomController.clearSavedMaterials);


/**
 * @swagger
 * /api/rooms/materials/reported/all:
 *   get:
 *     summary: Get all reported materials (Admin view)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of reported materials with details
 */
router.get('/materials/reported/all', auth, roomController.getAllReportedMaterials);


/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room details by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room details
 *       404:
 *         description: Room not found
 */
router.get('/:id', auth, roomController.getRoomById);

/**
 * @swagger
 * /api/rooms/{id}/join:
 *   post:
 *     summary: Join a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Joined room successfully
 *       400:
 *         description: Already a member or room full
 */
router.post('/:id/join', auth, roomController.joinRoom);

/**
 * @swagger
 * /api/rooms/{id}/leave:
 *   post:
 *     summary: Leave a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Left room successfully
 */
router.post('/:id/leave', auth, roomController.leaveRoom);


/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               topic:
 *                 type: string
 *               max_capacity:
 *                 type: integer
 *               cover_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Room updated
 *       401:
 *         description: Not authorized (not owner)
 */
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


/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete a room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Room deleted
 *       401:
 *         description: Not authorized
 */
router.delete('/:id', auth, roomController.deleteRoom);


/**
 * @swagger
 * /api/rooms/{id}/materials:
 *   post:
 *     summary: Upload study material to room
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               material:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Material uploaded
 *       400:
 *         description: Invalid file or not a member
 */
router.post(
    '/:id/materials',
    [
        auth,
        upload.single('material')
    ],
    roomController.uploadMaterial
);


/**
 * @swagger
 * /api/rooms/{id}/materials:
 *   get:
 *     summary: Get all materials in a room
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of materials
 */
router.get('/:id/materials', roomController.getMaterials);


/**
 * @swagger
 * /api/rooms/materials/{id}/save:
 *   post:
 *     summary: Toggle save/unsave material
 *     tags: [Materials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material saved/unsaved
 */
router.post('/materials/:id/save', auth, roomController.toggleSaveMaterial);


/**
 * @swagger
 * /api/rooms/materials/{id}/report:
 *   post:
 *     summary: Report a study material
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Report submitted
 */
router.post('/materials/:id/report', auth, roomController.reportMaterial);


/**
 * @swagger
 * /api/rooms/materials/{id}/reports:
 *   get:
 *     summary: Get all reports for a specific material
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get('/materials/:id/reports', auth, roomController.getMaterialReports);

module.exports = router;
