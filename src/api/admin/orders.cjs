const express = require('express');
const pool = require('../../../db/index.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

/**
 * GET /api/admin/orders
 * Lista todas as encomendas com paginação, filtros e pesquisa
 */
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'order_date',
      order = 'desc'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClause += ` AND o.order_status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (
        u.email ILIKE $${paramIndex} OR 
        u.first_name ILIKE $${paramIndex} OR 
        u.last_name ILIKE $${paramIndex} OR
        u.company_name ILIKE $${paramIndex} OR
        o.order_id::text ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort options
    const validSortColumns = ['order_date', 'total_amount', 'order_status', 'email'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'order_date';
    const safeOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const sortColumn = safeSortBy === 'email' ? 'u.email' : `o.${safeSortBy}`;

    // Main query
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id, u.user_id
      ORDER BY ${sortColumn} ${safeOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(parseInt(limit), offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT o.order_id) as total
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ${whereClause}
    `;

    const [ordersResult, countResult] = await Promise.all([
      pool.query(ordersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const orders = ordersResult.rows;
    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar encomendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/orders/:orderId
 * Obter detalhes completos de uma encomenda específica
 */
router.get('/:orderId', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return res.status(400).json({ error: 'ID de encomenda inválido' });
    }

    // Get order header with user info
    const orderQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
    `;

    // Get order items
    const itemsQuery = `
      SELECT 
        oi.order_item_id,
        oi.product_ean,
        oi.quantity,
        oi.price_at_purchase,
        oi.product_name,
        p.name as current_product_name,
        p.active as product_active
      FROM order_items oi
      LEFT JOIN products p ON oi.product_ean = p.ean
      WHERE oi.order_id = $1
      ORDER BY oi.product_name
    `;

    const [orderResult, itemsResult] = await Promise.all([
      pool.query(orderQuery, [orderId]),
      pool.query(itemsQuery, [orderId])
    ]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    const order = orderResult.rows[0];
    const items = itemsResult.rows;

    res.json({
      ...order,
      items
    });

  } catch (error) {
    console.error('Erro ao buscar detalhes da encomenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/orders/:orderId/status
 * Atualizar o status de uma encomenda
 */
router.put('/:orderId/status', requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, notes } = req.body;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      return res.status(400).json({ error: 'ID de encomenda inválido' });
    }

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Status inválido. Valores válidos: ' + validStatuses.join(', ') 
      });
    }

    // Check if order exists
    const checkQuery = 'SELECT order_id, order_status FROM orders WHERE order_id = $1';
    const checkResult = await pool.query(checkQuery, [orderId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Encomenda não encontrada' });
    }

    const currentOrder = checkResult.rows[0];

    // Update order status
    const updateQuery = `
      UPDATE orders 
      SET order_status = $1, updated_at = NOW()
      WHERE order_id = $2
      RETURNING *
    `;

    const updateResult = await pool.query(updateQuery, [status, orderId]);
    const updatedOrder = updateResult.rows[0];

    // TODO: Add order status history/audit log if needed
    // TODO: Send notification to customer if needed

    console.log(`Admin ${req.localUser.email} mudou status da encomenda ${orderId} de '${currentOrder.order_status}' para '${status}'${notes ? ` com notas: ${notes}` : ''}`);

    res.json({
      message: 'Status da encomenda atualizado com sucesso',
      order: updatedOrder,
      previousStatus: currentOrder.order_status
    });

  } catch (error) {
    console.error('Erro ao atualizar status da encomenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/orders/stats
 * Obter estatísticas das encomendas para o dashboard
 */
router.get('/stats/summary', requireAdmin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE order_status = 'pending_approval') as pending_orders,
        COUNT(*) FILTER (WHERE order_status = 'approved') as approved_orders,
        COUNT(*) FILTER (WHERE order_status = 'shipped') as shipped_orders,
        COUNT(*) FILTER (WHERE order_status = 'delivered') as delivered_orders,
        COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled_orders,
        COUNT(*) FILTER (WHERE order_status = 'rejected') as rejected_orders,
        COALESCE(SUM(total_amount), 0) as total_value,
        COALESCE(SUM(total_amount) FILTER (WHERE order_status = 'delivered'), 0) as delivered_value
      FROM orders
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    // Convert numeric strings to numbers
    Object.keys(stats).forEach(key => {
      if (key.includes('_orders') || key === 'total_orders') {
        stats[key] = parseInt(stats[key]);
      } else if (key.includes('_value')) {
        stats[key] = parseFloat(stats[key]);
      }
    });

    res.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas das encomendas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/orders
 * Criar uma nova encomenda (para administradores)
 */
router.post('/', requireAdmin, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { user_id, order_status = 'pending_approval', items, total_amount } = req.body;

    // Validação básica
    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        error: 'Dados inválidos. user_id e items são obrigatórios.' 
      });
    }

    // Validar status
    const validStatuses = ['pending_approval', 'approved', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!validStatuses.includes(order_status)) {
      return res.status(400).json({ 
        error: 'Status inválido. Valores válidos: ' + validStatuses.join(', ') 
      });
    }

    // Verificar se o utilizador existe
    const userCheckQuery = 'SELECT user_id FROM users WHERE user_id = $1';
    const userCheckResult = await client.query(userCheckQuery, [user_id]);
    
    if (userCheckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    await client.query('BEGIN');

    // Calcular total se não fornecido
    let calculatedTotal = total_amount;
    if (!calculatedTotal) {
      calculatedTotal = items.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
    }

    // Criar a encomenda
    const orderQuery = `
      INSERT INTO orders (user_id, order_status, total_amount)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const orderResult = await client.query(orderQuery, [user_id, order_status, calculatedTotal]);
    const newOrder = orderResult.rows[0];

    // Adicionar os itens da encomenda
    for (const item of items) {
      if (!item.product_ean || !item.quantity || !item.price_at_purchase || !item.product_name) {
        throw new Error('Dados de item inválidos. product_ean, quantity, price_at_purchase e product_name são obrigatórios.');
      }

      const itemQuery = `
        INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name)
        VALUES ($1, $2, $3, $4, $5)
      `;
      
      await client.query(itemQuery, [
        newOrder.order_id,
        item.product_ean,
        item.quantity,
        item.price_at_purchase,
        item.product_name
      ]);
    }

    await client.query('COMMIT');

    console.log(`Admin ${req.localUser.email} criou nova encomenda ${newOrder.order_id} para utilizador ${user_id}`);

    res.status(201).json(newOrder);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar encomenda:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  } finally {
    client.release();
  }
});

module.exports = router; 