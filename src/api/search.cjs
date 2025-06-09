// src/api/search.cjs
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

// Configure database connection with better error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  // Test the database connection
  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.error('❌ Failed to connect to the database:', err.message);
    } else {
      console.log('✅ Successfully connected to the database');
    }
  });
} catch (err) {
  console.error('❌ Error creating database pool:', err.message);
  process.exit(1);
}

// /api/search?q=search+term
router.get('/', async (req, res) => {
  const { q } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ 
      error: 'A pesquisa deve ter pelo menos 2 caracteres',
      code: 'INVALID_QUERY_LENGTH'
    });
  }

  // Validate database connection
  if (!pool) {
    console.error('Database connection pool is not initialized');
    return res.status(500).json({ 
      error: 'Database connection error',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  console.log(`🔍 Searching for: "${q}"`);
  
  try {
    // First, get the table structure
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `;
    const tables = await pool.query(tablesQuery);
    console.log('Available tables:', tables.rows.map(t => t.table_name));
    
    // Get products table structure
    const columnsQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'products';
    `;
    const columns = await pool.query(columnsQuery);
    console.log('Products table columns:', columns.rows);
    
    const searchTerm = `%${q}%`;
    
    // Build the search query with proper column names from the schema
    const queryText = `
      WITH product_search AS (
        SELECT 
          p.productid,
          p.name, 
          p.ean,
          p.pricegross as price,
          p.shortdescription as description,
          (
            SELECT pi.url 
            FROM product_images pi 
            WHERE pi.ean = p.ean 
            AND (pi.is_main = true OR pi.sort_order = 1)
            LIMIT 1
          ) as image_url,
          -- Search relevance scoring
          CASE 
            WHEN p.name ILIKE $1 THEN 1
            WHEN p.ean ILIKE $1 THEN 2
            WHEN p.shortdescription ILIKE $1 THEN 3
            WHEN p.longdescription ILIKE $1 THEN 4
            ELSE 5
          END as relevance
        FROM products p
        WHERE 
          p.name ILIKE $1 OR
          p.ean ILIKE $1 OR
          p.shortdescription ILIKE $1 OR
          p.longdescription ILIKE $1
      )
      SELECT 
        productid as id_products,
        name,
        ean,
        price,
        description as short_desc,
        COALESCE(image_url, '') as image_url
      FROM product_search
      ORDER BY relevance, name
      LIMIT 20`;
    
    const query = {
      text: queryText,
      values: [searchTerm]
    };
    
    console.log('Executing query:', query.text.replace(/\s+/g, ' ').trim());
    
    try {
      const result = await pool.query(query);
      console.log(`Found ${result.rows.length} results`);
      
      // If no results, try a more extensive search in specifications JSON
      if (result.rows.length === 0) {
        console.log('No results in primary search, trying fallback search in specifications');
        const fallbackQuery = {
          text: `
            WITH product_search AS (
              SELECT 
                p.productid,
                p.name, 
                p.ean,
                p.pricegross as price,
                p.shortdescription as description,
                p.specifications_json->>'description' as spec_description,
                (
                  SELECT pi.url 
                  FROM product_images pi 
                  WHERE pi.ean = p.ean 
                  AND (pi.is_main = true OR pi.sort_order = 1)
                  LIMIT 1
                ) as image_url
              FROM products p
              WHERE p.specifications_json::text ILIKE $1
                OR p.longdescription ILIKE $1
              LIMIT 10
            )
            SELECT 
              productid as id_products,
              name,
              ean,
              price,
              COALESCE(description, spec_description, '') as short_desc,
              COALESCE(image_url, '') as image_url
            FROM product_search
            ORDER BY name
          `,
          values: [searchTerm]
        };
        
        console.log('Executing fallback query:', fallbackQuery.text.replace(/\s+/g, ' ').trim());
        const fallbackResult = await pool.query(fallbackQuery);
        console.log(`Found ${fallbackResult.rows.length} results in fallback search`);
        return res.json(fallbackResult.rows);
      }
      
      return res.json(result.rows);
    } catch (err) {
      console.error('Search query error:', {
        message: err.message,
        query: q,
        timestamp: new Date().toISOString(),
        stack: err.stack
      });
      
      return res.status(500).json({ 
        error: 'Erro ao processar a busca', 
        details: process.env.NODE_ENV === 'development' ? err.message : undefined,
        code: 'SEARCH_ERROR'
      });
    }
    
    console.log('Executing search query:', query.text.replace(/\s+/g, ' ').trim());
    
    console.log('Executing query:', query.text.replace(/\s+/g, ' ').trim());

    console.log('Executing query:', query.text.replace(/\s+/g, ' ').trim());
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} results in primary search`);

    // If no results, try a more extensive search in descriptions
    if (result.rows.length === 0) {
      console.log('No results in primary search, trying fallback search');
      const fallbackQuery = {
        text: `
          SELECT 
            p.id_products, 
            p.name, 
            p.ean, 
            p.price_gross,
            p.short_description as short_desc,
            COALESCE(pi.url, '') as image_url
          FROM products p
          LEFT JOIN product_images pi ON 
            p.id_products = pi.product_id_products AND 
            (pi.is_main = true OR pi.sort_order = 1)
          WHERE 
            p.long_description ILIKE $1
          GROUP BY p.id_products, p.name, p.ean, p.price_gross, p.short_description, pi.url
          ORDER BY p.name ASC
          LIMIT 10
        `,
        values: [searchTerm]
      };
      console.log('Executing fallback query:', fallbackQuery.text.replace(/\s+/g, ' ').trim());
      
      const fallbackResult = await pool.query(fallbackQuery);
      console.log(`Found ${fallbackResult.rows.length} results in fallback search`);
      return res.json(fallbackResult.rows);
    }

    // Return successful results
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Search error:', {
      message: err.message,
      stack: err.stack,
      query: q,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({ 
      error: 'Erro ao processar a busca',
      code: 'SEARCH_ERROR',
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        hint: err.hint,
        code: err.code
      } : undefined
    });
  }
});

module.exports = router;
