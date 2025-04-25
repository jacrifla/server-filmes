const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const ensureOwnUser = require('../middlewares/ensureOwnUser');

router.get('/all', authMiddleware, UserController.getAll);
router.get('/:id', authMiddleware, ensureOwnUser, UserController.getById);
router.put('/update/:id', authMiddleware, ensureOwnUser, UserController.update);
router.delete('/delete/:id', authMiddleware, ensureOwnUser, UserController.softDelete);
router.get('/:id/stats', authMiddleware, ensureOwnUser, UserController.getStats);

module.exports = router;
