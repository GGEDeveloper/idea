const express = require('express');
const productQueries = require('../../db/product-queries.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica o middleware de autenticação de admin a todas as rotas deste router.
router.use(requireAdmin);

/**
 * Rota para listar todos os produtos (para administradores).
 * Suporta paginação e ordenação.
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'name', 
      order = 'asc',
      // Adicionar aqui quaisquer outros filtros que queiramos expor para o admin
      // Por exemplo: status (active/inactive), stock_status (in_stock/out_of_stock)
      // searchQuery, brand, categoryId etc. já são suportados por getProducts
    } = req.query;

    const filters = {
      // Passar aqui filtros específicos do admin se necessário
      // Ex: if (req.query.status === 'inactive') filters.active = false;
      //     if (req.query.status === 'active') filters.active = true;
      // Por agora, vamos buscar todos, incluindo ativos e inativos,
      // pois a função getProducts não filtra por 'active' por defeito.
      // Se quisermos adicionar um filtro explícito por 'active', podemos adicionar ao buildWhereClause
      // ou passar um filtro 'active: true/false' se productQueries.getProducts o suportar.
      // No momento, p.active é selecionado, mas não usado para filtrar por defeito em getProducts.
      searchQuery: req.query.searchQuery,
      brands: req.query.brands,
      categoryId: req.query.categoryId,
      is_featured: req.query.is_featured,
      priceMin: req.query.priceMin,
      priceMax: req.query.priceMax,
    };
    
    // Remover chaves de filtros com valores undefined ou vazios para não interferir com buildWhereClause
    Object.keys(filters).forEach(key => (filters[key] === undefined || filters[key] === '') && delete filters[key]);


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