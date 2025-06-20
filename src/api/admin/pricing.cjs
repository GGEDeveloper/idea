const express = require('express');
const pool = require('../../../db/index.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica middleware de admin a todas as rotas
router.use(requireAdmin);

/**
 * GET /api/admin/pricing/config
 * Obter todas as configurações de preços
 */
router.get('/config', async (req, res) => {
  try {
    const configQuery = `
      SELECT 
        config_id,
        config_key,
        config_value,
        description,
        data_type,
        created_at,
        updated_at
      FROM pricing_config
      ORDER BY config_key
    `;

    const result = await pool.query(configQuery);

    // Converter para um objeto mais amigável
    const config = result.rows.reduce((acc, row) => {
      let value = row.config_value;
      
      // Converter tipos automaticamente
      if (row.data_type === 'number') {
        value = parseFloat(value);
      } else if (row.data_type === 'boolean') {
        value = value === 'true';
      } else if (row.data_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Se não conseguir fazer parse, mantém como string
        }
      }

      acc[row.config_key] = {
        value,
        description: row.description,
        data_type: row.data_type,
        updated_at: row.updated_at
      };

      return acc;
    }, {});

    res.json(config);
  } catch (error) {
    console.error('Erro ao buscar configurações de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/pricing/config/:configKey
 * Atualizar configuração específica de preços
 */
router.put('/config/:configKey', async (req, res) => {
  try {
    const { configKey } = req.params;
    const { config_value } = req.body;

    if (config_value === undefined) {
      return res.status(400).json({ error: 'Valor da configuração é obrigatório' });
    }

    // Validações específicas
    if (configKey === 'base_margin_percentage') {
      const marginValue = parseFloat(config_value);
      if (isNaN(marginValue) || marginValue < 0 || marginValue > 1000) {
        return res.status(400).json({ 
          error: 'Margem base deve ser um número entre 0 e 1000 (percentagem)' 
        });
      }
    }

    const updateQuery = `
      UPDATE pricing_config 
      SET 
        config_value = $2,
        updated_at = NOW()
      WHERE config_key = $1
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [configKey, config_value.toString()]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    // Recalcular preços se a margem base foi alterada
    if (configKey === 'base_margin_percentage') {
      try {
        await recalculateBasePrices();
        res.json({
          ...result.rows[0],
          message: 'Configuração atualizada e preços recalculados com sucesso'
        });
      } catch (recalcError) {
        console.error('Erro ao recalcular preços:', recalcError);
        res.json({
          ...result.rows[0],
          warning: 'Configuração atualizada, mas houve erro ao recalcular preços automaticamente'
        });
      }
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error('Erro ao atualizar configuração de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/pricing/recalculate
 * Recalcular todos os preços base com a margem atual
 */
router.post('/recalculate', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const result = await recalculateBasePrices();
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    res.json({
      message: 'Preços recalculados com sucesso',
      processed_variants: result.processedVariants,
      updated_prices: result.updatedPrices,
      duration_ms: duration
    });
  } catch (error) {
    console.error('Erro ao recalcular preços:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

/**
 * GET /api/admin/pricing/stats
 * Obter estatísticas dos preços
 */
router.get('/stats', async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT pv.variantid) as total_variants,
        COUNT(DISTINCT CASE WHEN pv.supplier_price > 0 THEN pv.variantid END) as variants_with_supplier_price,
        COUNT(DISTINCT p.variantid) as variants_with_prices,
        COUNT(DISTINCT CASE WHEN p.price_list_id = 2 THEN p.variantid END) as variants_with_base_selling_price,
        AVG(CASE WHEN p.price_list_id = 2 THEN p.price END) as avg_base_selling_price,
        MIN(CASE WHEN p.price_list_id = 2 THEN p.price END) as min_base_selling_price,
        MAX(CASE WHEN p.price_list_id = 2 THEN p.price END) as max_base_selling_price
      FROM product_variants pv
      LEFT JOIN prices p ON pv.variantid = p.variantid
    `;

    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    // Obter margem atual
    const marginQuery = `
      SELECT config_value 
      FROM pricing_config 
      WHERE config_key = 'base_margin_percentage'
    `;
    const marginResult = await pool.query(marginQuery);
    const currentMargin = marginResult.rows[0]?.config_value || '25.0';

    res.json({
      ...stats,
      current_margin_percentage: parseFloat(currentMargin),
      price_coverage_percentage: stats.total_variants > 0 
        ? Math.round((stats.variants_with_base_selling_price / stats.total_variants) * 100)
        : 0
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de preços:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * Função auxiliar para recalcular preços base
 */
async function recalculateBasePrices() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Recalcular todos os preços base usando a função SQL
    const recalculateQuery = `
      WITH updated_prices AS (
        UPDATE prices 
        SET price = calculate_selling_price(pv.supplier_price)
        FROM product_variants pv
        WHERE prices.variantid = pv.variantid 
          AND prices.price_list_id = 2
          AND pv.supplier_price IS NOT NULL
          AND pv.supplier_price > 0
        RETURNING prices.variantid
      )
      SELECT COUNT(*) as updated_count FROM updated_prices
    `;

    const updateResult = await client.query(recalculateQuery);
    
    // Contar variantes processadas
    const countQuery = `
      SELECT COUNT(*) as variant_count 
      FROM product_variants 
      WHERE supplier_price IS NOT NULL AND supplier_price > 0
    `;
    
    const countResult = await client.query(countQuery);

    await client.query('COMMIT');

    return {
      processedVariants: parseInt(countResult.rows[0].variant_count),
      updatedPrices: parseInt(updateResult.rows[0].updated_count)
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * PUT /api/admin/pricing/config/batch
 * Atualizar múltiplas configurações de preços
 */
router.put('/config/batch', async (req, res) => {
  try {
    const { configs } = req.body;

    if (!Array.isArray(configs) || configs.length === 0) {
      return res.status(400).json({ error: 'Lista de configurações é obrigatória' });
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const updatedConfigs = [];
      let shouldRecalculate = false;

      for (const config of configs) {
        const { config_key, config_value } = config;

        if (!config_key || config_value === undefined) {
          continue;
        }

        // Validações específicas
        if (config_key === 'base_margin_percentage') {
          const marginValue = parseFloat(config_value);
          if (isNaN(marginValue) || marginValue < 0 || marginValue > 1000) {
            throw new Error(`Margem base deve ser um número entre 0 e 1000 (percentagem)`);
          }
          shouldRecalculate = true;
        }

        const updateQuery = `
          UPDATE pricing_config 
          SET config_value = $2, updated_at = NOW()
          WHERE config_key = $1
          RETURNING *
        `;

        const result = await client.query(updateQuery, [config_key, config_value.toString()]);
        
        if (result.rows.length > 0) {
          updatedConfigs.push(result.rows[0]);
        }
      }

      await client.query('COMMIT');

      // Recalcular preços se necessário
      if (shouldRecalculate) {
        try {
          const recalcResult = await recalculateBasePrices();
          res.json({
            message: `${updatedConfigs.length} configurações atualizadas e preços recalculados`,
            configs: updatedConfigs,
            recalculation: recalcResult
          });
        } catch (recalcError) {
          console.error('Erro ao recalcular preços:', recalcError);
          res.json({
            message: `${updatedConfigs.length} configurações atualizadas`,
            configs: updatedConfigs,
            warning: 'Houve erro ao recalcular preços automaticamente'
          });
        }
      } else {
        res.json({
          message: `${updatedConfigs.length} configurações atualizadas`,
          configs: updatedConfigs
        });
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar configurações em lote:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

module.exports = router; 