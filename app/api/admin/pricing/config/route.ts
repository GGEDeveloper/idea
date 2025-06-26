import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

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

      // Save each configuration
      for (const config of configs) {
        const { key, value } = config;
        
        if (!key || value === undefined) {
          throw new Error(`Invalid config: key="${key}", value="${value}"`);
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
      }

      await client.query('COMMIT');

      return NextResponse.json({ 
        message: 'Configurações salvas com sucesso',
        updated: configs.length 
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
 * Get description for config keys
 */
function getConfigDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'default_customer_price_list': 'Lista de preços padrão exibida aos clientes',
    'markup_supplier_price': 'Markup base aplicado sobre preço de fornecedor (Lista ID: 1)',
    'markup_base_selling_price': 'Markup base aplicado sobre preço base de venda (Lista ID: 2)',
    'markup_customer_price': 'Markup base aplicado sobre preço final ao cliente (Lista ID: 4)'
  };
  
  return descriptions[key] || 'Configuração de preços';
} 