const express = require('express');
const pool = require('../../db/index.cjs');
const { requireAdmin } = require('./middleware/localAuth.cjs');
const stockRouter = require('./stock.cjs');

const router = express.Router({ mergeParams: true });

router.use('/:variantStockId/stock', stockRouter);

router.get('/', async (req, res) => {
  const { productId } = req.params;
  try {
    const productLink = await pool.query('SELECT ean FROM products WHERE productid = $1', [productId]);
    if (productLink.rows.length === 0) {
      return res.status(404).json({ error: `Produto principal com ID ${productId} não encontrado.` });
    }
    const productEan = productLink.rows[0].ean;

    const variations = await pool.query(
      'SELECT * FROM product_variants WHERE ean = $1',
      [productEan]
    );
    res.json(variations.rows);
  } catch (error) {
    console.error(`[API] Erro ao listar variações para o produto ${productId} (EAN: ${productEan || 'N/A'}):`, error);
    res.status(500).json({ error: 'Erro ao listar variações.' });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  const { productId } = req.params;
  const { variantid, ean, name, stockquantity, supplier_price, is_on_sale } = req.body;

  if (!variantid || !ean || !name ) {
    return res.status(400).json({ error: 'Campos obrigatórios para variante: variantid, ean, name' });
  }

  try {
    const productCheck = await pool.query('SELECT ean FROM products WHERE productid = $1', [productId]);
    if (productCheck.rows.length === 0) {
        return res.status(404).json({ error: `Produto principal com ID ${productId} não encontrado para associar a variação.` });
    }
    
    const newVariant = await pool.query(
      `INSERT INTO product_variants (variantid, ean, name, stockquantity, supplier_price, is_on_sale)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [variantid, ean, name, stockquantity, supplier_price, is_on_sale === undefined ? false : is_on_sale]
    );
    res.status(201).json(newVariant.rows[0]);
  } catch (error) {
    console.error(`[API] Erro ao criar variação para o produto ${productId}:`, error);
    if (error.code === '23505') {
      return res.status(409).json({ error: `Já existe uma variação com o ID ${variantid} ou o EAN ${ean} já está em uso para outra variação de forma restrita.` });
    }
    if (error.code === '23503') {
      return res.status(400).json({ error: `O EAN ${ean} fornecido para a variação não existe na tabela de produtos.`});
    }
    res.status(500).json({ error: 'Erro ao criar variação.' });
  }
});

router.put('/:variantIdInput', requireAdmin, async (req, res) => {
    const { variantIdInput } = req.params;
    const { ean, name, stockquantity, supplier_price, is_on_sale } = req.body;

    try {
        const updatedVariant = await pool.query(
            `UPDATE product_variants 
             SET ean = $1, name = $2, stockquantity = $3, supplier_price = $4, is_on_sale = $5
             WHERE variantid = $6 RETURNING *`,
            [ean, name, stockquantity, supplier_price, is_on_sale === undefined ? false : is_on_sale, variantIdInput]
        );
        if (updatedVariant.rows.length === 0) {
            return res.status(404).json({ error: `Variação com ID ${variantIdInput} não encontrada.` });
        }
        res.json(updatedVariant.rows[0]);
    } catch (error) {
        console.error(`[API] Erro ao atualizar variação ${variantIdInput}:`, error);
        if (error.code === '23503') {
            return res.status(400).json({ error: `O EAN ${ean} fornecido para a variação não existe na tabela de produtos.`});
        }
        res.status(500).json({ error: 'Erro ao atualizar variação.' });
    }
});

router.delete('/:variantIdInput', requireAdmin, async (req, res) => {
    const { variantIdInput } = req.params;
    try {
        const deleteResult = await pool.query(
            'DELETE FROM product_variants WHERE variantid = $1 RETURNING *',
            [variantIdInput]
        );
        if (deleteResult.rows.length === 0) {
            return res.status(404).json({ error: `Variação com ID ${variantIdInput} não encontrada.` });
        }
        res.status(204).send();
    } catch (error) {
        console.error(`[API] Erro ao apagar variação ${variantIdInput}:`, error);
        res.status(500).json({ error: 'Erro ao apagar variação.' });
    }
});

module.exports = router; 