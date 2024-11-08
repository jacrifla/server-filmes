const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Consultar listas de favoritos
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM consultar_listas_favoritas($1)', [usuario_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).send({
      success: false,
      message: err.message
    });
  }
});

// Adicionar filme à lista de favoritos
router.post('/add', async (req, res) => {
    const { usuario_id, tmdb_id, status } = req.body;
    try {
      await pool.query('SELECT adicionar_lista_favorita($1, $2, $3)', [usuario_id, tmdb_id, status]);
      res.status(201).send({
        success: true,
        message: 'Filme adicionado à lista de favoritos'});
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message
      });
    }
});


// Editar status de um filme na lista de favoritos
router.put('/:usuario_id/:tmdb_id', async (req, res) => {
    const { usuario_id, tmdb_id } = req.params;
    const { status } = req.body;
    try {
      await pool.query('SELECT editar_lista_favorita($1, $2, $3)', [usuario_id, tmdb_id, status]);
      res.status(200).send({
        success: true,
        message: 'Status da lista de favoritos atualizado'
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message
      });
    }
});

// Deletar filme da lista de favoritos (soft delete)
router.delete('/:usuario_id/:tmdb_id', async (req, res) => {
    const { usuario_id, tmdb_id } = req.params;
    try {
      await pool.query('SELECT deletar_lista_favorita($1, $2)', [usuario_id, tmdb_id]);
      res.status(200).send({
        success: true,
        message: 'Filme removido da lista de favoritos'
      });
    } catch (err) {
      res.status(500).send({
        success: false,
        message: err.message
      });
    }
});

module.exports = router;
