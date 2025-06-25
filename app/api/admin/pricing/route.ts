import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../src/utils/adminAuth';

/**
 * GET /api/admin/pricing - Get pricing configuration and rules
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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'config';

    if (type === 'config') {
      // Get pricing configuration from settings
      const configQuery = `
        SELECT 
          setting_key,
          setting_value,
          setting_type,
          description
        FROM system_settings
        WHERE setting_key LIKE 'pricing_%'
        ORDER BY setting_key
      `;

      const configResult = await pool.query(configQuery);

      // Default pricing configuration
      const defaultConfig = {
        pricing_base_margin: { value: 1.3, type: 'number', description: 'Base margin multiplier' },
        pricing_min_margin: { value: 1.1, type: 'number', description: 'Minimum margin multiplier' },
        pricing_max_margin: { value: 2.0, type: 'number', description: 'Maximum margin multiplier' },
        pricing_currency: { value: 'EUR', type: 'string', description: 'Default currency' },
        pricing_vat_rate: { value: 0.23, type: 'number', description: 'VAT rate (23%)' },
        pricing_auto_update: { value: true, type: 'boolean', description: 'Auto-update prices from supplier' }
      };

      // Merge with actual settings
      const config: any = { ...defaultConfig };
      configResult.rows.forEach((row: any) => {
        let value = row.setting_value;
        switch (row.setting_type) {
          case 'number':
            value = parseFloat(value);
            break;
          case 'boolean':
            value = value === 'true';
            break;
        }
        config[row.setting_key] = {
          value,
          type: row.setting_type,
          description: row.description
        };
      });

      return NextResponse.json({ config });
    }

    if (type === 'rules') {
      // Create pricing_rules table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pricing_rules (
          rule_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          rule_type VARCHAR(50) NOT NULL, -- 'brand', 'category', 'product'
          target_value VARCHAR(255) NOT NULL, -- brand name, category id, product ean
          margin_multiplier NUMERIC(10,4) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          priority INTEGER DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      const rulesQuery = `
        SELECT 
          rule_id,
          name,
          description,
          rule_type,
          target_value,
          margin_multiplier,
          is_active,
          priority,
          created_at,
          updated_at
        FROM pricing_rules
        ORDER BY priority DESC, created_at DESC
      `;

      const rulesResult = await pool.query(rulesQuery);
      return NextResponse.json({ rules: rulesResult.rows });
    }

    if (type === 'lists') {
      const listsQuery = `
        SELECT 
          price_list_id,
          name,
          description
        FROM price_lists
        ORDER BY price_list_id
      `;

      const listsResult = await pool.query(listsQuery);
      return NextResponse.json({ priceLists: listsResult.rows });
    }

    return NextResponse.json(
      { error: 'Invalid pricing type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Admin error fetching pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching pricing.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing - Update pricing configuration or create rules
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
    const { type, ...data } = body;

    if (type === 'config') {
      const { config } = data;

      if (!config || typeof config !== 'object') {
        return NextResponse.json(
          { error: 'Config object is required' },
          { status: 400 }
        );
      }

      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        for (const [key, settingData] of Object.entries(config)) {
          const { value, type: settingType = 'string', description = '' } = settingData as any;

          await client.query(`
            INSERT INTO system_settings (setting_key, setting_value, setting_type, description, updated_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (setting_key) 
            DO UPDATE SET 
              setting_value = $2,
              setting_type = $3,
              description = $4,
              updated_at = NOW()
          `, [key, String(value), settingType, description]);
        }

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Pricing configuration updated successfully' });
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    }

    if (type === 'rule') {
      const { 
        name, 
        description, 
        ruleType, 
        targetValue, 
        marginMultiplier, 
        isActive = true, 
        priority = 0 
      } = data;

      if (!name || !ruleType || !targetValue || !marginMultiplier) {
        return NextResponse.json(
          { error: 'Name, rule type, target value, and margin multiplier are required' },
          { status: 400 }
        );
      }

      const createRuleQuery = `
        INSERT INTO pricing_rules (
          name, description, rule_type, target_value, margin_multiplier, is_active, priority
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING rule_id, name, description, rule_type, target_value, margin_multiplier, 
                  is_active, priority, created_at
      `;

      const result = await pool.query(createRuleQuery, [
        name,
        description,
        ruleType,
        targetValue,
        marginMultiplier,
        isActive,
        priority
      ]);

      return NextResponse.json(result.rows[0], { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid pricing operation type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Admin error updating pricing:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating pricing.' },
      { status: 500 }
    );
  }
} 