const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Consultar comentários de um filme**
router.get('/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;
try {
  const result = await pool.query('SELECT * FROM consultar_comentarios($1)', [tmdb_id]);
  res.json(result.rows);
} catch (error) {
  res.status(500).json({ error: 'Erro ao consultar comentários', details: error.message });
}
});

// Adicionar um comentário
router.post('/', async (req, res) => {
    const { usuario_id, tmdb_id, comentario } = req.body;
  try {
    await pool.query('SELECT adicionar_comentario($1, $2, $3)', [usuario_id, tmdb_id, comentario]);
    res.status(201).json({ message: 'Comentário adicionado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar comentário', details: error.message });
  }
});

// Editar um comentário
router.put('/:id', async (req, res) => {
    const { id } = req.params;
  const { comentario } = req.body;
  try {
    await pool.query('SELECT editar_comentario($1, $2)', [id, comentario]);
    res.json({ message: 'Comentário editado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao editar comentário', details: error.message });
  }
});

// Deletar um comentário (soft delete)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  try {
    await pool.query('SELECT deletar_comentario($1)', [id]);
    res.json({ message: 'Comentário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar comentário', details: error.message });
  }
});

module.exports = router;
