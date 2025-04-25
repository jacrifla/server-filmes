const db = require('../database/db');

const RatingService = {
    async addOrUpdateRating({ userId, tmdbId, type, rating, comment }) {
        const query = `
            INSERT INTO ratings (user_id, tmdb_id, type, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id, tmdb_id, type)
            DO UPDATE 
            SET 
                rating     = COALESCE(EXCLUDED.rating, ratings.rating),
                comment    = COALESCE(EXCLUDED.comment, ratings.comment),
                updated_at = CURRENT_TIMESTAMP
            RETURNING id, user_id AS "userId", tmdb_id AS "tmdbId", type,
                    rating, comment, updated_at AS "updatedAt";

        `;
        const values = [userId, tmdbId, type, rating, comment];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async getAllRating() {
        const query = `
            SELECT  id,
                    user_id AS "userId",
                    tmdb_id AS "tmdbId",
                    type,
                    rating,
                    comment,
                    updated_at AS "updatedAt"
            FROM ratings 
            ORDER BY updated_at DESC
        `
        const result = await db.query(query);
        return result.rows;
    },

    async getRatingsByUser(userId) {
        const query = `
            SELECT  id,
                    user_id AS "userId",
                    tmdb_id AS "tmdbId",
                    type,
                    rating,
                    comment,
                    updated_at AS "updatedAt"
            FROM ratings
            WHERE user_id = $1
        `
        const values = [userId]
        const result = await db.query(query, values);
        return result.rows;
    },

    async getRatingByUserAndMedia(userId, tmdbId, type) {
        const query = `
            SELECT  id,
                    user_id AS "userId",
                    tmdb_id AS "tmdbId",
                    type,
                    rating,
                    comment,
                    updated_at AS "updatedAt" 
            FROM ratings
            WHERE user_id = $1 AND tmdb_id = $2 AND type = $3
        `;
        const values = [userId, tmdbId, type];
        const result = await db.query(query, values);
        return result.rows[0];
    },

    async getAverageByMedia(tmdbId, type) {
        const query = `
            SELECT 
                ROUND(AVG(rating), 2) AS "averageRating",
                COUNT(*) AS "totalRatings"
            FROM ratings
            WHERE tmdb_id = $1 AND type = $2
        `;
        const values = [tmdbId, type];
        const result = await db.query(query, values);
        
        return result.rows[0];
    }
}

module.exports = RatingService;