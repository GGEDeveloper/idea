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

const requireViewOwnOrdersPermission = (req, res, next) => {
  if (!req.localUser || !req.localUser.permissions || !req.localUser.permissions.includes('view_own_orders')) {
    return res.status(403).json({ error: 'Acesso negado. Permissão para ver encomendas é necessária.' });
  }
  next();
};

/**
 * GET /api/orders/my-orders
 * Lista as encomendas do cliente autenticado com paginação
 */
router.get('/my-orders', requireAuth, requireViewOwnOrdersPermission, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'order_date',
      order = 'desc'
    } = req.query;

    const userId = req.localUser.user_id;
    const orders = await orderQueries.getUserOrders(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      sortBy,
      order
    });

    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar encomendas do utilizador:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/orders/:orderId
 * Obter detalhes de uma encomenda específica (apenas se pertencer ao cliente)
 */
router.get('/:orderId', requireAuth, requireViewOwnOrdersPermission, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.localUser.user_id;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return res.status(400).json({ error: 'ID de encomenda inválido' });
    }

    const order = await orderQueries.getUserOrderById(userId, orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Encomenda não encontrada ou não pertence a este utilizador' });
    }

    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar detalhes da encomenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/orders
 * Criar uma nova encomenda a partir do carrinho
 */
router.post('/', requireAuth, requirePlaceOrderPermission, async (req, res) => {
  const { items } = req.body;
  const userId = req.localUser.user_id;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'O campo "items" é obrigatório e deve ser um array não vazio.' });
  }

  // Validar estrutura dos items
  for (const item of items) {
    if (!item.ean || !item.quantity || item.quantity <= 0) {
      return res.status(400).json({ 
        error: 'Cada item deve ter "ean" e "quantity" (maior que 0).' 
      });
    }
  }

  try {
    const newOrder = await orderQueries.createOrder(userId, items);
    
    console.log(`Cliente ${req.localUser.email} criou nova encomenda ${newOrder.order_id} com ${items.length} itens`);
    
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Erro ao criar encomenda:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/orders/stats/summary
 * Estatísticas básicas das encomendas do cliente
 */
router.get('/stats/summary', requireAuth, requireViewOwnOrdersPermission, async (req, res) => {
  try {
    const userId = req.localUser.user_id;
    const stats = await orderQueries.getUserOrderStats(userId);
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas das encomendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 