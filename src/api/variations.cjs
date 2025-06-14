const express = require('express');
const { pool } = require('../db.cjs');
const { requireAdminAuth } = require('./middleware/auth.cjs');
const stockRouter = require('./stock.cjs'); // Importar o router de stock

const router = express.Router({ mergeParams: true }); // mergeParams para aceder ao :productId da rota pai

// Montar o router de stock como uma sub-rota
router.use('/:variantStockId/stock', stockRouter);

// GET /api/products/:productId/variations - Listar todas as variações de um produto
router.get('/', async (req, res) => {
  const { productId } = req.params;
  try {
    const variations = await pool.query(
      'SELECT * FROM product_variants WHERE ean IN (SELECT ean FROM products WHERE productid = $1)',
      [productId]
    );
    res.json(variations.rows);
  } catch (error) {
    console.error(`[API] Erro ao listar variações para o produto ${productId}:`, error);
    res.status(500).json({ error: 'Erro ao listar variações.' });
  }
});

// POST /api/products/:productId/variations - Criar uma nova variação para um produto
router.post('/', requireAdminAuth, async (req, res) => {
  const { productId } = req.params; // Embora o EAN seja a chave, usamos o ID do produto para contexto
  const { ean, geko_variant_size_code, geko_variant_producer_code, geko_variant_stock_id, weight, gross_weight } = req.body;

  if (!ean || !geko_variant_stock_id) {
    return res.status(400).json({ error: 'Missing required fields: ean, geko_variant_stock_id' });
  }

  try {
    // Primeiro, verificar se o produto principal (productId) existe e tem o ean correspondente
    const productCheck = await pool.query('SELECT ean FROM products WHERE productid = $1 AND ean = $2', [productId, ean]);
    if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: `Produto com ID ${productId} e EAN ${ean} não corresponde. Não é possível adicionar a variação.` });
    }
      
    const newVariant = await pool.query(
      `INSERT INTO product_variants (ean, geko_variant_size_code, geko_variant_producer_code, geko_variant_stock_id, weight, gross_weight)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [ean, geko_variant_size_code, geko_variant_producer_code, geko_variant_stock_id, weight, gross_weight]
    );
    res.status(201).json(newVariant.rows[0]);
  } catch (error) {
    console.error(`[API] Erro ao criar variação para o produto ${productId}:`, error);
    res.status(500).json({ error: 'Erro ao criar variação.' });
  }
});

// PUT /api/products/:productId/variations/:variantStockId - Atualizar uma variação
router.put('/:variantStockId', requireAdminAuth, async (req, res) => {
    const { variantStockId } = req.params;
    const { ean, geko_variant_size_code, geko_variant_producer_code, weight, gross_weight } = req.body;

    if (!ean) {
        return res.status(400).json({ error: 'Missing required field: ean' });
    }

    try {
        const updatedVariant = await pool.query(
            `UPDATE product_variants 
             SET ean = $1, geko_variant_size_code = $2, geko_variant_producer_code = $3, weight = $4, gross_weight = $5
             WHERE geko_variant_stock_id = $6 RETURNING *`,
            [ean, geko_variant_size_code, geko_variant_producer_code, weight, gross_weight, variantStockId]
        );
        if (updatedVariant.rows.length === 0) {
            return res.status(404).json({ error: `Variação com stock ID ${variantStockId} não encontrada.` });
        }
        res.json(updatedVariant.rows[0]);
    } catch (error) {
        console.error(`[API] Erro ao atualizar variação ${variantStockId}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar variação.' });
    }
});

// DELETE /api/products/:productId/variations/:variantStockId - Apagar uma variação
router.delete('/:variantStockId', requireAdminAuth, async (req, res) => {
    const { variantStockId } = req.params;
    try {
        const deleteResult = await pool.query(
            'DELETE FROM product_variants WHERE geko_variant_stock_id = $1 RETURNING *',
            [variantStockId]
        );
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: `Variação com stock ID ${variantStockId} não encontrada.` });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`[API] Erro ao apagar variação ${variantStockId}:`, error);
        res.status(500).json({ error: 'Erro ao apagar variação.' });
    }
});

module.exports = router; 