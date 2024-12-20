const express = require('express');
const cors = require('cors');
const usuariosRouter = require('./routes/usuarios');
const filmesRouter = require('./routes/filmes');
const comentariosRouter = require('./routes/comentarios');
const avaliacoesRouter = require('./routes/avaliacoes');
const listaAssistirRouter = require('./routes/listaAssistir');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000; 

// Middleware para analisar JSON
app.use(express.json());

app.use(cors({
  origin: ['http://127.0.0.1:5500', 'https://procura-filmes.netlify.app'], // Permitir apenas estas origens
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeçalhos permitidos
}));

// Rotas
app.use('/usuarios', usuariosRouter);
app.use('/filmes', filmesRouter);
app.use('/comentarios', comentariosRouter);
app.use('/avaliacoes', avaliacoesRouter);
app.use('/lista_assistir', listaAssistirRouter);

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado!');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando`);
});
