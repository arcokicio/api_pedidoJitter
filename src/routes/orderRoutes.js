const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const jwt = require('jsonwebtoken');

const SECRET_KEY = "sua_chave_secreta_aqui"; // Substitua por uma chave segura em produção

// Middleware de Autenticação JWT
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });
    
    jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        next();
    });
}

// Rotas do CRUD (todas protegidas pelo JWT)
router.post('/', verificarToken, OrderController.criarPedido);
router.get('/list', verificarToken, OrderController.listarPedidos);
router.get('/:id', verificarToken, OrderController.buscarPedido);
router.put('/:id', verificarToken, OrderController.atualizarPedido);
router.delete('/:id', verificarToken, OrderController.deletarPedido);

module.exports = router;

