const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todos os filmes
router.get('/', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM Filmes');
      res.status(200).json({
        success: true,
        data: result.rows
      })
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  });
  
// Rota para adicionar um filme
router.post('/add', async (req, res) => {
  const { tmdb_id } = req.body;
  try {
      await pool.query('INSERT INTO Filmes (tmdb_id) VALUES ($1)', [tmdb_id]);
      res.status(201).send({ 
        success: true, 
        message: 'Filme adicionado com sucesso',
      });
  } catch (err) {
      res.status(500).send({ 
        success: false, 
        message: err.message,
      });
  }
});


// Rota para obter um filme específico
router.get('/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;
  try {
      const result = await pool.query('SELECT * FROM Filmes WHERE tmdb_id = $1', [tmdb_id]);
      if (result.rows.length === 0) {
          return res.status(404).json({
            success: false, 
            message: 'Filme não encontrado', 
          });
      }
      res.status(200).json({
        success: true,
        data: result.rows[0]
      })
  } catch (err) {
      res.status(500).send({ 
        success: false, 
        message: err.message
      });
  }
});

// Rota para deletar um filme
router.delete('/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;
  try {
      const result = await pool.query('DELETE FROM Filmes WHERE tmdb_id = $1', [tmdb_id]);
      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false, 
          message: 'Filme não encontrado', 
        });
      }
      res.json({ 
        success: true,
        message: 'Filme deletado com sucesso' 
      });
  } catch (err) {
      res.status(500).send({ success: false, message: err.message });
  }
});

module.exports = router;
