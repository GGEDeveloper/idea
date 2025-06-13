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
      SELECT p.ean, p.name, pr.price
      FROM products p
      JOIN prices pr ON p.ean = pr.product_ean
      JOIN price_lists pl ON pr.price_list_id = pl.price_list_id
      WHERE p.ean = ANY($1::text[]) AND pl.name = 'Preço Base';
    `;
    const { rows: products } = await client.query(productQuery, [productEans]);

    if (products.length !== items.length) {
      throw new Error('Um ou mais produtos na sua encomenda não foram encontrados ou não têm preço definido.');
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

module.exports = {
  createOrder,
}; 