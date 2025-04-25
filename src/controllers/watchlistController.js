const WatchlistService = require('../services/watchlistService');

const WatchlistController = {
    async getUserLibrary ( req, res){
        try {           
            const userId = req.user.id;

            const result = await WatchlistService.getFullWatchlistByUser(userId);

            res.json({
                status: true,
                data: result
            })
        } catch (error) {
            res.status(400).json({
                status: false,
                message: `${error.message || error}`
            });
        }
    },
    async create( req, res){
        try {
            const { tmdbId, type, title, imageUrl, status} = req.body;
            
            const userId = req.user.id;

            const result = await WatchlistService.addTowatchlist(userId, tmdbId, type, title, imageUrl, status);

            res.status(201).json({
                status: true,
                data: result
            })
        } catch (error) {
            res.status(400).json({
                status: false,
                message: `${error.message || error}`
            });
        }
    },

    async getAll(req, res) {
        try {
            const userId = req.user.id;

            const items = await WatchlistService.getAllByUser(userId);
            res.status(200).json({
                status: true,
                data: items
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async remove(req, res) {
        try {
            const { tmdbId, type } = req.body;
            const userId = req.user.id;

            const result = await WatchlistService.remove({ userId, tmdbId, type });
            res.status(200).json({
                status: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },
};

module.exports = WatchlistController;
