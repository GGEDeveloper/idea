// src/api/search.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// /api/search?q=termo
router.get('/', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query too short' });
  }
  try {
    const result = await pool.query(
      `SELECT id_products, name, ean, sku, price, short_desc, image_url
       FROM products
       WHERE name ILIKE $1 OR ean ILIKE $1 OR sku ILIKE $1
       ORDER BY name ASC
       LIMIT 20`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
