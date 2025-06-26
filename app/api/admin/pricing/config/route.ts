import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * Recalcular todos os preços baseado nas configurações atuais
 */
async function recalculateAllPrices() {
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

    await client.query('COMMIT');

    return {
      basePricesUpdated,
      customerPricesUpdated,
      basePricesInserted: baseInserted,
      customerPricesInserted: customerInserted,
      totalAffected: basePricesUpdated + customerPricesUpdated + baseInserted + customerInserted
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * POST /api/admin/pricing/config - Save pricing configurations
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

    const body = await request.json();
    const { configs } = body;

    if (!configs || !Array.isArray(configs)) {
      return NextResponse.json(
        { error: 'Configs array is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      let shouldRecalculate = false;
      const updatedConfigs = [];

      // Save each configuration
      for (const config of configs) {
        const { key, value } = config;
        
        if (!key || value === undefined) {
          throw new Error(`Invalid config: key="${key}", value="${value}"`);
        }

        // Validação para markup de preços
        if (key.includes('markup_') && key !== 'default_customer_price_list') {
          const markupValue = parseFloat(value);
          if (isNaN(markupValue) || markupValue < 0 || markupValue > 1000) {
            throw new Error(`Markup deve ser um número entre 0 e 1000 (%): ${key}`);
          }
          shouldRecalculate = true;
        }

        await client.query(`
          INSERT INTO pricing_config (config_key, config_value, data_type, description, updated_at)
          VALUES ($1, $2, 'string', $3, NOW())
          ON CONFLICT (config_key) 
          DO UPDATE SET 
            config_value = $2,
            updated_at = NOW()
        `, [
          key, 
          String(value),
          getConfigDescription(key)
        ]);

        updatedConfigs.push({ key, value });
      }

      await client.query('COMMIT');

      // Recalcular preços se necessário
      let recalcResult = null;
      if (shouldRecalculate) {
        try {
          console.log('[PRICING] Iniciando recálculo automático de preços...');
          recalcResult = await recalculateAllPrices();
          console.log('[PRICING] Recálculo concluído:', recalcResult);
        } catch (recalcError) {
          console.error('[PRICING] Erro durante recálculo:', recalcError);
          // Não falhar a operação, apenas alertar
        }
      }

      return NextResponse.json({ 
        message: shouldRecalculate 
          ? 'Configurações salvas e preços recalculados com sucesso'
          : 'Configurações salvas com sucesso',
        updated: configs.length,
        recalculation: recalcResult
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error saving pricing config:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar configurações' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pricing/config - Get pricing configurations  
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_settings']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const configQuery = `
      SELECT 
        config_key,
        config_value,
        data_type,
        description,
        updated_at
      FROM pricing_config
      ORDER BY config_key
    `;

    const result = await pool.query(configQuery);
    return NextResponse.json({ configs: result.rows });

  } catch (error) {
    console.error('[API] Error fetching pricing config:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar configurações' },
      { status: 500 }
    );
  }
}

/**
 * Get description for config keys
 */
function getConfigDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'default_customer_price_list': 'Lista de preços padrão exibida aos clientes',
    'default_admin_price_list': 'Lista de preços padrão exibida ao admin',
    'base_transport_price': 'Preço base de transporte aplicado às encomendas',
    'markup_supplier_price': 'Markup base aplicado sobre preço de fornecedor (Lista ID: 1)',
    'markup_base_selling_price': 'Markup base aplicado sobre preço base de venda (Lista ID: 2)',
    'markup_customer_price': 'Markup base aplicado sobre preço final ao cliente (Lista ID: 4)'
  };
  
  return descriptions[key] || 'Configuração de preços';
} 