const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// Função utilitária para validar ID
function validateId(id) {
    return id && !isNaN(id);
}

// Função para buscar o filme na lista
async function findFilmList(usuario, tmdb) {
    return await pool.query(
        'SELECT * FROM lista_assistir WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL', 
        [usuario, tmdb]
    );
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

// Rota para adicionar um filme à lista "para assistir"
router.post('/add', async (req, res) => {
    const { usuario_id, tmdb_id, status } = req.body;

    try {
        const checkFilm = await pool.query('SELECT * FROM filmes WHERE tmdb_id = $1', [tmdb_id]);

        if (checkFilm.rows.length === 0) {
            await pool.query('INSERT INTO filmes (tmdb_id) VALUES ($1)', [tmdb_id]);
        }

        const existsResult = await findFilmList(usuario_id, tmdb_id);

        if (existsResult.rows.length > 0) {
            return sendResponse(res, 200, false, 'Este filme já está na sua lista para assistir.');
        }

        await pool.query(
            'INSERT INTO lista_assistir (usuario_id, tmdb_id, status) VALUES ($1, $2, $3)',
            [usuario_id, tmdb_id, status]
        );

        sendResponse(res, 201, true, 'Filme adicionado à lista para assistir.');
    } catch (err) {
        console.error('Erro ao adicionar filme à lista para assistir:', err);
        sendResponse(res, 500, false, 'Erro ao adicionar filme à lista para assistir.');
    }
});

// Rota para marcar um filme como assistido
router.put('/mark', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        const existsResult = await findFilmList(usuario_id, tmdb_id);

        if (existsResult.rows.length === 0) {
            return sendResponse(res, 404, false, 'Filme não encontrado na lista para assistir.');
        }

        const alreadyWatched = existsResult.rows.some(row => row.status === 'assistido');

        if (alreadyWatched) {
            return sendResponse(res, 400, false, 'Filme já está marcado como assistido.');
        }

        await pool.query(
            'UPDATE Lista_Assistir SET status = $1 WHERE usuario_id = $2 AND tmdb_id = $3 AND deleted_at IS NULL',
            ['assistido', usuario_id, tmdb_id]
        );

        sendResponse(res, 200, true, 'Filme marcado como assistido');
    } catch (err) {
        sendResponse(res, 500, false, err.message);
    }
});

// Rota para remover um filme da lista (soft delete)
router.delete('/remove', async (req, res) => {
    const { usuario_id, tmdb_id } = req.body;
    try {
        const existsResult = await findFilmList(usuario_id, tmdb_id);

        if (existsResult.rows.length === 0) {
            return sendResponse(res, 404, false, 'Filme não encontrado na lista para assistir.');
        }

        await pool.query(
            'UPDATE Lista_Assistir SET deleted_at = CURRENT_TIMESTAMP WHERE usuario_id = $1 AND tmdb_id = $2 AND deleted_at IS NULL',
            [usuario_id, tmdb_id]
        );

        sendResponse(res, 200, true, 'Filme removido da lista para assistir.');
    } catch (err) {
        sendResponse(res, 500, false, err.message);
    }
});

module.exports = router;
