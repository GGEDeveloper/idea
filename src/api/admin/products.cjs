const express = require('express');
const productQueries = require('../../db/product-queries.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica o middleware de autenticação de admin a todas as rotas deste router.
router.use(requireAdmin);

/**
 * Rota para listar todos os produtos (para administradores).
 * Suporta paginação, ordenação, pesquisa e filtragem por status ativo.
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'name', 
      order = 'asc',
      search,
      active
    } = req.query;

    const filters = {};
    
    // Filtro de pesquisa por nome, EAN ou marca
    if (search && search.trim()) {
      filters.searchQuery = search.trim();
    }
    
    // Filtro por status ativo/inativo
    if (active !== undefined && active !== '') {
      filters.active = active === 'true';
    }
    
    // Outros filtros existentes (mantidos para compatibilidade)
    if (req.query.brands) filters.brands = req.query.brands;
    if (req.query.categoryId) filters.categoryId = req.query.categoryId;
    if (req.query.is_featured) filters.is_featured = req.query.is_featured;
    if (req.query.priceMin) filters.priceMin = req.query.priceMin;
    if (req.query.priceMax) filters.priceMax = req.query.priceMax;

    const paginationOptions = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      order,
    };

    const products = await productQueries.getProducts(filters, paginationOptions);
    const totalProducts = await productQueries.countProducts(filters);

    res.json({
      products,
      totalPages: Math.ceil(totalProducts / paginationOptions.limit),
      currentPage: paginationOptions.page,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao buscar produtos para a área de admin.', details: error.message });
  }
});

/**
 * Rota para buscar um único produto por EAN (para administradores).
 */
router.get('/:ean', async (req, res) => {
  const { ean } = req.params;
  try {
    const product = await productQueries.getProductByEan(ean);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Erro ao buscar produto por EAN (${ean}) para admin:`, error);
    res.status(500).json({ error: 'Falha ao buscar o produto.', details: error.message });
  }
});

/**
 * Rota para criar um novo produto.
 * Apenas para administradores.
 */
router.post('/', async (req, res) => {
  try {
    const newProduct = await productQueries.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao criar o produto.', details: error.message });
  }
});

/**
 * Rota para atualizar um produto existente.
 * Apenas para administradores.
 */
router.put('/:ean', async (req, res) => {
  const { ean } = req.params;
  try {
    const updatedProduct = await productQueries.updateProduct(ean, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Falha ao atualizar o produto.', details: error.message });
  }
});

/**
 * Rota para desativar (soft delete) um produto.
 * Apenas para administradores.
 */
router.delete('/:ean', async (req, res) => {
  const { ean } = req.params;
  try {
    const product = await productQueries.setProductStatus(ean, false);
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }
    res.json({ message: 'Produto desativado com sucesso.', product });
  } catch (error) {
    res.status(500).json({ error: 'Falha ao desativar o produto.', details: error.message });
  }
});

module.exports = router; 