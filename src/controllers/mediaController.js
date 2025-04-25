const MediaService = require('../services/mediaService');

const MediaController = {
  async add(req, res) {
    try {
      const {
        tmdbId,
        title,
        imageUrl,
        type
      } = req.body;

      const media = await MediaService.addMedia({ tmdbId, title, imageUrl, type });

      if (!media) {
        return res.status(409).json({
          status: false,
          message: 'Mídia já existe.'
        });
      }

      res.status(201).json({
        status: true,
        data: media
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `Erro interno do servidor: ${error.message || error}`
      });
    }
  },

  async getAll(req, res) {
    try {
      const mediaList = await MediaService.getAllMedia();
      res.json({
        status: true,
        data: mediaList
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `Erro interno do servidor: ${error.message || error}`
      });
    }
  },

  async getOne(req, res) {
    try {
      const { tmdb_id: tmdbId, type } = req.params;
      const media = await MediaService.getMediaById(tmdbId, type);

      if (!media) {
        return res.status(404).json({
          status: false,
          message: 'Mídia não encontrada.'
        });
      }

      res.json({
        status: true,
        data: media
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: `Erro interno do servidor: ${error.message || error}`
      });
    }
  },
};

module.exports = MediaController;
