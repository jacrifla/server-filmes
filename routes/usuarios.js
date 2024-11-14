const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../db/pool');

// Rota para obter todos os usuários
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Usuarios WHERE deleted_at IS NULL');
        res.status(200).json({
            success: true,
            data: result.rows
          })
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: 'Erro: ' + err.message,
        });
    }
});

// Rota para login
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
 
    try {
        const result = await pool.query('SELECT * FROM Usuarios WHERE email = $1 AND deleted_at IS NULL', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
        
            if (user.senha) {  // Verifica se a senha existe no objeto retornado
                const isMatch = await bcrypt.compare(senha, user.senha);
                
                if (isMatch) {
                    delete user.senha;
                    res.status(200).json({
                        success: true,
                        data: user,
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        message: 'Usuário ou senha inválidos',
                    });
                }
            } else {
                console.error('Senha não encontrada no banco de dados para o usuário.');
                res.status(500).json({
                    success: false,
                    message: 'Erro interno do servidor',
                });
            }
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
        });
    }
});

// Rota para redefinir a senha com base no email
router.put('/redefinir-senha', async (req, res) => {
    const { email, novaSenha } = req.body;

    try {
        // Verifica se o email existe no banco de dados
        const result = await pool.query('SELECT * FROM Usuarios WHERE email = $1 AND deleted_at IS NULL', [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Email não encontrado' });
        }

        const userId = result.rows[0].id;

        // Gera o hash da nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha no banco de dados
        await pool.query('UPDATE Usuarios SET senha = $1 WHERE id = $2', [hashedPassword, userId]);

        res.status(200).json({ success: true, message: 'Senha redefinida com sucesso' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Rota para adicionar um usuário
router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(senha, 10);

        await pool.query('INSERT INTO Usuarios (nome, email, senha) VALUES ($1, $2, $3)',
            [nome, email, hashedPassword]);
        res.status(201).json({ 
            success: true,
            message: 'Usuário adicionado com sucesso',
        });
    } catch (err) {
        if (err.code === '23505') { // Código de erro para email duplicado
            res.status(400).send({ 
                success: false, 
                message: 'Email já cadastrado'
            });
        } else {
            res.status(500).send({ 
                success: false, 
                message: err.message
            });
        }
    }
});

// Rota para atualizar um usuário
router.put('/update/:id', async (req, res) => {
    const { nome, email, senha } = req.body;
    const { id } = req.params;

    // Verificar quais campos foram enviados e preparar a atualização
    let updateFields = [];
    let values = [];

    if (nome) {
        updateFields.push("nome = $1");
        values.push(nome);
    }
    if (email) {
        updateFields.push("email = $2");
        values.push(email);
    }
    if (senha) {
        // Hash da senha antes de armazená-la
        try {
          const hashedPassword = await bcrypt.hash(senha, 10); // 10 é o número de "salt rounds"
          updateFields.push("senha = $3");
          values.push(hashedPassword); // Armazenar a senha hasheada
        } catch (err) {
          console.error(err);
          return res.status(500).json({
            success: false,
            message: "Erro ao fazer o hash da senha."
          });
        }
    }

    // Se não houver campos para atualizar
    if (updateFields.length === 0) {
        return res.status(400).json({
        success: false,
        message: "Nada para atualizar!"
        });
    }

    // Adicionar o ID do usuário ao final dos valores
    values.push(id);

    // Construir a query para atualização
    const query = `UPDATE Usuarios SET ${updateFields.join(', ')} WHERE id = $${values.length} RETURNING *`;

    try {
        const { rows } = await pool.query(query, values);
        const updatedUser = rows[0];
    
        return res.status(200).json({
            success: true,
            message: "Usuário atualizado com sucesso!",
            data: updatedUser // Retorna os dados do usuário atualizado, se necessário
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Erro: " + err.message,
        });
    }
});

// Rota para excluir um usuário
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE Usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL', [id]);
        // Envie um JSON ao invés de um texto simples
        res.status(200).json({ 
            success: true, 
            message: 'Usuário deletado com sucesso',
        });
    } catch (err) {
        // Envie um JSON também em caso de erro
        res.status(500).json({ 
            success: false, 
            message: err.message,
        });
    }
});

router.patch('/restaurar', async (req, res) => {
    const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email é obrigatório."
    });
  }

  try {
    // Verifica se o usuário com o email fornecido foi deletado (soft delete)
    const result = await pool.query(
      'SELECT id, deleted_at FROM Usuarios WHERE email = $1',
      [email]
    );

    const usuario = result.rows[0];

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: "Usuário não encontrado com esse email."
      });
    }

    if (!usuario.deleted_at) {
      return res.status(400).json({
        success: false,
        message: "Usuário não foi deletado, não há o que restaurar."
      });
    }

    // Restaura o usuário, removendo o soft delete
    await pool.query(
      'UPDATE Usuarios SET deleted_at = NULL WHERE email = $1',
      [email]
    );

    return res.status(200).json({
      success: true,
      message: "Cadastro restaurado com sucesso."
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Erro ao restaurar o cadastro."
    });
  }
});

module.exports = router;
