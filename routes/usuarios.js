const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM consultar_usuarios()');
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

// Rota para adicionar um usuário
router.post('/', async (req, res) => {
    const { nome, username, email, senha } = req.body;
    try {
      await pool.query('SELECT adicionar_usuario($1, $2, $3, $4)', [nome, username, email, senha]);
      res.status(201).send('Usuário adicionado com sucesso');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

// Rota para atualizar um usuário
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, username, email, senha } = req.body;
    try {
      await pool.query('SELECT editar_usuario($1, $2, $3, $4, $5)', [id, nome, username, email, senha]);
      res.status(200).send('Usuário atualizado com sucesso');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

// Rota para remover um usuário
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('SELECT deletar_usuario($1)', [id]);
      res.status(200).send('Usuário deletado com sucesso');
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

module.exports = router;
