const express = require('express');
const pool = require('../../db/index.cjs');
const { requireAdmin } = require('./middleware/localAuth.cjs');

const router = express.Router({ mergeParams: true }); // mergeParams para aceder ao :variantStockId

// GET /api/products/:productId/variations/:variantStockId/stock - Obter o stock de uma variação
router.get('/', async (req, res) => {
    const { variantStockId } = req.params;
    try {
        const stockLevel = await pool.query(
            'SELECT quantity FROM stock_levels WHERE geko_variant_stock_id = $1',
            [variantStockId]
        );

        if (stockLevel.rows.length === 0) {
            // Se não houver entrada, assumimos stock 0
            return res.json({ geko_variant_stock_id: variantStockId, quantity: 0 });
        }
        res.json(stockLevel.rows[0]);
    } catch (error) {
        console.error(`[API] Erro ao obter stock para a variação ${variantStockId}:`, error);
        res.status(500).json({ error: 'Erro ao obter stock.' });
    }
});

// PUT /api/products/:productId/variations/:variantStockId/stock - Atualizar o stock de uma variação (Admin Only)
router.put('/', requireAdmin, async (req, res) => {
    const { variantStockId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || isNaN(parseInt(quantity, 10))) {
        return res.status(400).json({ error: 'O campo "quantity" é obrigatório e deve ser um número.' });
    }

    const newQuantity = parseInt(quantity, 10);

    try {
        // Usar uma lógica de "UPSERT" (UPDATE ou INSERT se não existir)
        const upsertQuery = `
            INSERT INTO stock_levels (geko_variant_stock_id, quantity)
            VALUES ($1, $2)
            ON CONFLICT (geko_variant_stock_id) 
            DO UPDATE SET quantity = EXCLUDED.quantity
            RETURNING *;
        `;
        
        const updatedStock = await pool.query(upsertQuery, [variantStockId, newQuantity]);

        res.json(updatedStock.rows[0]);
    } catch (error) {
        console.error(`[API] Erro ao atualizar stock para a variação ${variantStockId}:`, error);
        res.status(500).json({ error: 'Erro ao atualizar stock.' });
    }
});

module.exports = router; 