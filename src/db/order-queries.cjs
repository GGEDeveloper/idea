const pool = require('../../db/index.cjs');

/**
 * Cria uma nova encomenda na base de dados.
 * Esta função executa como uma transação para garantir a atomicidade.
 *
 * @param {string} userId - O ID do utilizador (do nosso sistema) que está a fazer a encomenda.
 * @param {Array<object>} items - Um array de itens do carrinho. Cada objeto deve ter { ean, quantity }.
 * @returns {Promise<object>} - O objeto da encomenda recém-criada.
 * @throws {Error} - Lança um erro se algum produto não for encontrado, se o preço não estiver disponível ou se a transação falhar.
 */
async function createOrder(userId, items) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItemsData = [];

    // Prepara a query para buscar todos os produtos e os seus preços de uma só vez
    const productEans = items.map(item => item.ean);
    const productQuery = `
      SELECT 
        p.ean, 
        p.name,
        COALESCE(pr.price, pv.supplier_price * 1.3) as price
      FROM products p
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN prices pr ON pv.variantid = pr.variantid AND pr.price_list_id = 2
      WHERE p.ean = ANY($1::text[]) AND p.active = true
    `;
    const { rows: products } = await client.query(productQuery, [productEans]);

    if (products.length !== items.length) {
      const foundEans = products.map(p => p.ean);
      const missingEans = productEans.filter(ean => !foundEans.includes(ean));
      throw new Error(`Produtos não encontrados ou inativos: ${missingEans.join(', ')}`);
    }

    const productMap = new Map(products.map(p => [p.ean, { name: p.name, price: p.price }]));

    for (const item of items) {
      const product = productMap.get(item.ean);
      if (!product) {
        throw new Error(`Produto com EAN ${item.ean} não encontrado ou sem preço.`);
      }
      const itemPrice = parseFloat(product.price);
      totalAmount += item.quantity * itemPrice;
      orderItemsData.push({
        ean: item.ean,
        quantity: item.quantity,
        price_at_purchase: itemPrice,
        product_name: product.name,
      });
    }

    // Insere o cabeçalho da encomenda
    const orderInsertQuery = `
      INSERT INTO orders (user_id, total_amount)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows: [newOrder] } = await client.query(orderInsertQuery, [userId, totalAmount]);

    // Insere os itens da encomenda
    const orderItemsInsertQuery = `
      INSERT INTO order_items (order_id, product_ean, quantity, price_at_purchase, product_name)
      VALUES ($1, $2, $3, $4, $5);
    `;
    for (const itemData of orderItemsData) {
      await client.query(orderItemsInsertQuery, [
        newOrder.order_id,
        itemData.ean,
        itemData.quantity,
        itemData.price_at_purchase,
        itemData.product_name,
      ]);
    }

    await client.query('COMMIT');
    return newOrder;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar encomenda:', error);
    throw new Error('Falha ao criar a encomenda. A operação foi revertida.');
  } finally {
    client.release();
  }
}

/**
 * Obtém as encomendas de um utilizador específico com paginação
 * @param {string} userId - ID do utilizador
 * @param {object} options - Opções de filtro e paginação
 * @returns {Promise<object>} - Lista de encomendas com metadados de paginação
 */
async function getUserOrders(userId, options = {}) {
  const { page = 1, limit = 10, status, sortBy = 'order_date', order = 'desc' } = options;
  const offset = (page - 1) * limit;

  try {
    // Build WHERE clause
    let whereClause = 'WHERE o.user_id = $1';
    const queryParams = [userId];
    let paramIndex = 2;

    if (status && status !== 'all') {
      whereClause += ` AND o.order_status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    // Validate sort options
    const validSortColumns = ['order_date', 'total_amount', 'order_status'];
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'order_date';
    const safeOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Main query
    const ordersQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at,
        COUNT(oi.order_item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id
      ORDER BY o.${safeSortBy} ${safeOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `;

    const [ordersResult, countResult] = await Promise.all([
      pool.query(ordersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const orders = ordersResult.rows;
    const totalOrders = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        limit
      }
    };

  } catch (error) {
    console.error('Erro ao buscar encomendas do utilizador:', error);
    throw error;
  }
}

/**
 * Obtém detalhes completos de uma encomenda específica de um utilizador
 * @param {string} userId - ID do utilizador
 * @param {string} orderId - ID da encomenda
 * @returns {Promise<object|null>} - Detalhes da encomenda ou null se não encontrada
 */
async function getUserOrderById(userId, orderId) {
  try {
    // Get order header
    const orderQuery = `
      SELECT 
        o.order_id,
        o.order_status,
        o.total_amount,
        o.order_date,
        o.updated_at
      FROM orders o
      WHERE o.order_id = $1 AND o.user_id = $2
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
      pool.query(orderQuery, [orderId, userId]),
      pool.query(itemsQuery, [orderId])
    ]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    const order = orderResult.rows[0];
    const items = itemsResult.rows;

    return {
      ...order,
      items
    };

  } catch (error) {
    console.error('Erro ao buscar detalhes da encomenda:', error);
    throw error;
  }
}

/**
 * Obtém estatísticas das encomendas de um utilizador
 * @param {string} userId - ID do utilizador
 * @returns {Promise<object>} - Estatísticas das encomendas
 */
async function getUserOrderStats(userId) {
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
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders
      WHERE user_id = $1
    `;

    const result = await pool.query(statsQuery, [userId]);
    const stats = result.rows[0];

    // Convert numeric strings to numbers
    Object.keys(stats).forEach(key => {
      if (key.includes('_orders') || key === 'total_orders') {
        stats[key] = parseInt(stats[key]);
      } else {
        stats[key] = parseFloat(stats[key]);
      }
    });

    return stats;

  } catch (error) {
    console.error('Erro ao buscar estatísticas das encomendas:', error);
    throw error;
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getUserOrderById,
  getUserOrderStats
}; 