const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/request-reset', AuthController.requestResetPassword);
router.post('/reset-password', AuthController.resetPassword);
router.put('/change-password', authMiddleware, AuthController.changePassword);

module.exports = router;
