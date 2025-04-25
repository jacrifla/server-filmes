const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');
const authMiddleware = require('../middlewares/authMiddleware');
const ensureOwnUser = require('../middlewares/ensureOwnUser');

router.post('/add', authMiddleware, RatingController.addOrUpdate);
router.get('/all', authMiddleware,  RatingController.getAll);
router.get('/:userId', authMiddleware, ensureOwnUser, RatingController.getByUser);
router.get('/:tmdbId/:userId/:type', authMiddleware, ensureOwnUser, RatingController.getByUserAndMedia);
router.get('/media/average/:tmdbId/:type', RatingController.getMediaAverageRating);

module.exports = router;
