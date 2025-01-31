const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Consultar todas as avaliações
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM avaliacoes WHERE deleted_at IS NULL ORDER BY id');
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro:' + error.message,
    })
  }

});

// Rota para obter as avalicoes de um usuario
router.get('/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  
  try {
    const result = await pool.query(
      'SELECT * FROM avaliacoes WHERE usuario_id = $1 AND deleted_at IS NULL', 
      [usuario_id]
    );

    // Verifica se não encontrou nenhuma avaliação
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Nenhuma avaliação encontrada para esse usuário.',
      });
    }
    res.status(200).json({
      success: true,
      data: result.rows
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro: ' + error.message,
    })
  }
});


// Rota para obter a avaliação de um usuário para um filme específico
router.get('/:tmdb_id/:usuario_id', async (req, res) => {
  const { tmdb_id, usuario_id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM avaliacoes WHERE tmdb_id = $1 AND usuario_id = $2 AND deleted_at IS NULL',
      [tmdb_id, usuario_id]
    );

    // Se não encontrou nenhuma avaliação, retorna nota 0
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: { nota: 0 }, // Garante que a nota seja 0 por padrão
      });
    }

    // Retorna a avaliação encontrada
    res.status(200).json({
      success: true,
      data: result.rows[0]
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
    const checkExistence = await pool.query('SELECT * FROM Avaliacoes WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL', [usuario_id, tmdb_id]);

    if (checkExistence.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Já avaliou esse filme',
      });
    }

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
router.put('/update/:usuario_id/:tmdb_id', async (req, res) => {
  const { usuario_id, tmdb_id } = req.params;  // Pegando os parâmetros
  const { nota } = req.body;  // Pegando o corpo da requisição
  
  try {
    // Verificando se a avaliação existe para o usuário e o filme
    const result = await pool.query(
      'SELECT id FROM Avaliacoes WHERE usuario_id = $1 AND tmdb_id = $2', 
      [usuario_id, tmdb_id]
    );

    if (result.rows.length === 0) {
      // Caso não exista, retorna um erro ou uma mensagem indicando que não encontrou a avaliação
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada para este filme e usuário'
      });
    }

    // Caso a avaliação exista, atualiza a avaliação
    await pool.query('UPDATE Avaliacoes SET nota = $1 WHERE usuario_id = $2 AND tmdb_id = $3', [nota, usuario_id, tmdb_id]);

    res.json({
      success: true,
      message: 'Avaliação editada com sucesso'
    });
  } catch (error) {
    console.error("Erro no servidor ao tentar atualizar avaliação:", error);
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
