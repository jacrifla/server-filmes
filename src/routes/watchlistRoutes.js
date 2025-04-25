const express = require('express');
const router = express.Router();
const WatchlistController = require('../controllers/watchlistController');
const authMiddleware = require('../middlewares/authMiddleware');
const ensureOwnUser = require('../middlewares/ensureOwnUser');

router.post('/add', authMiddleware, ensureOwnUser, WatchlistController.create);
router.get('/library', authMiddleware, ensureOwnUser, WatchlistController.getUserLibrary);
router.get('/all', authMiddleware, ensureOwnUser, WatchlistController.getAll);
router.delete('/remove', authMiddleware, ensureOwnUser, WatchlistController.remove);

module.exports = router;
