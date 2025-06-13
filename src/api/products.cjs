// src/api/products.cjs
const express = require('express');
const pool = require('../../db/index.cjs');
const clerk = require('@clerk/clerk-sdk-node');
const { buildCategoryTreeFromPaths } = require('./utils/category-utils.cjs');
const productQueries = require('../db/product-queries.cjs');
const { optionalUser, requireAdminAuth } = require('./middleware/auth.cjs');

const router = express.Router();

/**
 * Remove campos sensíveis (preço, stock) de um objeto de produto
 * se o utilizador não tiver a permissão 'view_price'.
 * @param {object} product - O objeto do produto.
 * @param {object} localUser - O perfil do utilizador do nosso sistema (com permissões).
 * @returns {object} O objeto do produto, possivelmente modificado.
 */
function sanitizeProductForUser(product, localUser) {
  const canViewPrice = localUser && localUser.permissions && localUser.permissions.includes('view_price');

  if (canViewPrice) {
    return product;
  }

  // Se não pode ver o preço, removemos os campos sensíveis.
  // Usamos delete para remover as chaves do objeto.
  const sanitizedProduct = { ...product };
  delete sanitizedProduct.price;
  delete sanitizedProduct.stock;
  // Adicionamos um status para o frontend saber o que mostrar
  sanitizedProduct.priceStatus = localUser ? 'permission_denied' : 'unauthenticated';

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
      pool.query('SELECT MIN(price) as min, MAX(price) as max FROM prices') // Query simplificada pelo novo schema
    ]);

 
    const categoryTree = buildCategoryTreeFromPaths(categoryData.rows);

    const filterOptions = {
      categories: categoryTree,
      brands: brandData.rows.map(row => row.name),
      price: {
        min: parseFloat(priceData.rows[0].min) || 0,
        max: parseFloat(priceData.rows[0].max) || 1000,
      }
    };
    res.json(filterOptions);
  } catch (error) {
    console.error('[API] Erro ao buscar opções de filtros:', error);
    res.status(500).json({ error: 'Erro ao buscar opções de filtros.' });
  }
});

// Rota principal para buscar produtos (refatorada para o novo schema)
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'name', 
      order = 'asc',
    brands,
      categories, // A lógica de filtro por categoria está em buildWhereClause
    priceMin,
    priceMax,
      q: searchQuery
  } = req.query;

    const effectiveLimit = Math.min(parseInt(limit, 10) || 20, 2000);

    const filters = { brands, categoryId: categories, priceMin, priceMax, searchQuery };
    const pagination = { page: parseInt(page, 10), limit: effectiveLimit, sortBy, order };

    // As novas funções de query simplificam drasticamente a rota.
    const [totalProducts, products] = await Promise.all([
      productQueries.countProducts(filters),
      productQueries.getProducts(filters, pagination)
    ]);

    // Sanitiza cada produto na lista
    const sanitizedProducts = products.map(p => sanitizeProductForUser(p, req.localUser));

    res.json({
      products: sanitizedProducts,
      totalPages: Math.ceil(totalProducts / effectiveLimit),
      currentPage: parseInt(page, 10),
      totalProducts
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar produtos.' });
  }
});

// Rota para buscar um único produto por EAN (refatorada para o novo schema)
router.get('/:ean', optionalUser, async (req, res) => {
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
router.post('/', requireAdminAuth, async (req, res) => {
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
router.put('/:id', requireAdminAuth, async (req, res) => {
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
router.delete('/:id', requireAdminAuth, async (req, res) => {
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
