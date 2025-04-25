const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/mediaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware, MediaController.add);
router.get('/all', authMiddleware, MediaController.getAll);
router.get('/:tmdb_id/:type', authMiddleware, MediaController.getOne);

module.exports = router;
