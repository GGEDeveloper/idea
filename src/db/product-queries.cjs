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
 * @param {boolean} forCount - Indica se a cláusula é usada para contagem.
 * @returns {object} - { whereClause: string, queryParams: any[], paramIndex: number }
 */
function buildWhereClause(filters, forCount = false) {
  const whereClauses = [];
  const queryParams = [];
  let paramIndex = 1;
  const productAlias = forCount ? 'p_count' : 'p';

  // Filtro por marcas (múltiplas)
  if (filters.brands && typeof filters.brands === 'string' && filters.brands.trim() !== '') {
    const brandList = filters.brands.split(',').map(b => b.trim()).filter(b => b !== '');
    if (brandList.length > 0) {
      whereClauses.push(`${productAlias}.brand IN (${brandList.map(() => `$${paramIndex++}`).join(', ')})`);
      queryParams.push(...brandList);
    }
  }

  // Filtro por categorias (múltiplas) - Corrigido para processar lista de IDs
  if (filters.categoryId && typeof filters.categoryId === 'string' && filters.categoryId.trim() !== '') {
    const categoryList = filters.categoryId.split(',').map(c => c.trim()).filter(c => c !== '' && c !== 'null' && c !== 'undefined');
    if (categoryList.length > 0) {
      // Para categorias, queremos incluir produtos de categorias filhas também
      const categoryConditions = categoryList.map(() => {
        const condition = `(pc.category_id = $${paramIndex++} OR EXISTS (
          SELECT 1 FROM categories c_parent 
          WHERE c_parent.categoryid = pc.category_id 
          AND c_parent.path LIKE CONCAT((SELECT path FROM categories WHERE categoryid = $${paramIndex++}), '%')
        ))`;
        return condition;
      });
      
      whereClauses.push(`EXISTS (
        SELECT 1 FROM product_categories pc 
        WHERE pc.product_ean = ${productAlias}.ean 
        AND (${categoryConditions.join(' OR ')})
      )`);
      
      // Adicionar os parâmetros (cada categoria aparece 2 vezes na query)
      categoryList.forEach(catId => {
        queryParams.push(catId, catId);
      });
    }
  }

  // Filtro por destaque
  if (filters.is_featured !== undefined && filters.is_featured !== null && String(filters.is_featured).trim() !== '') {
    const isFeaturedValue = String(filters.is_featured).toLowerCase() === 'true';
    whereClauses.push(`${productAlias}.is_featured = $${paramIndex++}`);
    queryParams.push(isFeaturedValue);
  }

  // Filtros rápidos adicionais
  // Filtro por stock disponível
  if (filters.hasStock === true || String(filters.hasStock).toLowerCase() === 'true') {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM product_variants pv_stock 
      WHERE pv_stock.ean = ${productAlias}.ean 
      AND pv_stock.stockquantity > 0
    )`);
  }

  // Filtro por produtos em promoção
  if (filters.onSale === true || String(filters.onSale).toLowerCase() === 'true') {
    whereClauses.push(`EXISTS (
      SELECT 1 FROM product_variants pv_sale 
      WHERE pv_sale.ean = ${productAlias}.ean 
      AND pv_sale.is_on_sale = true
    )`);
  }

  // Filtro por produtos novos (últimos 30 dias)
  if (filters.isNew === true || String(filters.isNew).toLowerCase() === 'true') {
    whereClauses.push(`${productAlias}.created_at >= NOW() - INTERVAL '30 days'`);
  }

  // Filtro por preços
  if (filters.priceMin || filters.priceMax) {
    const basePriceListId = '(SELECT price_list_id FROM price_lists WHERE name = \'Base Selling Price\' LIMIT 1)';
    let priceConditions = [];
    
    if (filters.priceMin) {
        const priceMinNum = parseFloat(String(filters.priceMin).replace(',', '.'));
        if (!isNaN(priceMinNum)) {
            priceConditions.push(`pr_filter.price >= $${paramIndex++}`);
            queryParams.push(priceMinNum);
        }
    }
    
    if (filters.priceMax) {
        const priceMaxNum = parseFloat(String(filters.priceMax).replace(',', '.'));
        if (!isNaN(priceMaxNum)) {
            priceConditions.push(`pr_filter.price <= $${paramIndex++}`);
            queryParams.push(priceMaxNum);
        }
    }
    
    if (priceConditions.length > 0) {
      whereClauses.push(`
        EXISTS (
            SELECT 1 FROM product_variants pv_filter
            JOIN prices pr_filter ON pv_filter.variantid = pr_filter.variantid
            WHERE pv_filter.ean = ${productAlias}.ean 
            AND pr_filter.price_list_id = ${basePriceListId}
            AND ${priceConditions.join(' AND ')}
        )
      `);
    }
  }

  // Filtro por busca textual
  if (filters.searchQuery && typeof filters.searchQuery === 'string' && String(filters.searchQuery).trim() !== '') {
    const searchTerm = `%${String(filters.searchQuery).trim()}%`;
    const searchConditions = [
        `${productAlias}.name ILIKE $${paramIndex}`,
        `${productAlias}.ean ILIKE $${paramIndex + 1}`,
        `${productAlias}.shortdescription ILIKE $${paramIndex + 2}`,
        `${productAlias}.longdescription ILIKE $${paramIndex + 3}`,
        `${productAlias}.brand ILIKE $${paramIndex + 4}`
    ];
    whereClauses.push(`(${searchConditions.join(' OR ')})`);
    for(let i=0; i<5; i++) queryParams.push(searchTerm);
    paramIndex += 5;
  } 

  // Filtro por status ativo/inativo
  if (filters.active !== undefined && filters.active !== null) {
    whereClauses.push(`${productAlias}.active = $${paramIndex++}`);
    queryParams.push(filters.active);
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
  const { whereClause, queryParams } = buildWhereClause(filters, true);
  const countQuery = `
    SELECT COUNT(DISTINCT p_count.ean) 
    FROM products p_count 
    ${whereClause}
  `;
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
  const { whereClause, queryParams, paramIndex: buildClauseParamIndex } = buildWhereClause(filters, false);
  let currentParamIndex = buildClauseParamIndex;

  const validSortColumns = ['name', 'price', 'created_at', 'brand'];
  const safeSortBy = validSortColumns.includes(sortBy.toLowerCase()) ? sortBy : 'name';
  const safeOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const basePriceListId = '(SELECT price_list_id FROM price_lists WHERE name = \'Base Selling Price\' LIMIT 1)';
  
  const priceSubQuery = `
    (SELECT pr_display.price 
     FROM product_variants pv_display
     JOIN prices pr_display ON pv_display.variantid = pr_display.variantid
     WHERE pv_display.ean = p.ean AND pr_display.price_list_id = ${basePriceListId}
     ORDER BY pv_display.variantid ASC
     LIMIT 1
    ) 
  `;

  const sortExpression = safeSortBy === 'price' 
    ? `(SELECT pr_sort.price FROM product_variants pv_sort JOIN prices pr_sort ON pv_sort.variantid = pr_sort.variantid WHERE pv_sort.ean = p.ean AND pr_sort.price_list_id = ${basePriceListId} ORDER BY pv_sort.variantid ASC LIMIT 1)`
    : `p.${safeSortBy}`;

  const query = `
    SELECT 
      p.ean, p.name, p.brand, p.active, p.shortdescription, p.is_featured, p.created_at, p.updated_at,
      ${priceSubQuery} as product_price,
      (SELECT json_agg(cat ORDER BY cat.path) FROM 
        (SELECT c.categoryid, c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img ORDER BY img.is_primary DESC, img.imageid) FROM 
        (SELECT imageid, url, alt, is_primary FROM product_images WHERE ean = p.ean) as img
      ) as images,
      (SELECT SUM(pv_stock.stockquantity) FROM product_variants pv_stock WHERE pv_stock.ean = p.ean) as total_stock
    FROM products p
    ${whereClause}
    ORDER BY ${sortExpression} ${safeOrder} NULLS LAST, p.ean ASC
    LIMIT $${currentParamIndex++} OFFSET $${currentParamIndex++}
  `;
  
  const finalQueryParams = [...queryParams, limit, offset];
  const { rows } = await pool.query(query, finalQueryParams);
  return rows.map(row => ({...row, price: row.product_price })); 
}

/**
 * Busca um único produto por seu EAN, juntamente com todos os dados relacionados.
 * @param {string} ean - O EAN do produto.
 * @returns {Promise<object|null>} - O objeto do produto ou nulo se não for encontrado.
 */
async function getProductByEan(ean) {
  const basePriceListId = '(SELECT price_list_id FROM price_lists WHERE name = \'Base Selling Price\' LIMIT 1)';
  const promotionalPriceListId = '(SELECT price_list_id FROM price_lists WHERE name = \'Promotional Price\' LIMIT 1)';
  
    const query = `
    SELECT 
      p.ean, p.name, p.brand, p.active, p.shortdescription, p.longdescription, p.productid, p.created_at, p.updated_at, p.is_featured,
      (SELECT pr.price 
       FROM product_variants pv 
       JOIN prices pr ON pv.variantid = pr.variantid 
       WHERE pv.ean = p.ean AND pr.price_list_id = ${basePriceListId}
       ORDER BY pv.variantid ASC LIMIT 1
      ) as product_price, 
      (SELECT json_agg(cat ORDER BY cat.path) FROM 
        (SELECT c.categoryid, c.name, c.path FROM categories c JOIN product_categories pc ON c.categoryid = pc.category_id WHERE pc.product_ean = p.ean) as cat
      ) as categories,
      (SELECT json_agg(img ORDER BY img.is_primary DESC, img.imageid) FROM 
        (SELECT imageid, url, alt, is_primary FROM product_images WHERE ean = p.ean) as img
      ) as images,
      (SELECT json_agg(var ORDER BY var.variantid) FROM
        (SELECT pv_detail.variantid, pv_detail.name as variant_name, pv_detail.stockquantity, pv_detail.supplier_price, pv_detail.is_on_sale, 
                (SELECT pr_detail.price FROM prices pr_detail WHERE pr_detail.variantid = pv_detail.variantid AND pr_detail.price_list_id = ${basePriceListId} LIMIT 1) as base_selling_price,
                (SELECT pr_promo.price FROM prices pr_promo WHERE pr_promo.variantid = pv_detail.variantid AND pr_promo.price_list_id = ${promotionalPriceListId} LIMIT 1) as promotional_price
         FROM product_variants pv_detail WHERE pv_detail.ean = p.ean
        ) as var
      ) as variants,
      (SELECT json_agg(attr ORDER BY attr.key) FROM
        (SELECT attributeid, "key", "value" FROM product_attributes WHERE product_ean = p.ean) as attr
      ) as attributes
    FROM products p
    WHERE p.ean = $1
  `;
  
  const { rows } = await pool.query(query, [ean]);
  if (rows.length > 0) {
    const product = rows[0];
    return {...product, price: product.product_price };
  }
  return null;
}

/**
 * Cria um novo produto e as suas entidades relacionadas (preço, etc.) numa transação.
 * @param {object} productData - Os dados do produto a ser criado.
 * @returns {Promise<object>} - O produto recém-criado.
 */
async function createProduct(productData) {
  const { ean, productid, name, shortdescription, longdescription, brand, price, active = true } = productData;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Inserir na tabela products
    const productQuery = `
      INSERT INTO products(ean, productid, name, shortdescription, longdescription, brand, active)
      VALUES($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const { rows: [newProduct] } = await client.query(productQuery, [ean, productid, name, shortdescription, longdescription, brand, active]);
    
        // Criar uma variante padrão para o produto
    const defaultVariantId = `${newProduct.ean}_DEFAULT`;
    const variantQuery = `
      INSERT INTO product_variants(variantid, ean, name, stockquantity, supplier_price, is_on_sale)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const supplierPrice = price ? price * 0.8 : 0; // Assumir que preço de venda é 25% markup sobre fornecedor
    const { rows: [newVariant] } = await client.query(variantQuery, [
      defaultVariantId, 
      newProduct.ean, 
      `${newProduct.name} - Default`, 
      0, // stock inicial
      supplierPrice,
      false
    ]);

    // Inserir o preço na lista de preços 'Base Selling Price'
    if (price) {
      const priceListQuery = "SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price';";
      const { rows: [priceList] } = await client.query(priceListQuery);
      if (!priceList) throw new Error("A lista de preços 'Base Selling Price' não foi encontrada.");
      
      const priceQuery = `
        INSERT INTO prices(variantid, price_list_id, price)
        VALUES($1, $2, $3);
      `;
      await client.query(priceQuery, [newVariant.variantid, priceList.price_list_id, price]);
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