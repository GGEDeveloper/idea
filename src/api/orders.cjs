const express = require('express');
const orderQueries = require('../db/order-queries.cjs');
const { requireAuth } = require('./middleware/localAuth.cjs');

const router = express.Router();

// Middleware para verificar permissões de encomendas
const requirePlaceOrderPermission = (req, res, next) => {
  if (!req.localUser || !req.localUser.permissions || !req.localUser.permissions.includes('create_order')) {
    return res.status(403).json({ error: 'Acesso negado. Permissão para criar encomendas é necessária.' });
  }
  next();
};

/**
 * Rota para criar uma nova encomenda.
 * Requer que o utilizador esteja autenticado e tenha a permissão 'create_order'.
 */
router.post('/', requireAuth, requirePlaceOrderPermission, async (req, res) => {
  const { items } = req.body;
  const userId = req.localUser.user_id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O campo "items" é obrigatório e deve ser um array não vazio.' });
  }

  try {
    const newOrder = await orderQueries.createOrder(userId, items);
    res.status(201).json(newOrder);
  } catch (error) {
    // A função createOrder já faz log do erro detalhado.
    res.status(500).json({ error: error.message });
  }
});

// Outras rotas (GET para listar encomendas, GET para detalhes, etc.) serão adicionadas aqui.

module.exports = router; 