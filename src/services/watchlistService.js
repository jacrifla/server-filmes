const db = require('../database/db');
const MediaService = require('./mediaService');

const validStatuses = ['watched', 'watchlist'];
const validTypes = ['movie', 'series'];

const WatchlistService = {
  async exists(userId, tmdbId, type) {
    const query = `
      SELECT id FROM watchlist
      WHERE user_id = $1 AND tmdb_id = $2 AND type = $3
    `;
    const values = [userId, tmdbId, type];
    const { rowCount } = await db.query(query, values);

    return rowCount > 0;
  },

  async getFullWatchlistByUser(userId) {
    const query = `
      SELECT 
        w.id,
        w.tmdb_id AS "tmdbId",
        w.status,
        w.type,
        w.updated_at AS "updatedAt",
        m.title,
        m.image_url AS "imageUrl"
      FROM watchlist w
      JOIN media m ON w.tmdb_id = m.tmdb_id AND w.type = m.type
      WHERE w.user_id = $1
      ORDER BY w.updated_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  },

  async getAllByUser(userId) {
    const query = `
      SELECT
        id,
        user_id AS "userId",
        tmdb_id AS "tmdbId",
        type,
        status,
        updated_at AS "updatedAt"
      FROM watchlist
      WHERE user_id = $1
    `;
    const values = [userId];
    const result = await db.query(query, values);
    return result.rows;
  },

  async remove({ userId, tmdbId, type }) {
    const query = `
      DELETE FROM watchlist
      WHERE user_id = $1 AND tmdb_id = $2 AND type = $3
    `;
    const values = [userId, tmdbId, type];
    await db.query(query, values);
    return {
      mensagem: 'Removido com sucesso.'
    };
  },

  async addTowatchlist(userId, tmdbId, type, title, imageUrl, status) {
    if (!validStatuses.includes(status)) {
      throw new Error("Status inválido.");
    }

    if (!validTypes.includes(type)) {
      throw new Error("Tipo inválido.");
    }

    await MediaService.findOrCreateMedia(tmdbId, title, imageUrl, type);

    try {
      const query = `
        INSERT INTO watchlist (user_id, tmdb_id, type, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, tmdb_id, type)
        DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
        RETURNING
          id,
          user_id   AS "userId",
          tmdb_id   AS "tmdbId",
          type,
          status,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;
      const values = [userId, tmdbId, type, status];

      const result = await db.query(query, values);

      return result.rows[0];

    } catch (error) {
      throw new Error(`Erro ao adicionar/atualizar filme: ${error.message}`);
    }
  },
};

module.exports = WatchlistService;
