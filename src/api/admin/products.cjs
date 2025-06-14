const express = require('express');
const productQueries = require('../../db/product-queries.cjs');
const { requireAdminAuth } = require('../middleware/auth.cjs');

const router = express.Router();

// Aplica o middleware de autenticação de admin a todas as rotas deste router.
router.use(requireAdminAuth);

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