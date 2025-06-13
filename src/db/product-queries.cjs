/**
 * Funções de consulta à base de dados para a entidade de Produtos.
 * Este módulo centraliza toda a lógica de acesso a dados de produtos.
 *
 * NOTA DE REFACTOR: Este ficheiro foi significativamente refatorado para se alinhar
 * com o novo schema da base de dados (V1). As principais mudanças incluem:
 * - Uso de 'ean' como chave primária em todas as operações.
 * - Confiança em tipos de dados numéricos (NUMERIC, INTEGER) para performance.
 * - Integração com o novo sistema de listas de preços.
 * - Remoção de funções de busca granulares em favor de uma query 'getProducts' mais rica.
 */
const pool = require('../../db/index.cjs'); // Corrigido para apontar para a raiz /db/index.cjs

/**
 * Constrói a cláusula WHERE para a query de produtos com base nos filtros fornecidos.
 * @param {object} filters - Objeto de filtros.
 * @returns {object} - { whereClause: string, queryParams: any[], paramIndex: number }
 */
function buildWhereClause(filters) {
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;

  if (filters.brands) {
    const brandList = filters.brands.split(',');
    whereClauses.push(`p.brand IN (${brandList.map(() => `$${paramIndex++}`).join(', ')})`);
    queryParams.push(...brandList);
  }

  if (filters.priceMin) {
    whereClauses.push(`pr.price >= $${paramIndex++}`);
    queryParams.push(filters.priceMin);
  }

  if (filters.priceMax) {
    whereClauses.push(`pr.price <= $${paramIndex++}`);
    queryParams.push(filters.priceMax);
  }

  if (filters.searchQuery) {
    whereClauses.push(`p.name ILIKE $${paramIndex++}`); // Usando ILIKE para busca simples
    queryParams.push(`%${filters.searchQuery}%`);
  }
  
  // Filtro por categoria (exemplo)
  if (filters.categoryId) {
    whereClauses.push(`p.ean IN (SELECT product_ean FROM product_categories WHERE category_id = $${paramIndex++})`);
    queryParams.push(filters.categoryId);
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : "";
  
  return { whereClause, queryParams, paramIndex };
}

/**
 * Conta o número total de produtos que correspondem a um determinado filtro.
 * @param {object} filters - Objeto de filtros.
 * @returns {Promise<number>} - O número total de produtos.
 */
async function countProducts(filters = {}) {
  // Para contagem, um JOIN simples com preços é necessário se houver filtro de preço
  const { whereClause, queryParams } = buildWhereClause(filters);
  let countQuery = `
    SELECT COUNT(DISTINCT p.ean) 
    FROM products p
  `;

  if (filters.priceMin || filters.priceMax) {
    countQuery += `
      LEFT JOIN prices pr ON p.ean = pr.product_ean
      LEFT JOIN price_lists pl ON pr.price_list_id = pl.price_list_id AND pl.name = 'Preço Base'
    `;
  }

  countQuery += ` ${whereClause}`;

  const { rows } = await pool.query(countQuery, queryParams);
  return parseInt(rows[0].count, 10) || 0;
}

/**
 * Busca uma lista paginada de produtos com base em filtros e ordenação.
 * @param {object} filters - Filtros a aplicar.
 * @param {object} pagination - Opções de paginação e ordenação.
 * @returns {Promise<object[]>} - Uma lista de produtos.
 */
async function getProducts(filters = {}, pagination = {}) {
  const { page = 1, limit = 20, sortBy = 'name', order = 'asc' } = pagination;
  const offset = (page - 1) * limit;

  const { whereClause, queryParams, paramIndex: initialParamIndex } = buildWhereClause(filters);
  let paramIndex = initialParamIndex;

  const validSortColumns = ['name', 'price', 'created_at', 'brand'];
  const safeSortBy = validSortColumns.includes(sortBy.toLowerCase()) ? sortBy : 'name';
  const safeOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const query = `
    SELECT 
      p.*,
      pr.price,
      (SELECT json_agg(cat) FROM 
        (SELECT c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img) FROM 
        (SELECT url, alt, is_primary FROM product_images WHERE ean = p.ean ORDER BY is_primary DESC) as img
      ) as images,
      (SELECT SUM(stockquantity) FROM product_variants WHERE ean = p.ean) as total_stock
    FROM products p
    LEFT JOIN prices pr ON p.ean = pr.product_ean
    LEFT JOIN price_lists pl ON pr.price_list_id = pl.price_list_id AND pl.name = 'Preço Base'
    ${whereClause}
    ORDER BY ${safeSortBy} ${safeOrder}, p.ean ASC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  
  const finalQueryParams = [...queryParams, limit, offset];

  const { rows } = await pool.query(query, finalQueryParams);
  return rows;
}

/**
 * Busca um único produto por seu EAN, juntamente com todos os dados relacionados.
 * @param {string} ean - O EAN do produto.
 * @returns {Promise<object|null>} - O objeto do produto ou nulo se não for encontrado.
 */
async function getProductByEan(ean) {
    const query = `
    SELECT 
      p.*,
      pr.price,
      (SELECT json_agg(cat) FROM 
        (SELECT c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img) FROM 
        (SELECT url, alt, is_primary FROM product_images WHERE ean = p.ean ORDER BY is_primary DESC) as img
      ) as images,
      (SELECT json_agg(var) FROM
        (SELECT name, stockquantity FROM product_variants WHERE ean = p.ean) as var
      ) as variants,
      (SELECT json_agg(attr) FROM
        (SELECT "key", "value" FROM product_attributes WHERE product_ean = p.ean) as attr
      ) as attributes
    FROM products p
    LEFT JOIN prices pr ON p.ean = pr.product_ean
    LEFT JOIN price_lists pl ON pr.price_list_id = pl.price_list_id AND pl.name = 'Preço Base'
    WHERE p.ean = $1
  `;
  
  const { rows } = await pool.query(query, [ean]);
  return rows[0] || null;
}

/**
 * Cria um novo produto e as suas entidades relacionadas (preço, etc.) numa transação.
 * @param {object} productData - Os dados do produto a ser criado.
 * @returns {Promise<object>} - O produto recém-criado.
 */
async function createProduct(productData) {
  const { ean, productid, name, shortdescription, longdescription, brand, price } = productData;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Inserir na tabela products
    const productQuery = `
      INSERT INTO products(ean, productid, name, shortdescription, longdescription, brand)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows: [newProduct] } = await client.query(productQuery, [ean, productid, name, shortdescription, longdescription, brand]);
    
    // Inserir o preço na lista de preços 'Preço Base'
    if (price) {
      const priceListQuery = "SELECT price_list_id FROM price_lists WHERE name = 'Preço Base';";
      const { rows: [priceList] } = await client.query(priceListQuery);
      if (!priceList) throw new Error("A lista de preços 'Preço Base' não foi encontrada.");
      
      const priceQuery = `
        INSERT INTO prices(product_ean, price_list_id, price)
        VALUES($1, $2, $3);
      `;
      await client.query(priceQuery, [newProduct.ean, priceList.price_list_id, price]);
    }
    
    await client.query('COMMIT');
    return newProduct;
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Erro ao criar produto:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Atualiza um produto existente. Por enquanto, focado na tabela principal.
 * @param {string} ean - O EAN do produto a ser atualizado.
 * @param {object} productData - Os novos dados do produto.
 * @returns {Promise<object>} - O produto atualizado.
 */
async function updateProduct(ean, productData) {
  // Simplificado para atualizar apenas a tabela principal por agora.
  // Uma versão completa atualizaria preços, imagens, etc. em uma transação.
  const { name, shortdescription, longdescription, brand, active } = productData;
  const query = `
    UPDATE products
    SET 
      name = COALESCE($1, name),
      shortdescription = COALESCE($2, shortdescription),
      longdescription = COALESCE($3, longdescription),
      brand = COALESCE($4, brand),
      active = COALESCE($5, active),
      updated_at = NOW()
    WHERE ean = $6
    RETURNING *;
  `;
  const { rows: [updatedProduct] } = await pool.query(query, [name, shortdescription, longdescription, brand, active, ean]);
  return updatedProduct;
}

/**
 * Ativa ou desativa um produto (soft delete).
 * @param {string} ean - O EAN do produto.
 * @param {boolean} isActive - O novo estado de ativação.
 * @returns {Promise<object>} - O produto com o estado atualizado.
 */
async function setProductStatus(ean, isActive) {
  const query = `
    UPDATE products
    SET active = $1, updated_at = NOW()
    WHERE ean = $2
    RETURNING *;
  `;
  const { rows: [product] } = await pool.query(query, [isActive, ean]);
  return product;
}

/**
 * Calcula o stock total para um ou mais produtos.
 * Agora usa dados da API Geko sincronizados com product_variants.
 * @param {string|string[]} eans - EAN único ou array de EANs
 * @returns {Promise<object>} - Mapeamento de EAN para quantidade de stock
 */
async function getProductsStocks(eans) {
  if (!eans) {
    throw new Error('EAN(s) são obrigatórios para buscar stock');
  }

  // Normalizar entrada para array
  const eanArray = Array.isArray(eans) ? eans : [eans];
  
  if (eanArray.length === 0) {
    return {};
  }

  // Query otimizada para buscar stock agregado por EAN
  // Inclui tanto stock da Geko quanto stock local se existir
  const placeholders = eanArray.map((_, index) => `$${index + 1}`).join(', ');
  
  const query = `
    SELECT 
      p.ean,
      COALESCE(SUM(pv.stockquantity), 0) as local_stock,
      COALESCE(gp.stock_quantity, 0) as geko_stock,
      COALESCE(SUM(pv.stockquantity), 0) + COALESCE(gp.stock_quantity, 0) as total_stock,
      gp.last_sync
    FROM products p
    LEFT JOIN product_variants pv ON p.ean = pv.ean
    LEFT JOIN geko_products gp ON p.ean = gp.ean
    WHERE p.ean IN (${placeholders})
    GROUP BY p.ean, gp.stock_quantity, gp.last_sync
    ORDER BY p.ean
  `;

  try {
    const { rows } = await pool.query(query, eanArray);
    
    // Transformar resultado em objeto mapeado por EAN
    const stockMap = {};
    
    rows.forEach(row => {
      stockMap[row.ean] = {
        totalStock: parseInt(row.total_stock, 10) || 0,
        localStock: parseInt(row.local_stock, 10) || 0,
        gekoStock: parseInt(row.geko_stock, 10) || 0,
        lastSync: row.last_sync,
        hasGekoData: row.last_sync !== null
      };
    });

    // Garantir que todos os EANs solicitados estão no resultado
    eanArray.forEach(ean => {
      if (!stockMap[ean]) {
        stockMap[ean] = {
          totalStock: 0,
          localStock: 0,
          gekoStock: 0,
          lastSync: null,
          hasGekoData: false
        };
      }
    });

    return stockMap;
    
  } catch (error) {
    console.error('Erro ao buscar stock de produtos:', error);
    throw error;
  }
}

/**
 * Versão simplificada que retorna apenas o número total de stock
 * (mantida para compatibilidade com código existente)
 * @param {string|string[]} eans - EAN único ou array de EANs
 * @returns {Promise<object>} - Mapeamento de EAN para número de stock
 */
async function getProductsStocksSimple(eans) {
  const stockData = await getProductsStocks(eans);
  
  const simpleMap = {};
  Object.keys(stockData).forEach(ean => {
    simpleMap[ean] = stockData[ean].totalStock;
  });
  
  return simpleMap;
}

/**
 * Busca stock para um único produto
 * @param {string} ean - EAN do produto
 * @returns {Promise<number>} - Quantidade de stock total
 */
async function getProductStock(ean) {
  const stockData = await getProductsStocks(ean);
  return stockData[ean]?.totalStock || 0;
}

module.exports = {
  countProducts,
  getProducts,
  getProductByEan,
  createProduct,
  updateProduct,
  setProductStatus,
  getProductsStocks,
  getProductsStocksSimple,
  getProductStock,
}; 