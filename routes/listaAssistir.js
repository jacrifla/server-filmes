const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todos os filmes da lista "para assistir" de um usuário
router.get('/watchlist', async (req, res) => {
    const { usuario_id } = req.body; // agora pegamos usuario_id do corpo da requisição

    // Verifica se o usuario_id é um número válido
    if (isNaN(usuario_id)) {
        return res.status(400).send({
            success: false,
            message: "O ID do usuário é inválido ou está ausente."
        });
    }

    try {
        console.log("Usuario ID:", usuario_id); // Log para verificar o ID do usuário

        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND deleted_at IS NULL',
            [usuario_id]
        );

        console.log("Resultados da Query:", result.rows); // Log para verificar o resultado da query

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Nenhum filme encontrado na lista para assistir."
            });
        }

        res.status(200).send({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Erro ao buscar a lista de filmes:", err.message);
        res.status(500).send({
            success: false,
            message: "Erro ao buscar a lista de filmes."
        });
    }
});

// Rota para obter apenas os filmes que estão "para assistir" (excluindo os filmes "assistidos")
router.get('/to-watch', async (req, res) => {
    const { usuario_id } = req.body;
    console.log(usuario_id);
    

    // Verificação básica do ID do usuário
    if (!usuario_id || isNaN(usuario_id)) {
        return res.status(400).json({
            success: false,
            message: "O ID do usuário é inválido ou está ausente."
        });
    }

    try {
        // Consulta para obter apenas os filmes com status "para assistir" e que não foram excluídos
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND status = $2 AND deleted_at IS NULL',
            [usuario_id, 'para assistir']
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum filme encontrado na lista para assistir."
            });
        }

        // Resposta de sucesso com os filmes encontrados
        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Erro ao buscar a lista de filmes para assistir:", err);
        res.status(500).json({
            success: false,
            message: "Erro ao buscar a lista de filmes para assistir."
        });
    }
});


// Rota para adicionar um filme à lista "para assistir" de um usuário
router.post('/add', async (req, res) => {
    const { usuario_id, tmdb_id, status } = req.body;  // status pode ser NULL inicialmente
    try {
        // Verificar se o filme já está na lista para o usuário (evitar duplicatas)
        const checkExistence = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL',
            [usuario_id, tmdb_id]
        );

        if (checkExistence.rows.length > 0) {
            return res.status(400).send({
                success: false,
                message: 'Este filme já está na sua lista para assistir.'
            });
        }

        // Adicionar o filme à lista "para assistir"
        await pool.query(
            'INSERT INTO Lista_Assistir (usuario_id, tmdb_id, status) VALUES ($1, $2, $3)',
            [usuario_id, tmdb_id, status]
        );
        
        res.status(200).send({
            success: true,
            message: 'Filme adicionado à lista para assistir.',
        });
    } catch (err) {
        console.error('Erro ao adicionar filme à lista para assistir:', err);
        res.status(500).send({
            success: false,
            message: 'Erro ao adicionar filme à lista para assistir.'
        });
    }
});
  
// Rota para marcar um filme como assistido na lista "para assistir" do usuário
router.put('/mark', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        // Verificar se o filme já está na lista para assistir do usuário
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL',
            [usuario_id, tmdb_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Filme não encontrado na lista para assistir.'
            });
        }

        // Atualizar o status do filme para "assistido"
        await pool.query(
            'UPDATE Lista_Assistir SET status = $1 WHERE usuario_id = $2 AND tmdb_id = $3 AND deleted_at IS NULL',
            ['assistido', usuario_id, tmdb_id]
        );
        
        res.status(200).send({
            success: true,
            message: 'Filme marcado como assistido'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
});
  
// Rota para remover um filme da lista "para assistir" de um usuário (soft delete)
router.delete('/remove', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        // Verificar se o filme está na lista "para assistir" do usuário
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL',
            [usuario_id, tmdb_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send({
                success: false,
                message: 'Filme não encontrado na lista para assistir.'
            });
        }

        // Atualizar o campo deleted_at para fazer o soft delete
        await pool.query(
            'UPDATE Lista_Assistir SET deleted_at = CURRENT_TIMESTAMP WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL',
            [usuario_id, tmdb_id]
        );
        
        res.status(200).send({
            success: true,
            message: 'Filme removido da lista para assistir.'
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;
