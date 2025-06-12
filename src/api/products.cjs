// src/api/products.cjs
const express = require('express');
const { pool } = require('../db.cjs');
const clerk = require('@clerk/clerk-sdk-node');
const { buildCategoryTreeFromPaths } = require('./categories.cjs');

const router = express.Router();

// Middleware para autenticação opcional
const optionalAuth = async (req, res, next) => {
  req.auth = null; // Garante que req.auth existe, mas é nulo por padrão
  try {
    // Tenta autenticar o pedido usando o token do cabeçalho ou do cookie
    const requestState = await clerk.authenticateRequest({
      headerToken: req.headers.authorization,
      cookieToken: req.cookies.__session,
    });

    // Se a autenticação for bem-sucedida e tivermos um userId
    if (requestState.userId) {
      const user = await clerk.users.getUser(requestState.userId);
      req.auth = {
        ...requestState,
        // Recria o método hasPermission para consistência com o middleware do Clerk
        hasPermission: (key) => {
          const permissions = user.publicMetadata?.permissions || [];
          return permissions.includes(key);
        }
      };
    }
  } catch (error) {
    // Se a autenticação falhar (ex: token inválido ou ausente), não faz nada.
    // O pedido prossegue como um utilizador não autenticado.
    // console.log('Optional auth failed, proceeding as anonymous:', error.message);
  }
  next();
};

// Rota para buscar as opções de filtro (categorias, marcas, preços)
router.get('/filters', async (req, res) => {
  console.log('[API] GET /api/products/filters - A buscar opções de filtros.');
  try {
    const [categoryData, brandData, priceData] = await Promise.all([
      // 1. Buscar todas as categorias com contagem de produtos
      pool.query(`
        SELECT 
            c.geko_category_id as id,
            c.name,
            c.path,
            COUNT(pc.ean) as product_count
        FROM categories c
        LEFT JOIN product_categories pc ON c.geko_category_id = pc.geko_category_id
        GROUP BY c.geko_category_id, c.name, c.path
        ORDER BY c.path;
      `),
      // 2. Buscar todas as marcas distintas
      pool.query(`
        SELECT DISTINCT producername as name 
        FROM products 
        WHERE producername IS NOT NULL AND producername <> '' 
        ORDER BY name;
      `),
      // 3. Buscar o intervalo de preços
      pool.query(`
        SELECT 
            MIN(CAST(NULLIF(pricegross, '') AS NUMERIC)) as min, 
            MAX(CAST(NULLIF(pricegross, '') AS NUMERIC)) as max 
        FROM products;
      `)
    ]);

    // Construir a árvore de categorias
    const categoryTree = buildCategoryTreeFromPaths(categoryData.rows);

    // Formatar os dados para a resposta
    const filterOptions = {
      categories: categoryTree,
      brands: brandData.rows.map(row => row.name),
      price: {
        min: parseFloat(priceData.rows[0].min) || 0,
        max: parseFloat(priceData.rows[0].max) || 1000,
      }
    };

    console.log(`[API] GET /api/products/filters - Sucesso. Enviando ${filterOptions.categories.length} categorias raiz, ${filterOptions.brands.length} marcas.`);
    res.json(filterOptions);

  } catch (error) {
    console.error('[API] Erro ao buscar opções de filtros:', error);
    res.status(500).json({ error: 'Erro ao buscar opções de filtros.' });
  }
});

// Rota principal para buscar produtos (versão de diagnóstico)
router.get('/', optionalAuth, async (req, res) => {
  let {
    brands,
    categories,
    priceMin,
    priceMax,
    sortBy = 'relevance',
    order = 'asc',
    page = 1,
    limit = 24
  } = req.query;

  // Use o método hasPermission do nosso middleware personalizado
  const canSortByPrice = req.auth?.hasPermission('view_price') ?? false;

  if (sortBy === 'price' && !canSortByPrice) {
    sortBy = 'relevance';
  }

  const allowedSortBy = ['relevance', 'name', 'price'];
  const allowedOrder = ['asc', 'desc'];
  const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'relevance';
  const safeOrder = allowedOrder.includes(order) ? order.toUpperCase() : 'ASC';

  const queryParams = [];
  let paramIndex = 1;
  const whereClauses = [];
  let joinClauses = [];

  if (brands) {
    const brandList = brands.split(',');
    whereClauses.push(`p.producername IN (${brandList.map(() => `$${paramIndex++}`).join(', ')})`);
    queryParams.push(...brandList);
  }

  if (priceMin) {
    whereClauses.push(`CAST(NULLIF(p.pricegross, '') AS NUMERIC) >= $${paramIndex++}`);
    queryParams.push(parseFloat(priceMin));
  }
  if (priceMax) {
    whereClauses.push(`CAST(NULLIF(p.pricegross, '') AS NUMERIC) <= $${paramIndex++}`);
    queryParams.push(parseFloat(priceMax));
  }

  if (categories) {
    const categoryList = categories.split(',');
    joinClauses.push('JOIN product_categories pc ON p.ean = pc.ean');
    joinClauses.push('JOIN categories c ON pc.geko_category_id = c.geko_category_id');
    whereClauses.push(`c.geko_category_id IN (${categoryList.map(() => `$${paramIndex++}`).join(', ')})`);
    queryParams.push(...categoryList);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const joinClause = joinClauses.join('\n');

  let orderByClause = '';
  if (safeSortBy !== 'relevance') {
    const columnMap = {
      name: 'p.name',
      price: `CAST(NULLIF(p.pricegross, '') AS NUMERIC)`
    };
    orderByClause = `ORDER BY ${columnMap[safeSortBy]} ${safeOrder}`;
  }

  const limitValue = parseInt(limit, 10);
  const offsetValue = (parseInt(page, 10) - 1) * limitValue;

  const baseQuery = `
    FROM products AS p
    ${joinClause}
    ${whereClause}
  `;

  const countQuery = `SELECT COUNT(DISTINCT p.productid) ${baseQuery}`;
  const finalQuery = `
    SELECT DISTINCT
      p.productid,
      p.name,
      p.ean,
      p.shortdescription,
      p.pricegross,
      p.producername,
      (SELECT url FROM product_images WHERE ean = p.ean AND is_main = true ORDER BY sort_order ASC LIMIT 1) as image_url
    ${baseQuery}
    ${orderByClause}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  try {
    const [countResult, productsResult] = await Promise.all([
      pool.query(countQuery, queryParams),
      pool.query(finalQuery, [...queryParams, limitValue, offsetValue])
    ]);

    const totalProducts = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalProducts / limitValue);

    res.json({
      products: productsResult.rows.map(p => ({
        id: p.productid,
        name: p.name,
        description: p.shortdescription,
        price: p.pricegross,
        brand: p.producername,
        imageUrl: p.image_url || '/placeholder-product.jpg'
      })),
      pagination: {
        totalProducts,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: limitValue
      }
    });
  } catch (err) {
    console.error('Erro na query de produtos:', err.stack);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Exporta o router para ser usado no arquivo server.cjs
module.exports = router;
