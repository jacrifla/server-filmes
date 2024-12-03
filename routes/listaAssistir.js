const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Função utilitária para validar ID
function validateId(id) {
    return id && !isNaN(id);
}

// Função para buscar o filme na lista
async function findFilmList(usuario, tmdb, status = null, deleted_at = null) {
    let query = 'SELECT * FROM lista_assistir WHERE usuario_id = $1 AND tmdb_id = $2';
    const params = [usuario, tmdb];

    if (status) {
        query += ' AND status = $3';
        params.push(status);
    }
    
    if (deleted_at !== null) {
        query += ' AND deleted_at IS NULL';
    }

    return await pool.query(query, params);
}

// Função para padronizar a resposta
function sendResponse(res, status, success, message, data = null) {
    res.status(status).json({ success, message, data });
}

// Consultar todas as listas de todos os usuários
router.get('/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Lista_Assistir WHERE deleted_at IS NULL');
        sendResponse(res, 200, true, "Listas obtidas com sucesso", result.rows);
    } catch (error) {
        sendResponse(res, 500, false, "Erro: " + error.message);
    }
});

// Rota para obter todos os filmes da lista "para assistir" de um usuário
router.get('/watchlist/:id', async (req, res) => {
    const { id } = req.params;
    
    if (!validateId(id)) {
        return sendResponse(res, 400, false, "O ID do usuário é inválido ou está ausente.");
    }

    try {
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND deleted_at IS NULL',
            [id]
        );

        if (result.rows.length === 0) {
            return sendResponse(res, 404, false, "Nenhum filme encontrado na lista para assistir.");
        }

        sendResponse(res, 200, true, "Lista de filmes para assistir obtida com sucesso", result.rows);
        
    } catch (err) {
        console.error("Erro ao buscar a lista de filmes:", err.message);
        sendResponse(res, 500, false, "Erro ao buscar a lista de filmes.");
    }
});

// Rota para obter filmes "assistidos" de um usuário
router.get('/watched/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateId(id)) {
        return sendResponse(res, 400, false, "O ID do usuário é inválido ou está ausente.");
    }

    try {
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND status = $2 AND deleted_at IS NULL',
            [id, 'assistido']
        );

        if (result.rows.length === 0) {
            return sendResponse(res, 404, false, "Nenhum filme encontrado na lista de assistidos.");
        }
        sendResponse(res, 200, true, "Lista de filmes assistidos obtida com sucesso", result.rows);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "Erro ao buscar a lista de filmes assistidos.");
    }
});

// Rota para obter filmes "para assistir" de um usuário
router.get('/to-watch/:id', async (req, res) => {
    const { id } = req.params;

    if (!validateId(id)) {
        return sendResponse(res, 400, false, "O ID do usuário é inválido ou está ausente.");
    }

    try {
        const result = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND status = $2 AND deleted_at IS NULL',
            [id, 'para assistir']
        );

        if (result.rows.length === 0) {
            return sendResponse(res, 404, false, "Nenhum filme encontrado na lista para assistir.");
        }

        sendResponse(res, 200, true, "Lista de filmes 'para assistir' obtida com sucesso", result.rows);
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "Erro ao buscar a lista de filmes 'para assistir'.");
    }
});

// Rota para verificar se um filme está na lista de um usuário
router.post('/checkFilmInList', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;

    try {
        const result = await findFilmList(usuario_id, tmdb_id);
        const exists = result.rows.length > 0;
        sendResponse(res, 200, true, exists ? "Filme encontrado na lista" : "Filme não encontrado na lista", { exists });

    } catch (error) {
        console.error('Erro ao verificar se o filme está na lista:', error);
        sendResponse(res, 500, false, 'Erro no servidor ao verificar filme na lista');
    }
});

// Adicionar ou alterar filme na lista
router.post('/film', async (req, res) => {

    const { tmdb_id, usuario_id, status } = req.body;

    if (!tmdb_id || !usuario_id || !status) {
        sendResponse(res, 400, false, 'Dados obrigatórios')
        return;
    }

    try {
        const filmeResult = await pool.query(
            'SELECT * FROM filmes WHERE tmdb_id = $1',
            [tmdb_id]
        )

        if (filmeResult.rows.length === 0) {
            await pool.query('INSERT INTO Filmes (tmdb_id) VALUES ($1)', [tmdb_id]);
        }
        
        const query = `
            INSERT INTO lista_assistir (usuario_id, tmdb_id, status)
            VALUES ($1, $2, $3)
            ON CONFLICT (usuario_id, tmdb_id)
            DO UPDATE SET 
               status = $3,
               deleted_at = NULL
            RETURNING *;
        `
        const result = await pool.query(query, [usuario_id, tmdb_id, status]);
        sendResponse(res, 201, true, 'Filme adicionado à lista', result.rows[0]);
    } catch (error) {
        console.error('Erro ao adicionar filme à lista:', error);
        sendResponse(res, 500, false, 'Erro ao processar a requisição');        
    }
});

// Restaurar
router.put('/restore', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        const existsResult = await pool.query(
            'SELECT * FROM Lista_Assistir WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NOT NULL', 
            [usuario_id, tmdb_id]
        )
        
        if (existsResult.rows.length === 0) {
            return sendResponse(res, 404, false, 'Filme não encontrado na lista para assistir.');
        };

        // Restaura o registro da tabela Lista_Assistir
        await pool.query(
            'UPDATE Lista_Assistir SET deleted_at = NULL WHERE usuario_id = $1 AND tmdb_id = $2',
            [usuario_id, tmdb_id]
        );

        sendResponse(res, 200, true, 'Filme restaurado');
    } catch (error) {
        sendResponse(res, 500, false, 'Erro ao restaurar');        
    }
})

// Rota para remover um filme da lista (soft delete)
router.delete('/remove', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        // Atualiza a data de exclusão e o status do filme
        const result = await pool.query(
            `UPDATE Lista_Assistir 
            SET deleted_at = CURRENT_TIMESTAMP, status = NULL 
            WHERE usuario_id = $1 AND tmdb_id = $2 
            AND deleted_at IS NULL`,
            [usuario_id, tmdb_id]
        );

        if (result.rowCount > 0) {
            sendResponse(res, 200, true, 'Filme removido da lista.');
        } else {
            sendResponse(res, 404, false, 'Filme não encontrado ou já removido.');
        }
    } catch (err) {
        sendResponse(res, 500, false, err.message);
    }
});

// remover completamente
router.delete('/remove/:usuario_id/:tmdb_id', async (req, res) => {
    const { usuario_id, tmdb_id } = req.params;
    try {
        // Deleta o registro da tabela Lista_Assistir
        await pool.query(
            'DELETE FROM Lista_Assistir WHERE usuario_id = $1 AND tmdb_id = $2',
            [usuario_id, tmdb_id]
        );

        return res.status(200).json({ success: true, message: 'Filme removido da lista de assistidos com sucesso.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

module.exports = router;
