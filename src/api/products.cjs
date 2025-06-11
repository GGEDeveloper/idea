// src/api/products.cjs
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const router = express.Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Helper function to get all descendant category IDs including the base IDs
async function getDescendantCategoryIds(baseIds) {
  if (!baseIds || baseIds.length === 0) {
    return [];
  }
  
  console.log(`[API] Expanding category IDs: ${baseIds}`);
  
  // 1. Get the paths of the base categories
  const pathQuery = 'SELECT path FROM categories WHERE geko_category_id = ANY($1::int[])';
  const pathResult = await pool.query(pathQuery, [baseIds]);
  const paths = pathResult.rows.map(r => r.path);

  if (paths.length === 0) {
    return baseIds; // Return original IDs if no paths found
  }

  // 2. Build a query to find all categories whose path starts with one of the base paths
  const likeClauses = paths.map((_, i) => `path LIKE $${i + 1} || '%'`);
  const descendantQuery = `SELECT geko_category_id FROM categories WHERE ${likeClauses.join(' OR ')}`;
  
  const descendantResult = await pool.query(descendantQuery, paths);
  const descendantIds = descendantResult.rows.map(r => r.geko_category_id);
  
  // 3. Combine and return unique IDs
  const allIds = [...new Set([...baseIds, ...descendantIds].map(id => parseInt(id, 10)))];
  console.log(`[API] Expanded category IDs to: ${allIds.length} total IDs.`);
  return allIds;
}

// --- UTIL: Build category tree from path ---
/**
 * Constrói a árvore de categorias a partir do campo 'path' da tabela categories.
 * Cada nó terá um array 'children' com as subcategorias.
 * O campo 'parent_id' é ignorado para montagem da árvore.
 *
 * @param {Array} categories - Lista de categorias com campos {id, name, path, ...}
 * @returns {Array} Árvore de categorias aninhada
 */
function buildCategoryTreeFromPaths(categories) {
  const root = [];
  const pathMap = {};

  // First, create a map of all nodes by their path
  for (const cat of categories) {
    const node = {
      id: cat.id,
      name: cat.name,
      path: cat.path,
      productCount: parseInt(cat.product_count) || 0,
      directProductCount: parseInt(cat.direct_product_count) || 0,
      children: []
    };
    pathMap[cat.path] = node;
  }

  // Then, build the tree
  for (const cat of categories) {
    const pathParts = cat.path.split('/').filter(Boolean);
    if (pathParts.length === 1) {
      // Top-level
      root.push(pathMap[cat.path]);
    } else {
      // Find parent by joining all but last part
      const parentPath = pathParts.slice(0, -1).join('/');
      if (pathMap[parentPath]) {
        pathMap[parentPath].children.push(pathMap[cat.path]);
      } else {
        // Orphaned node, treat as root
        root.push(pathMap[cat.path]);
      }
    }
  }
  // Sort children alphabetically
  function sortTree(nodes) {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    for (const n of nodes) sortTree(n.children);
  }
  sortTree(root);
  return root;
}

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

// GET /api/products/filters
// Endpoint para obter opções de filtro disponíveis
// A árvore de categorias retornada é baseada em 'path' e já vem aninhada.
router.get('/filters', async (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] GET /api/products/filters chamado`);
  
  try {
    // 1. Buscar marcas/produtores
    const brandsResult = await pool.query(
      `SELECT DISTINCT producername 
       FROM products 
       WHERE producername IS NOT NULL 
       AND producername <> '' 
       AND producername != 'null' 
       AND producername != 'NULL'
       ORDER BY producername ASC`
    );
    
    // 2. Buscar categorias hierárquicas com contagem de produtos
    console.log('[API] Buscando categorias hierárquicas...');
    let categories = [];
    
    try {
      const allCategories = await pool.query(`
        WITH category_products AS (
          SELECT 
            c.geko_category_id,
            c.name,
            c.path,
            c.parent_geko_category_id,
            COUNT(pc.ean) as product_count
          FROM categories c
          LEFT JOIN product_categories pc ON c.geko_category_id = pc.geko_category_id
          WHERE c.name IS NOT NULL 
          AND c.name <> ''
          GROUP BY c.geko_category_id, c.name, c.path, c.parent_geko_category_id
        )
        SELECT 
          cp.geko_category_id as id,
          cp.name,
          cp.path,
          cp.parent_geko_category_id as parent_id,
          cp.product_count,
          (SELECT COUNT(*) FROM product_categories WHERE geko_category_id = cp.geko_category_id) as direct_product_count
        FROM category_products cp
        ORDER BY cp.path, cp.name
      `);
      console.log(`[API] Total de categorias encontradas: ${allCategories.rows.length}`);
      
      // --- USE PATH-BASED TREE BUILDER ---
      categories = buildCategoryTreeFromPaths(allCategories.rows);
      
      console.log(`[API] Categorias principais: ${categories.length}`);
      if (categories.length > 0) {
        console.log(`[API] Primeira categoria:`, {
          name: categories[0].name,
          id: categories[0].id,
          childrenCount: categories[0].children?.length || 0,
          sampleChildren: categories[0].children?.slice(0, 2).map(c => c.name) || []
        });
      }
      
      // Log de amostra das categorias que serão retornadas
      console.log('[API] Amostra de categorias a serem retornadas:', 
        JSON.stringify(categories.slice(0, 2), null, 2)
      );
      
    } catch (err) {
      console.error('[API] Erro ao buscar categorias:', err.message);
      categories = [];
    }
    
    // 3. Se não encontrou categorias, tenta buscar categorias alternativas nos produtos
    if (categories.length === 0) {
      console.log('[API] Nenhuma categoria encontrada na tabela categories, buscando diretamente dos produtos...');
      try {
        const altCategoriesResult = await pool.query(
          `SELECT DISTINCT categoryname as name, COUNT(*) as product_count
           FROM products 
           WHERE categoryname IS NOT NULL 
           AND categoryname <> ''
           AND categoryname != 'null' 
           AND categoryname != 'NULL'
           GROUP BY categoryname
           HAVING COUNT(*) > 0
           ORDER BY categoryname ASC`
        );
        console.log(`[API] Categorias encontradas nos produtos: ${altCategoriesResult.rows.length}`);
        
        categories = altCategoriesResult.rows.map((cat, index) => ({
          id: `temp-${index}`,
          name: cat.name,
          path: cat.name.toLowerCase().replace(/\s+/g, '-'),
          product_count: cat.product_count
        }));
      } catch (err) {
        console.error('[API] Erro ao buscar categorias dos produtos:', err.message);
        // Mantém o array de categorias vazio se não encontrar nada
      }
    }

    // 4. Buscar atributos dinâmicos
    const attributesResult = await pool.query(
      `SELECT DISTINCT a.name, pa.value_text 
       FROM product_attributes pa 
       JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes 
       WHERE pa.value_text IS NOT NULL 
       AND pa.value_text <> ''
       AND pa.value_text != 'null'
       AND pa.value_text != 'NULL'`
    );
    
    // 5. Buscar faixa de preço
    const priceResult = await pool.query(
      `SELECT 
         COALESCE(MIN(NULLIF(pricegross, '')::numeric), 0) AS min, 
         COALESCE(MAX(NULLIF(pricegross, '')::numeric), 1000) AS max 
       FROM products 
       WHERE pricegross IS NOT NULL 
       AND pricegross <> ''
       AND pricegross != 'null'
       AND pricegross != 'NULL'`
    );

    // Processar atributos dinâmicos
    const attributes = {};
    for (const row of attributesResult.rows) {
      if (!attributes[row.name]) attributes[row.name] = new Set();
      if (row.value_text) {
        attributes[row.name].add(row.value_text);
      }
    }
    
    // Converter sets para arrays ordenadas
    Object.keys(attributes).forEach(key => {
      attributes[key] = Array.from(attributes[key]).sort();
    });

    // Função para formatar a árvore de categorias mantendo a hierarquia
    const formatCategoryTree = (categories) => {
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        path: category.path,
        productCount: category.productCount || 0,
        directProductCount: category.directProductCount || 0,
        children: category.children ? formatCategoryTree(category.children) : []
      }));
    };

    const response = {
      brands: brandsResult.rows.map(r => r.producername).filter(Boolean),
      categories: formatCategoryTree(categories),
      attributes,
      price: {
        min: Math.floor(Number(priceResult.rows[0]?.min)) || 0,
        max: Math.ceil(Number(priceResult.rows[0]?.max)) || 1000
      }
    };

    console.log(`[${timestamp}] [API] GET /api/products/filters sucesso.`, {
      brands: response.brands.length,
      categories: response.categories.length,
      attributes: Object.keys(response.attributes).length,
      price: response.price
    });

    res.json(response);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [API] ERRO em GET /api/products/filters:`, err);
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

router.get('/:ean', async (req, res) => {
  const { ean } = req.params;
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [API] GET /api/products/${ean} chamado`);

  try {
    const query = `
      SELECT
        p.*,
        p.producername as brand_name,
        (SELECT c.path FROM product_categories pc JOIN categories c ON pc.geko_category_id = c.geko_category_id WHERE pc.ean = p.ean LIMIT 1) as category_path,
        (SELECT json_agg(json_build_object('url', img.url, 'is_main', img.is_main, 'sort_order', img.sort_order)) FROM product_images img WHERE img.ean = p.ean) as images,
        (SELECT json_agg(json_build_object('name', a.name, 'value', pa.value_text))
         FROM product_attributes pa
         JOIN attributes a ON pa.attribute_id_attributes = a.id_attributes
         WHERE pa.product_id_products = p.productid::integer) as attributes,
        (SELECT json_agg(json_build_object('type', pr.price_type, 'net', pr.net_value, 'gross', pr.gross_value, 'currency', pr.currency))
         FROM prices pr WHERE pr.ean = p.ean) as prices
      FROM products p
      WHERE p.ean = $1;
    `;

    console.log(`[${timestamp}] [API] Executing query for EAN: ${ean}`);
    const result = await pool.query(query, [ean]);

    if (result.rows.length === 0) {
      console.log(`[${timestamp}] [API] Produto com EAN ${ean} não encontrado.`);
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const product = result.rows[0];

    // Ensure JSON fields are empty arrays instead of null
    product.images = product.images || [];
    product.attributes = product.attributes || [];
    product.prices = product.prices || [];

    // Sort images: main image first, then by sort_order
    product.images.sort((a, b) => {
      if (a.is_main && !b.is_main) return -1;
      if (!a.is_main && b.is_main) return 1;
      return (a.sort_order || 99) - (b.sort_order || 99);
    });

    console.log(`[${timestamp}] [API] Produto ${ean} encontrado e retornado com sucesso.`);
    res.json(product);

  } catch (err) {
    console.error(`[${timestamp}] [API] ERRO em GET /api/products/${ean}:`, err);
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message 
    });
  }
});

router.get('/', async (req, res) => {
  const { categories, brands, priceMin, priceMax } = req.query;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] [API] GET /api/products chamado com filtros:`, {
    categories,
    brands,
    priceMin,
    priceMax
  });
  
  try {
    let query = `
      SELECT 
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
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Filtro por categoria (hierárquico)
    if (req.query.categories) {
      const baseCategoryIds = req.query.categories.split(',').map(id => parseInt(id, 10)).filter(id => !isNaN(id));
      if (baseCategoryIds.length > 0) {
        const allCategoryIds = await getDescendantCategoryIds(baseCategoryIds);
        if (allCategoryIds.length > 0) {
          query += ` AND pc.geko_category_id = ANY($${paramIndex}::int[])`;
          params.push(allCategoryIds);
          paramIndex++;
        }
      }
    }
    // Filtro por marcas
    if (brands) {
      const brandList = brands.split(',').map(b => b.trim());
      query += ` AND p.producername = ANY($${paramIndex}::text[])`;
      params.push(brandList);
      paramIndex++;
    }
    
    // Filtro por preço mínimo (apenas se for maior que 0)
    if (priceMin && priceMin !== '0') {
      query += ` AND p.pricegross::numeric >= $${paramIndex}::numeric`;
      params.push(priceMin);
      paramIndex++;
    } else if (priceMin === '0') {
      // Se o preço mínimo for 0, não aplicamos o filtro de preço mínimo
      console.log(`[${timestamp}] [API] Ignorando filtro de preço mínimo (0)`);
    }
    
    // Filtro por preço máximo (apenas se for maior que 0 e diferente do preço máximo possível)
    if (priceMax && priceMax !== '0' && priceMax !== '745.92') {
      query += ` AND p.pricegross::numeric <= $${paramIndex}::numeric`;
      params.push(priceMax);
      paramIndex++;
    } else if (priceMax === '0') {
      // Se o preço máximo for 0, não aplicamos o filtro de preço máximo
      console.log(`[${timestamp}] [API] Ignorando filtro de preço máximo (0)`);
    }
    
    // Ordenação e limite
    query += ` ORDER BY p.name ASC LIMIT 60`;
    
    console.log(`[${timestamp}] [API] Query SQL:`, query);
    console.log(`[${timestamp}] [API] Parâmetros:`, params);
    
    const result = await pool.query(query, params);
    
    console.log(`[${timestamp}] [API] GET /api/products sucesso. Retornados ${result.rows.length} produtos.`);
    res.json(result.rows);
  } catch (err) {
    console.error(`[${timestamp}] [API] ERRO em GET /api/products:`, err);
    res.status(500).json({ 
      error: 'Database error', 
      details: err.message,
      query: query,
      params: params
    });
  }
});

// A rota /api/products/filters foi movida para o início do arquivo com uma implementação mais completa

// Rota de diagnóstico para verificar a estrutura das tabelas
router.get('/_diagnostic/tables', async (req, res) => {
  try {
    // Verifica se as tabelas existem
        const tables = ['categories', 'product_categories', 'products', 'product_attributes', 'attributes', 'prices', 'product_images'];
    const results = {};
    
    for (const table of tables) {
      try {
        const result = await pool.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_name = '${table}'
          ORDER BY ordinal_position
        `);
        results[table] = {
          exists: true,
          columns: result.rows,
          rowCount: (await pool.query(`SELECT COUNT(*) FROM ${table}`)).rows[0].count
        };
        
        // Se for a tabela de produtos, verifica se tem a coluna categoryname
        if (table === 'products') {
          const hasCategoryName = result.rows.some(col => col.column_name === 'categoryname');
          results[table].hasCategoryName = hasCategoryName;
          
          if (hasCategoryName) {
            const sampleCategories = await pool.query(
              `SELECT DISTINCT categoryname FROM products WHERE categoryname IS NOT NULL LIMIT 5`
            );
            results[table].sampleCategories = sampleCategories.rows;
          }
        }
      } catch (err) {
        results[table] = {
          exists: false,
          error: err.message
        };
      }
    }
    
    // Verifica se há categorias na tabela de produtos
    try {
      const productCategories = await pool.query(`
        SELECT DISTINCT categoryname, COUNT(*) as product_count
        FROM products 
        WHERE categoryname IS NOT NULL 
        AND categoryname <> ''
        AND categoryname != 'null' 
        AND categoryname != 'NULL'
        GROUP BY categoryname
        ORDER BY product_count DESC
        LIMIT 10
      `);
      results.productCategories = productCategories.rows;
    } catch (err) {
      results.productCategories = { error: err.message };
    }
    
    // Tenta listar as primeiras 5 categorias da tabela categories
    try {
      const categoriesSample = await pool.query(
        `SELECT * FROM categories LIMIT 5`
      );
      results.categoriesSample = categoriesSample.rows;
    } catch (err) {
      results.categoriesSample = { error: err.message };
    }
    
    // Tenta listar as primeiras 5 associações de product_categories
    try {
      const productCategoriesSample = await pool.query(
        `SELECT * FROM product_categories LIMIT 5`
      );
      results.productCategoriesSample = productCategoriesSample.rows;
    } catch (err) {
      results.productCategoriesSample = { error: err.message };
    }
    
    res.json(results);
  } catch (err) {
    console.error('Erro no diagnóstico de tabelas:', err);
    res.status(500).json({ error: 'Erro no diagnóstico', details: err.message });
  }
});

// Exporta o router para ser usado no arquivo server.cjs
module.exports = router;
