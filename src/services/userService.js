const db = require('../database/db');

const UserService = {
  async getAllUsers() {
    const query = `
        SELECT  id, 
                name, 
                email, 
                created_at as "createdAt" 
        FROM users 
        WHERE deleted_at IS NULL;
    `;
    const result = await db.query(query);
    return result.rows;
  },

  async getUserById(id) {    
    const query = `
        SELECT  id, 
                name, 
                email, 
                created_at as "createdAt" 
        FROM users 
        WHERE id = $1 AND deleted_at IS NULL;
    `;
    const values = [id];
    const result = await db.query(query, values)
    return result.rows[0];
  },

  async updateUser(id, { name, email }) {
    const query = `
        UPDATE users
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND deleted_at IS NULL
        RETURNING id, name, email, updated_at AS "updatedAt"
    `;
    const values = [name, email, id]
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async softDeleteUser(id) {
    const query = `
        UPDATE users
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
    `;
    const values = [id]
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async getStats(userId) {
    const watchedQuery = `
      SELECT COUNT(*)
      FROM watchlist
      WHERE user_id = $1 AND status = 'watched'
    `;
    const watchlistQuery = `
      SELECT COUNT(*)
      FROM watchlist
      WHERE user_id = $1 AND status = 'watchlist'
    `;
    const ratingsQuery = `
      SELECT COUNT(*)
      FROM ratings 
      WHERE user_id = $1
    `;
    const values = [userId];
    const watched = await db.query(watchedQuery, values);
    const watchlist = await db.query(watchlistQuery, values);
    const ratings = await db.query(ratingsQuery, values);
    
    return {
      watched: parseInt(watched.rows[0].count),
      watchlist: parseInt(watchlist.rows[0].count),
      ratings: parseInt(ratings.rows[0].count),
    }
  },
};

module.exports = UserService;
