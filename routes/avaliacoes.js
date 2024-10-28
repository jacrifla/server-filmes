const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todas as avaliações
router.get('/:tmdb_id', async (req, res) => {
    const { tmdb_id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM consultar_avaliacoes($1)', [tmdb_id]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao consultar avaliações', details: error.message });
    }
});

// Rota para adicionar uma avaliação
router.post('/', async (req, res) => {
    const { usuario_id, tmdb_id, nota } = req.body;
    try {
      await pool.query('SELECT adicionar_avaliacao($1, $2, $3)', [usuario_id, tmdb_id, nota]);
      res.status(201).json({ message: 'Avaliação adicionada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao adicionar avaliação', details: error.message });
    }
});

// Rota para atualizar uma avaliação
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nota } = req.body;
    try {
      await pool.query('SELECT editar_avaliacao($1, $2)', [id, nota]);
      res.json({ message: 'Avaliação editada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao editar avaliação', details: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('SELECT deletar_avaliacao($1)', [id]);
      res.json({ message: 'Avaliação deletada com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar avaliação', details: error.message });
    }
  });
  

module.exports = router;
