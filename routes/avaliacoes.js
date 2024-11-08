const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todas as avaliações
router.get('/:tmdb_id', async (req, res) => {
  const { tmdb_id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM avaliacoes WHERE tmdb_id = $1 AND deleted_at IS NULL', [tmdb_id]);

    // Verifica se não encontrou nenhuma avaliação
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Nenhuma avaliação encontrada para o filme"
      });
    }

    // Retorna as avaliações encontradas
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

// Rota para adicionar uma avaliação
router.post('/add', async (req, res) => {
  const { usuario_id, tmdb_id, nota } = req.body;

  // Verificar se o tmdb_id é um número válido
  if (isNaN(tmdb_id)) {
    return res.status(400).json({
      success: false,
      message: 'tmdb_id deve ser um número válido.'
    });
  }

  try {
    // Inserir avaliação, sem verificar previamente a existência do filme
    await pool.query('INSERT INTO Avaliacoes (usuario_id, tmdb_id, nota) VALUES ($1, $2, $3)', [usuario_id, tmdb_id, nota]);

    res.status(201).json({
      success: true,
      message: 'Avaliação adicionada com sucesso'
    });

  } catch (error) {
    // Verificar se o erro é relacionado à violação de chave estrangeira
    if (error.message.includes('violates foreign key constraint')) {
      return res.status(404).json({
        success: false,
        message: `Filme não encontrado com tmdb_id: ${tmdb_id}`
      });
    }

    // Caso seja outro erro, retornar um erro genérico 500
    res.status(500).json({
      success: false,
      error: 'Erro: ' + error.message,
    });
  }
});

// Rota para atualizar uma avaliação
router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { nota } = req.body;
    try {
      await pool.query('UPDATE Avaliacoes SET nota = $1 WHERE id = $2', [nota, id]);
      res.json({
        success: true,
        message: 'Avaliação editada com sucesso'
      });
    } catch (error) {
      res.status(500).json({ 
      success: false,
      error: 'Erro: ' + error.message,
      });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query('UPDATE Avaliacoes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL', [id]);
      res.json({
        success: true,
        message: 'Avaliação deletada com sucesso'
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: 'Erro: ' + error.message,
      });
    }
});

module.exports = router;
