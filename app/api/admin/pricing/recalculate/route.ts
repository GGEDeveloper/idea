import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * POST /api/admin/pricing/recalculate - Recalculate all prices based on current configuration
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_settings']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    console.log('[PRICING] Iniciando recálculo de preços...');
    const startTime = Date.now();

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Recalcular preços de venda base (lista 2) usando configuração
      const recalcBasePricesQuery = `
        WITH config AS (
          SELECT COALESCE(
            (SELECT CAST(config_value AS NUMERIC) FROM pricing_config WHERE config_key = 'markup_base_selling_price'),
            25.0
          ) as base_markup
        ),
        updated_base_prices AS (
          UPDATE prices 
          SET price = ROUND(pv.supplier_price * (1 + (config.base_markup / 100)), 4)
          FROM product_variants pv, config
          WHERE prices.variantid = pv.variantid 
            AND prices.price_list_id = 2
            AND pv.supplier_price IS NOT NULL
            AND pv.supplier_price > 0
          RETURNING prices.variantid, prices.price
        )
        SELECT COUNT(*) as updated_count FROM updated_base_prices
      `;

      const baseResult = await client.query(recalcBasePricesQuery);
      const basePricesUpdated = parseInt(baseResult.rows[0].updated_count);

      // 2. Recalcular preços cliente (lista 4) usando configuração
      const recalcCustomerPricesQuery = `
        WITH config AS (
          SELECT COALESCE(
            (SELECT CAST(config_value AS NUMERIC) FROM pricing_config WHERE config_key = 'markup_customer_price'),
            35.0
          ) as customer_markup
        ),
        updated_customer_prices AS (
          UPDATE prices 
          SET price = ROUND(pv.supplier_price * (1 + (config.customer_markup / 100)), 4)
          FROM product_variants pv, config
          WHERE prices.variantid = pv.variantid 
            AND prices.price_list_id = 4
            AND pv.supplier_price IS NOT NULL
            AND pv.supplier_price > 0
          RETURNING prices.variantid, prices.price
        )
        SELECT COUNT(*) as updated_count FROM updated_customer_prices
      `;

      const customerResult = await client.query(recalcCustomerPricesQuery);
      const customerPricesUpdated = parseInt(customerResult.rows[0].updated_count);

      // 3. Inserir preços que não existem ainda
      const insertMissingPricesQuery = `
        WITH config AS (
          SELECT 
            COALESCE((SELECT CAST(config_value AS NUMERIC) FROM pricing_config WHERE config_key = 'markup_base_selling_price'), 25.0) as base_markup,
            COALESCE((SELECT CAST(config_value AS NUMERIC) FROM pricing_config WHERE config_key = 'markup_customer_price'), 35.0) as customer_markup
        ),
        missing_base_prices AS (
          INSERT INTO prices (variantid, price_list_id, price)
          SELECT 
            pv.variantid,
            2,
            ROUND(pv.supplier_price * (1 + (config.base_markup / 100)), 4)
          FROM product_variants pv, config
          WHERE pv.supplier_price IS NOT NULL 
            AND pv.supplier_price > 0
            AND NOT EXISTS (
              SELECT 1 FROM prices p 
              WHERE p.variantid = pv.variantid AND p.price_list_id = 2
            )
          RETURNING variantid
        ),
        missing_customer_prices AS (
          INSERT INTO prices (variantid, price_list_id, price)
          SELECT 
            pv.variantid,
            4,
            ROUND(pv.supplier_price * (1 + (config.customer_markup / 100)), 4)
          FROM product_variants pv, config
          WHERE pv.supplier_price IS NOT NULL 
            AND pv.supplier_price > 0
            AND NOT EXISTS (
              SELECT 1 FROM prices p 
              WHERE p.variantid = pv.variantid AND p.price_list_id = 4
            )
          RETURNING variantid
        )
        SELECT 
          (SELECT COUNT(*) FROM missing_base_prices) as base_inserted,
          (SELECT COUNT(*) FROM missing_customer_prices) as customer_inserted
      `;

      const insertResult = await client.query(insertMissingPricesQuery);
      const baseInserted = parseInt(insertResult.rows[0]?.base_inserted || 0);
      const customerInserted = parseInt(insertResult.rows[0]?.customer_inserted || 0);

      // 4. Obter configurações utilizadas
      const configQuery = `
        SELECT config_key, config_value 
        FROM pricing_config 
        WHERE config_key IN ('markup_base_selling_price', 'markup_customer_price')
      `;
      const configResult = await client.query(configQuery);
      const configs = configResult.rows.reduce((acc, row) => {
        acc[row.config_key] = row.config_value;
        return acc;
      }, {});

      await client.query('COMMIT');

      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        basePricesUpdated,
        customerPricesUpdated,
        basePricesInserted: baseInserted,
        customerPricesInserted: customerInserted,
        totalAffected: basePricesUpdated + customerPricesUpdated + baseInserted + customerInserted,
        configsUsed: configs,
        durationMs: duration
      };

      console.log('[PRICING] Recálculo concluído:', result);

      return NextResponse.json({
        message: 'Preços recalculados com sucesso',
        result
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error recalculating prices:', error);
    return NextResponse.json(
      { error: 'Erro interno ao recalcular preços', details: error instanceof Error ? error instanceof Error ? error.message : "Unknown error" : 'Unknown error' },
      { status: 500 }
    );
  }
}
