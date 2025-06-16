// src/api/search.cjs
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const { optionalUser } = require('./middleware/auth.cjs'); // Import optionalUser

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
      console.error('❌ Failed to connect to the database for search API:', err.message);
    } else {
      console.log('✅ Successfully connected to the database for search API');
    }
  });
} catch (err) {
  console.error('❌ Error creating database pool for search API:', err.message);
  process.exit(1);
}

// /api/search?q=search+term
router.get('/', optionalUser, async (req, res) => {
  const { q } = req.query;
  const localUser = req.localUser; // Get user from middleware
  
  if (!q || q.length < 2) {
    return res.status(400).json({ 
      error: 'A pesquisa deve ter pelo menos 2 caracteres',
      code: 'INVALID_QUERY_LENGTH'
    });
  }

  if (!pool) {
    console.error('Search API: Database connection pool is not initialized');
    return res.status(500).json({ 
      error: 'Database connection error',
      code: 'DATABASE_CONNECTION_ERROR'
    });
  }

  console.log(`🔍 Searching for: "${q}". User: ${localUser ? localUser.email : 'Guest'}`);
  
  try {
    const searchTerm = `%${q}%`;
    
    // Build the search query with proper column names from the schema
    const queryText = `
      WITH product_search AS (
        SELECT 
          p.productid,      -- Geko's original product ID
          p.name, 
          p.ean,            -- Our primary key for products
          p.shortdescription,
          p.longdescription,
          -- Subquery for price (Base Selling Price)
          (SELECT price FROM prices pr
           JOIN product_variants pv ON pr.variantid = pv.variantid
           WHERE pv.ean = p.ean AND pr.price_list_id = 2 -- Base Selling Price (ID 2)
           ORDER BY pv.variantid -- Consistent price if multiple variants
           LIMIT 1) AS product_price,
          -- Subquery for image URL
          COALESCE(
            (SELECT url FROM product_images WHERE ean = p.ean AND is_primary = TRUE LIMIT 1), -- Primary image
            (SELECT url FROM product_images WHERE ean = p.ean LIMIT 1), -- Any image as fallback
            '/placeholder-product.jpg' -- Default placeholder if no image
          ) AS image_url,
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
        p_search.ean AS id_products, -- Use EAN for navigation consistency
        p_search.name,
        p_search.ean,
        p_search.product_price AS price, -- Use the derived product_price
        p_search.shortdescription AS short_desc,
        p_search.image_url
      FROM product_search p_search
      ORDER BY p_search.relevance, p_search.name
      LIMIT 20`; // Limit results for search dropdown
    
    const query = {
      text: queryText,
      values: [searchTerm]
    };
    
    console.log('Executing search query (simplified):', query.text.substring(0, 300).replace(/\s+/g, ' ') + '...');
    
      const result = await pool.query(query);
    console.log(`Found ${result.rows.length} results for "${q}"`);
    
    const canViewPrice = localUser && localUser.permissions && localUser.permissions.includes('view_price');

    const sanitizedResults = result.rows.map(product => {
      if (canViewPrice) {
        return product;
      }
      const { price, ...rest } = product;
      return { ...rest, price: null, priceStatus: localUser ? 'permission_denied' : 'unauthenticated' };
    });
    
    return res.json(sanitizedResults);

  } catch (err) {
    console.error('❌ Search error:', {
      message: err.message,
      stack: err.stack, // Full stack for detailed debugging
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
