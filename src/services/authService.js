const db = require('../database/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const { generateToken } = require('../utils/jwt');

const AuthService = {
  async register({ name, email, password }) {
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const checkValues = [email];
    const existing = await db.query(checkQuery, checkValues);

    if (existing.rowCount > 0) {
      throw new Error('Este e-mail já está em uso.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at AS "createdAt"
    `;
    const insertValues = [name, email, hashedPassword];
    const result = await db.query(insertQuery, insertValues);

    const user = result.rows[0];
    const token = generateToken({ id: user.id, email: user.email });

    return { user, token };
  },

  async login({ email, password }) {
    const selectQuery = `
      SELECT    id,
                name,
                email,
                password,
                created_at AS "createdAt",
                updated_at AS "updatedAt",
                deleted_at AS "deletedAt"
      FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    const selectValues = [email];
    const result = await db.query(selectQuery, selectValues);

    const user = result.rows[0];
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error('E-mail ou senha inválidos.');
    }

    const token = generateToken({ id: user.id });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  },

  async requestResetPassword(email) {
    const userQuery = `
      SELECT id
      FROM users
      WHERE email = $1;
    `;
    const userValues = [email]
    const result = await db.query(userQuery, userValues);

    if (result.rowCount === 0) {
      throw new Error('E-mail não encontrado.')
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 2000);

    const updateQuery = `
      UPDATE users
      SET reset_token = $1,
          reset_token_expires = $2
      WHERE email = $3;
    `;
    const updateValues = [token, expires, email];

    await db.query(updateQuery, updateValues);
    return {token}
  },

  async resetPassword(token, newPassword) {
    const userQuery = `
      SELECT id
      FROM users
      WHERE reset_token = $1 AND reset_token_expires > NOW()
    `;
    const userValues = [token];
    const result = await db.query(userQuery, userValues);

    if (result.rowCount === 0) {
  throw new Error("Token inválido ou expirado");        
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updateQuery = `
      UPDATE users
      SET password = $1,
          reset_token = NULL,
          reset_token_expires = NULL
      WHERE id = $2;
    `;
    const updateValues = [hashed, result.rows[0].id];
    await db.query(updateQuery, updateValues);
    return {
      message: 'Senha redefinida com sucesso.'
    }
  },

  async changePassword(userId, currentPassword, newPassword) {
    const userQuery = `
      SELECT password
      FROM users
      WHERE id = $1;
    `;
    const result = await db.query(userQuery, [userId]);

    if (result.rowCount === 0) {
      throw new Error("Usuário não encontrado.");
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      throw new Error("Senha atual incorreta");
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    const updateQuery = `
      UPDATE users
      SET password = $1,
          updated_at = NOW()
      WHERE id = $2;
    `;
    await db.query(updateQuery, [hashed, userId]);
    return {
      message: 'Senha alterada com sucesso.'
    }
  }
};

module.exports = AuthService;
