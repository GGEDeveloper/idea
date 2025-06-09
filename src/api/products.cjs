// src/api/products.cjs
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// GET /api/products/categories
// Endpoint para buscar todas as categorias de produtos com contagem de produtos
router.get('/categories', async (req, res) => {
  try {
    // Busca categorias da tabela categories e conta produtos em cada categoria
    const query = `
      SELECT 
        c.geko_category_id as id,
        c.name,
        c.path,
        c.parent_geko_category_id as parent_id,
        COUNT(pc.ean) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.geko_category_id = pc.geko_category_id
      GROUP BY c.geko_category_id, c.name, c.path, c.parent_geko_category_id
      ORDER BY c.path, c.name
    `;

    const result = await pool.query(query);

    // Mapeia os resultados para o formato esperado pelo frontend
    const categories = result.rows.map((row, index) => ({
      id: row.id,
      name: row.name,
      path: row.path,
      parent_id: row.parent_id || null,
      product_count: parseInt(row.product_count) || 0,
      // Adiciona um ícone baseado no índice (pode ser personalizado posteriormente)
      icon: ['tools', 'leaf', 'hammer', 'wrench', 'cogs', 'screwdriver'][index % 6] || 'box',
      // Descrição baseada no nome da categoria
      description: `Produtos na categoria ${row.name}`
    }));

    // Filtra apenas categorias principais (sem pai) ou com produtos
    const mainCategories = categories
      .filter(cat => !cat.parent_id || categories.every(c => c.id !== cat.parent_id))
      .sort((a, b) => b.product_count - a.product_count) // Ordena por quantidade de produtos
      .slice(0, 6); // Limita a 6 categorias principais

    res.json(mainCategories);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// GET /api/products
// Endpoint de detalhes completos do produto por EAN
// IMPORTANTE: /filters deve vir antes de /:ean
router.get('/filters', async (req, res) => {
  try {
    // Marcas/produtores
    const brandsResult = await pool.query(
      `SELECT DISTINCT producername FROM products WHERE producername IS NOT NULL AND producername <> '' ORDER BY producername ASC`
    );
    // Categorias
    const categoriesResult = await pool.query(
      `SELECT DISTINCT categoryname FROM products WHERE categoryname IS NOT NULL AND categoryname <> '' ORDER BY categoryname ASC`
    );
    // Voltagem (atributo dinâmico)
    const voltagesResult = await pool.query(
      `SELECT DISTINCT pa.value_text FROM product_attributes pa JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes WHERE a.name ILIKE 'voltagem' AND pa.value_text IS NOT NULL AND pa.value_text <> '' ORDER BY pa.value_text ASC`
    );
    // Atributos dinâmicos (exemplo: Cor, Material)
    const attributesResult = await pool.query(
      `SELECT a.name, pa.value_text FROM product_attributes pa JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes WHERE pa.value_text IS NOT NULL AND pa.value_text <> ''`
    );
    // Faixa de preço
    const priceResult = await pool.query(
      `SELECT MIN(pricegross::numeric) AS min, MAX(pricegross::numeric) AS max FROM products WHERE pricegross IS NOT NULL AND pricegross <> ''`
    );

    // Processar atributos dinâmicos
    const attributes = {};
    for (const row of attributesResult.rows) {
      if (!attributes[row.name]) attributes[row.name] = new Set();
      attributes[row.name].add(row.value_text);
    }
    // Converter sets para arrays ordenadas
    Object.keys(attributes).forEach(key => {
      attributes[key] = Array.from(attributes[key]).sort();
    });

    res.json({
      brands: brandsResult.rows.map(r => r.producername),
      categories: categoriesResult.rows.map(r => r.categoryname),
      voltages: voltagesResult.rows.map(r => r.value_text),
      attributes,
      price: {
        min: priceResult.rows[0].min,
        max: priceResult.rows[0].max
      }
    });
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [API] ERRO em GET /api/products/filters:`, err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/:ean', async (req, res) => {
  const ean = req.params.ean;
  try {
    // Buscar dados principais do produto
    const prodResult = await pool.query(`
      SELECT * FROM products WHERE ean = $1 LIMIT 1
    `, [ean]);
    if (!prodResult.rows.length) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const product = prodResult.rows[0];

    // Buscar todas as imagens do produto pelo EAN
    const imgResult = await pool.query(
      `SELECT url, is_main, sort_order FROM product_images WHERE ean = $1 ORDER BY is_main DESC NULLS LAST, sort_order ASC NULLS LAST, url ASC`,
      [ean]
    );
    product.images = imgResult.rows;

    // Buscar preços (se houver)
    let pricesResult = { rows: [] };
    try {
      pricesResult = await pool.query(
        `SELECT price_type, net_value, gross_value, currency FROM prices WHERE ean = $1`,
        [ean]
      );
    } catch (err) {
      console.error(`[API] ERRO ao buscar preços para produto ${ean}:`, err.message);
    }
    product.prices = pricesResult.rows;

    // Buscar variantes (se houver)
    let variantsResult = { rows: [] };
    try {
      variantsResult = await pool.query(
        `SELECT * FROM product_variants WHERE ean = $1`,
        [ean]
      );
    } catch (err) {
      console.error(`[API] ERRO ao buscar variantes para produto ${ean}:`, err.message);
    }
    product.variants = variantsResult.rows;

    // Buscar atributos dinâmicos (se houver)
    let attrsResult = { rows: [] };
    try {
      attrsResult = await pool.query(
        `SELECT a.name, pa.value_text, pa.value_number, pa.value_boolean FROM product_attributes pa JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes WHERE pa.ean = $1`,
        [ean]
      );
    } catch (err) {
      console.error(`[API] ERRO ao buscar atributos para produto ${ean}:`, err.message);
    }
    product.attributes = attrsResult.rows;

    // Buscar stock (se houver)
    let stockResult = { rows: [] };
    try {
      stockResult = await pool.query(
        `SELECT quantity FROM stock_levels WHERE geko_variant_stock_id IN (SELECT geko_variant_stock_id FROM product_variants WHERE ean = $1)`,
        [ean]
      );
    } catch (err) {
      console.error(`[API] ERRO ao buscar stock para produto ${ean}:`, err.message);
    }
    product.stock = stockResult.rows;

    res.json(product);
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [API] ERRO em GET /api/products/${req.params.ean}:`, err);
    res.status(500).json({ error: 'Database error', details: err.message, stack: err.stack });
  }
});

router.get('/', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] GET /api/products chamado.`);
  try {
    const result = await pool.query(
      `SELECT 
        p.productid,
        p.name,
        p.ean,
        p.sku,
        p.pricegross AS price,
        p.shortdescription AS short_desc,
        p.longdescription AS long_desc,
        p.producername,
        p.categoryname,
        p.stockquantity,
        i.url AS image_url
       FROM products p
       LEFT JOIN LATERAL (
         SELECT url FROM product_images
         WHERE ean = p.ean
         ORDER BY is_main DESC NULLS LAST, sort_order ASC NULLS LAST
         LIMIT 1
       ) i ON TRUE
       ORDER BY p.name ASC
       LIMIT 60`
    );
    res.json(result.rows);
    console.log(`[${timestamp}] [API] GET /api/products sucesso. Retornados ${result.rows.length} produtos.`);
  } catch (err) {
    console.error(`[${timestamp}] [API] ERRO em GET /api/products:`, err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET /api/products/filters
router.get('/filters', async (req, res) => {
  try {
    // Marcas/produtores
    const brandsResult = await pool.query(
      `SELECT DISTINCT producername FROM products WHERE producername IS NOT NULL AND producername <> '' ORDER BY producername ASC`
    );
    // Categorias
    const categoriesResult = await pool.query(
      `SELECT DISTINCT categoryname FROM products WHERE categoryname IS NOT NULL AND categoryname <> '' ORDER BY categoryname ASC`
    );
    // Voltagem (atributo dinâmico)
    const voltagesResult = await pool.query(
      `SELECT DISTINCT pa.value_text FROM product_attributes pa JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes WHERE a.name ILIKE 'voltagem' AND pa.value_text IS NOT NULL AND pa.value_text <> '' ORDER BY pa.value_text ASC`
    );
    // Atributos dinâmicos (exemplo: Cor, Material)
    const attributesResult = await pool.query(
      `SELECT a.name, pa.value_text FROM product_attributes pa JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes WHERE pa.value_text IS NOT NULL AND pa.value_text <> ''`
    );
    // Faixa de preço
    const priceResult = await pool.query(
      `SELECT MIN(pricegross::numeric) AS min, MAX(pricegross::numeric) AS max FROM products WHERE pricegross IS NOT NULL AND pricegross <> ''`
    );

    // Processar atributos dinâmicos
    const attributes = {};
    for (const row of attributesResult.rows) {
      if (!attributes[row.name]) attributes[row.name] = new Set();
      attributes[row.name].add(row.value_text);
    }
    // Converter sets para arrays ordenadas
    Object.keys(attributes).forEach(key => {
      attributes[key] = Array.from(attributes[key]).sort();
    });

    res.json({
      brands: brandsResult.rows.map(r => r.producername),
      categories: categoriesResult.rows.map(r => r.categoryname),
      voltages: voltagesResult.rows.map(r => r.value_text),
      attributes,
      price: {
        min: priceResult.rows[0].min,
        max: priceResult.rows[0].max
      }
    });
  } catch (err) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [API] ERRO em GET /api/products/filters:`, err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Exporta o router para ser usado no arquivo server.cjs
module.exports = router;
