// src/api/products.cjs
const express = require('express');
const pool = require('../../db/index.cjs');
// const clerk = require('@clerk/clerk-sdk-node'); // REMOVIDO - SDK antigo, não é usado diretamente aqui
const { buildCategoryTreeFromPaths } = require('./utils/category-utils.cjs');
const productQueries = require('../db/product-queries.cjs');
const { requireAdmin } = require('./middleware/localAuth.cjs');

const router = express.Router();

/**
 * Remove campos sensíveis (preço, stock) de um objeto de produto
 * se o utilizador não tiver a permissão 'view_price'.
 * @param {object} product - O objeto do produto.
 * @param {object} localUser - O perfil do utilizador do nosso sistema (com permissões).
 * @returns {object} O objeto do produto, possivelmente modificado.
 */
function sanitizeProductForUser(product, localUser) {
  // Adicionar logs detalhados aqui
  console.log('[sanitizeProductForUser] localUser recebido:', localUser ? { email: localUser.email, permissions: localUser.permissions, role: localUser.role_name } : null);
  const canViewPrice = localUser && localUser.permissions && localUser.permissions.includes('view_price');
  const canViewStock = localUser && localUser.permissions && localUser.permissions.includes('view_stock'); // Adicionar verificação de stock se necessário
  console.log(`[sanitizeProductForUser] Para produto EAN ${product.ean}: canViewPrice = ${canViewPrice}, canViewStock = ${canViewStock}`);

  if (canViewPrice) {
    // Se pode ver o preço, não fazemos nada ao stock a não ser que haja regra específica
    // Apenas retornamos o produto como está, assumindo que product_price é o preço de venda correto
    // e total_stock (ou similar) é o stock.
    // Se o stock também for condicional, adicionar lógica aqui.
    const productToSend = { ...product };
    if (!canViewStock) {
      // delete productToSend.total_stock; // Exemplo, se o nome do campo for total_stock
      // productToSend.stockStatus = localUser ? 'permission_denied_stock' : 'unauthenticated_stock';
      console.log(`[sanitizeProductForUser] Utilizador ${localUser ? localUser.email : 'Guest'} NÃO PODE VER STOCK para ${product.ean}`);
    }
    return productToSend;
  }

  const sanitizedProduct = { ...product };
  delete sanitizedProduct.price; // Supondo que 'price' é o campo de preço que não deve ser visto
  delete sanitizedProduct.product_price; // Se este também for um campo de preço sensível
  // delete sanitizedProduct.total_stock; // Remover também o stock se a permissão for conjunta ou se canViewStock for false
  
sanitizedProduct.priceStatus = localUser ? 'permission_denied' : 'unauthenticated';
  // if (!canViewStock) {
  //   sanitizedProduct.stockStatus = localUser ? 'permission_denied_stock' : 'unauthenticated_stock';
  // }
  console.log(`[sanitizeProductForUser] Produto ${product.ean} sanitizado para ${localUser ? localUser.email : 'Guest'}`);
  return sanitizedProduct;
}

// Função auxiliar para calcular o markup
// Temporariamente, usamos um markup fixo de 30%
function calculateMarkup(priceString) {
  if (typeof priceString !== 'string' || priceString.trim() === '') {
    return null;
  }
  // Tenta converter, substituindo vírgula por ponto para formatos europeus
  const priceNumber = parseFloat(priceString.replace(',', '.'));
  
  if (isNaN(priceNumber)) {
    return null;
  }
  
  // Aplica markup de 30%
  return priceNumber * 1.30;
  }

// Rota para buscar as opções de filtro (categorias, marcas, preços)
router.get('/filters', async (req, res) => {
  try {
    const [categoryData, brandData, priceData] = await Promise.all([
      pool.query('SELECT categoryid as id, name, "path" FROM categories ORDER BY "path"'),
      pool.query("SELECT DISTINCT brand as name FROM products WHERE brand IS NOT NULL AND brand <> '' ORDER BY name"),
      // Querying prices from the 'prices' table, specifically for the 'Base Selling Price' list
      pool.query("SELECT MIN(price) as min, MAX(price) as max FROM prices WHERE price_list_id = (SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price' LIMIT 1)")
    ]);
 
    const categoryTree = buildCategoryTreeFromPaths(categoryData.rows);

    const filterOptions = {
      categories: categoryTree,
      brands: brandData.rows.map(row => row.name),
      price: {
        min: parseFloat(priceData.rows[0].min) || 0,
        max: parseFloat(priceData.rows[0].max) || 10000, // Adjusted max based on typical product prices
      }
    };
    res.json(filterOptions);
  } catch (error) {
    console.error('[API] Erro ao buscar opções de filtros:', error);
    res.status(500).json({ error: 'Erro ao buscar opções de filtros.' });
  }
});

// Rota principal para buscar produtos
router.get('/', async (req, res) => {
  console.log('[API /api/products GET] User making request:', req.localUser ? req.localUser.email : 'Guest', 'Permissions:', req.localUser ? req.localUser.permissions : 'N/A');
  try {
    const { 
      page = 1, 
      limit, // Default limit will be set based on featured status
      sortBy: querySortBy,
      order: queryOrder,
      brands,
      categories, 
      priceMin,
      priceMax,
      q: searchQuery,
      featured, // New query parameter for featured products
      hasStock, // Quick filter for products with stock
      onSale,   // Quick filter for products on sale
      isNew     // Quick filter for new products
    } = req.query;

    let defaultSortBy = 'name';
    let defaultOrder = 'asc';
    const isFeaturedRequest = String(featured).toLowerCase() === 'true';

    if (isFeaturedRequest) {
      defaultSortBy = 'created_at'; // Default sort for featured items: newest first
      defaultOrder = 'desc';
    }

    const finalSortBy = querySortBy || defaultSortBy;
    const finalOrder = queryOrder || defaultOrder;
    
    // Set a smaller default limit for featured items, e.g., for a carousel
    const effectiveLimit = parseInt(limit, 10) || (isFeaturedRequest ? 5 : 20);
    const safeLimit = Math.min(effectiveLimit, 2000); // Cap limit

    const filters = {
      brands,
      categoryId: categories,
      priceMin,
      priceMax,
      searchQuery
    };

    // Only add is_featured to filters if it's explicitly true
    if (isFeaturedRequest) {
      filters.is_featured = true;
    }

    // Add quick filters
    if (hasStock === 'true') {
      filters.hasStock = true;
    }
    
    if (onSale === 'true') {
      filters.onSale = true;
    }
    
    if (isNew === 'true') {
      filters.isNew = true;
    }

    const pagination = { page: parseInt(page, 10), limit: safeLimit, sortBy: finalSortBy, order: finalOrder };

    // Log filters and pagination
    console.log('[API /api/products GET] Filters:', JSON.stringify(filters));
    console.log('[API /api/products GET] Pagination:', JSON.stringify(pagination));
    console.log('[API /api/products GET] Quick filters - hasStock:', hasStock, 'onSale:', onSale, 'isNew:', isNew);

    const [totalProducts, productsFromDB] = await Promise.all([
      productQueries.countProducts(filters),
      productQueries.getProducts(filters, pagination)
    ]);

    if (productsFromDB.length > 0) {
      console.log('[API /api/products GET] Produto cru da DB (primeiro da lista):', JSON.stringify(productsFromDB[0], null, 2));
    } else {
      console.log('[API /api/products GET] Nenhum produto retornado da DB para os filtros atuais.');
    }

    const sanitizedProducts = productsFromDB.map(p => sanitizeProductForUser(p, req.localUser));

    res.json({
      products: sanitizedProducts,
      totalPages: Math.ceil(totalProducts / safeLimit),
      currentPage: parseInt(page, 10),
      totalProducts
    });

  } catch (error) {
    console.error('[API /api/products GET] Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
  }
});

// Rota para buscar um único produto por EAN
router.get('/:ean', async (req, res) => {
  console.log('[API /api/products/:ean GET] User making request:', req.localUser ? req.localUser.email : 'Guest', 'Permissions:', req.localUser ? req.localUser.permissions : 'N/A');
  const { ean } = req.params;
  try {
    const product = await productQueries.getProductByEan(ean);

    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    
    const sanitizedProduct = sanitizeProductForUser(product, req.localUser);

    res.json(sanitizedProduct);

  } catch (error) {
    console.error(`Erro ao buscar produto com EAN ${ean}:`, error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar o produto.' });
  }
});

// Rota para CRIAR um novo produto (Admin Only)
router.post('/', requireAdmin, async (req, res) => {
  const {
    productid, name, sku, ean, codeproducer, shortdescription, longdescription,
    descriptionlang, stockquantity, deliverytime, pricenet, pricegross, pricevat,
    srpnet, srpgross, srpvat, producername, categoryname, categoryidosell,
    unitname, specifications_json, compatibilitycodes
  } = req.body;

  if (!productid || !name || !sku || !ean) {
    return res.status(400).json({ error: 'Missing required fields: productid, name, sku, ean' });
  }

  try {
    const newProduct = await pool.query(
      `INSERT INTO products (
        productid, name, sku, ean, codeproducer, shortdescription, longdescription,
        descriptionlang, stockquantity, deliverytime, pricenet, pricegross, pricevat,
        srpnet, srpgross, srpvat, producername, categoryname, categoryidosell,
        unitname, specifications_json, compatibilitycodes
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22
      ) RETURNING *`,
      [
        productid, name, sku, ean, codeproducer, shortdescription, longdescription,
        descriptionlang, stockquantity, deliverytime, pricenet, pricegross, pricevat,
        srpnet, srpgross, srpvat, producername, categoryname, categoryidosell,
        unitname, specifications_json, compatibilitycodes
      ]
    );
    console.log(`[API] POST /api/products - Produto criado com sucesso: ${newProduct.rows[0].productid}`);
    res.status(201).json(newProduct.rows[0]);
  } catch (error) {
    console.error('[API] Erro ao criar produto:', error);
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ error: `Já existe um produto com o productid ${productid}.` });
    }
    res.status(500).json({ error: 'Erro ao criar produto.' });
  }
});

// Rota para ATUALIZAR um produto existente (Admin Only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const {
    name, sku, ean, codeproducer, shortdescription, longdescription,
    descriptionlang, stockquantity, deliverytime, pricenet, pricegross, pricevat,
    srpnet, srpgross, srpvat, producername, categoryname, categoryidosell,
    unitname, specifications_json, compatibilitycodes
  } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  try {
    const updatedProduct = await pool.query(
      `UPDATE products SET
        name = $1, sku = $2, ean = $3, codeproducer = $4, shortdescription = $5, longdescription = $6,
        descriptionlang = $7, stockquantity = $8, deliverytime = $9, pricenet = $10, pricegross = $11, pricevat = $12,
        srpnet = $13, srpgross = $14, srpvat = $15, producername = $16, categoryname = $17, categoryidosell = $18,
        unitname = $19, specifications_json = $20, compatibilitycodes = $21
      WHERE productid = $22
      RETURNING *`,
      [
        name, sku, ean, codeproducer, shortdescription, longdescription,
        descriptionlang, stockquantity, deliverytime, pricenet, pricegross, pricevat,
        srpnet, srpgross, srpvat, producername, categoryname, categoryidosell,
        unitname, specifications_json, compatibilitycodes,
        id
      ]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: `Produto com ID ${id} não encontrado.` });
    }

    console.log(`[API] PUT /api/products/${id} - Produto atualizado com sucesso.`);
    res.json(updatedProduct.rows[0]);
  } catch (error) {
    console.error(`[API] Erro ao atualizar produto ${id}:`, error);
    res.status(500).json({ error: 'Erro ao atualizar produto.' });
  }
});

// Rota para APAGAR um produto (Admin Only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleteResult = await pool.query(
      'DELETE FROM products WHERE productid = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: `Produto com ID ${id} não encontrado.` });
    }

    console.log(`[API] DELETE /api/products/${id} - Produto apagado com sucesso.`);
    res.status(204).send(); // 204 No Content
  } catch (error) {
    console.error(`[API] Erro ao apagar produto ${id}:`, error);
    res.status(500).json({ error: 'Erro ao apagar produto.' });
  }
});

module.exports = router;
