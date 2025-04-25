const db = require('../database/db');

const MediaService = {
    async getAllMedia() {
        const query = `
            SELECT
                id,
                tmdb_id AS "tmdbId", 
                title,
                image_url AS "imageUrl", 
                type,
                created_at AS "createdAt" 
            FROM media
            ORDER BY id DESC
        `;
        const result = await db.query(query);
        return result.rows;
    },

    async getMediaById(tmdbId, type) {
        const query = `
            SELECT
                id,
                tmdb_id AS "tmdbId", 
                title,
                image_url AS "imageUrl", 
                type,
                created_at AS "createdAt" 
            FROM media
            WHERE tmdb_id = $1 AND type = $2
        `
        const values = [tmdbId, type];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async findOrCreateMedia(tmdbId, title, imageUrl, type) {
        const existsQuery = `
            SELECT
                id,
                tmdb_id   AS "tmdbId",
                title,
                image_url AS "imageUrl",
                type,
                created_at AS "createdAt"
            FROM media
            WHERE tmdb_id = $1 AND type = $2
        `;
        const existsValues = [tmdbId, type];
        const exists = await db.query(existsQuery, existsValues);

        if (exists.rowCount > 0) {
            return exists.rows[0];
        }

        const insertQuery = `
            INSERT INTO media (tmdb_id, title, image_url, type)
            VALUES ($1, $2, $3, $4)
            RETURNING
                id,
                tmdb_id   AS "tmdbId",
                title,
                image_url AS "imageUrl",
                type,
                created_at AS "createdAt"
                `;
        const insertValues = [tmdbId, title, imageUrl, type];
        const inserted = await db.query(insertQuery, insertValues);
        return inserted.rows[0];
    }
}

module.exports = MediaService;