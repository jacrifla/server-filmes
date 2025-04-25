const RatingService = require("../services/ratingService");

const RatingController = {
    async addOrUpdate(req, res) {
        try {
            const { userId, tmdbId, type, rating, comment } = req.body;

            const saveRating = await RatingService.addOrUpdateRating({ userId, tmdbId, type, rating, comment });
            res.status(201).json({
                status: true,
                data: saveRating
            })
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getAll(req, res) {
        try {
            const ratings = await RatingService.getAllRating();

            res.json({
                status: true,
                data: ratings
            })

        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            const ratings = await RatingService.getRatingsByUser(userId);
            res.json({
                status: true,
                data: ratings
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getByUserAndMedia(req, res) {
        try {
            const { userId, tmdbId, type } = req.params;
            const rating = await RatingService.getRatingByUserAndMedia(userId, tmdbId, type);

            if (!rating) {
                return res.status(404).json({
                    status: false,
                    message: 'Avaliação não encontrada'
                });
            }

            res.json({
                status: true,
                data: rating
              });
              
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    },

    async getMediaAverageRating(req, res) {
        try {
            const { tmdbId, type } = req.params;
            const average = await RatingService.getAverageByMedia(tmdbId, type);
            

            if (!average || average.totalRatings === "0") {
                return res.status(404).json({
                    status: false,
                    message: 'Nenhuma avaliação encontrada para esse conteúdo.'
                });
            }

            res.json({
                status: true,
                data: average
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: `Erro interno do servidor: ${error.message || error}`
            });
        }
    }
}

module.exports = RatingController;