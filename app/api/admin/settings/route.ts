import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';

// Helper function to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  // TODO: Implement JWT verification for admin
  return null;
}

/**
 * GET /api/admin/settings - Get all system settings
 */
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    // Create settings table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const settingsQuery = `
      SELECT 
        setting_key,
        setting_value,
        setting_type,
        description,
        updated_at
      FROM system_settings
      ORDER BY setting_key
    `;

    const result = await pool.query(settingsQuery);
    
    // Convert to key-value object
    const settings = {};
    result.rows.forEach(row => {
      let value = row.setting_value;
      
      // Parse value based on type
      switch (row.setting_type) {
        case 'number':
          value = parseFloat(value);
          break;
        case 'boolean':
          value = value === 'true';
          break;
        case 'json':
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = null;
          }
          break;
      }
      
      settings[row.setting_key] = {
        value,
        type: row.setting_type,
        description: row.description,
        updated_at: row.updated_at
      };
    });

    return NextResponse.json(settings);

  } catch (error) {
    console.error('[API] Admin error fetching settings:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching settings.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings - Update multiple settings
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      for (const [key, settingData] of Object.entries(settings)) {
        const { value, type = 'string', description = '' } = settingData as any;

        let stringValue = value;
        if (type === 'json') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }

        await client.query(`
          INSERT INTO system_settings (setting_key, setting_value, setting_type, description, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
          ON CONFLICT (setting_key) 
          DO UPDATE SET 
            setting_value = $2,
            setting_type = $3,
            description = $4,
            updated_at = NOW()
        `, [key, stringValue, type, description]);
      }

      await client.query('COMMIT');

      return NextResponse.json({ message: 'Settings updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Admin error updating settings:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating settings.' },
      { status: 500 }
    );
  }
} 