const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todos os filmes
router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM consultar_filmes()');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
// Rota para adicionar um filme
router.post('/', async (req, res) => {
    const { tmdb_id, titulo, sinopse } = req.body;
    try {
      await pool.query('SELECT adicionar_filme($1, $2, $3)', [tmdb_id, titulo, sinopse]);
      res.status(201).send('Filme adicionado com sucesso');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

module.exports = router;
