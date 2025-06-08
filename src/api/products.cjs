// src/api/products.cjs
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// GET /api/products
// Endpoint de detalhes completos do produto por EAN
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

module.exports = router;
