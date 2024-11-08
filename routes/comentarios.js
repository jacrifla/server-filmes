const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Consultar comentários de um filme**
router.get('/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Comentarios WHERE tmdb_id = $1 AND deleted_at IS NULL', [tmdb_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentários não encontrados para este filme',
      })
    }

    res.status(200).json({
      success: true,
      data: result.rows
    })
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

// Adicionar um comentário
router.post('/add', async (req, res) => {
    const { usuario_id, tmdb_id, comentario } = req.body;
  try {
    await pool.query('INSERT INTO Comentarios (usuario_id, tmdb_id, comentario) VALUES ($1, $2, $3)', [usuario_id, tmdb_id, comentario]);
    res.status(201).json({ 
      success: true,
      message: 'Comentário adicionado com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

// Editar um comentário
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
  const { comentario } = req.body;
  try {
    await pool.query('UPDATE Comentarios SET comentario = $1 WHERE id = $2', [comentario, id]);
    res.json({
      success: true,
      message: 'Comentário editado com sucesso',
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

// Deletar um comentário (soft delete)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  try {
    await pool.query('UPDATE Comentarios SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL', [id]);
    res.json({ 
      success: true,
      message: 'Comentário deletado com sucesso' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

module.exports = router;
