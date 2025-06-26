import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

interface Campaign {
  campaign_id?: number;
  name: string;
  description?: string;
  campaign_type: 'promotional' | 'seasonal' | 'clearance' | 'flash_sale' | 'bulk_discount';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_by?: string;
}

/**
 * GET /api/admin/pricing/campaigns - List campaigns
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const isActive = searchParams.get('isActive');
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        pc.campaign_id,
        pc.name,
        pc.description,
        pc.campaign_type,
        pc.start_date,
        pc.end_date,
        pc.is_active,
        pc.created_at,
        pc.updated_at,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(cp.campaign_price_id) as products_count,
        CASE 
          WHEN pc.start_date > NOW() THEN 'scheduled'
          WHEN pc.end_date IS NOT NULL AND pc.end_date < NOW() THEN 'expired'
          WHEN pc.is_active AND pc.start_date <= NOW() AND (pc.end_date IS NULL OR pc.end_date > NOW()) THEN 'active'
          ELSE 'inactive'
        END as status
      FROM price_campaigns pc
      LEFT JOIN users u ON pc.created_by = u.user_id
      LEFT JOIN campaign_prices cp ON pc.campaign_id = cp.campaign_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (isActive !== null && isActive !== undefined) {
      query += ` AND pc.is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    if (type) {
      query += ` AND pc.campaign_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (search) {
      query += ` AND (pc.name ILIKE $${paramIndex} OR pc.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += `
      GROUP BY pc.campaign_id, u.first_name, u.last_name, u.email
      ORDER BY pc.created_at DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Count total
    let countQuery = `
      SELECT COUNT(DISTINCT pc.campaign_id) as total 
      FROM price_campaigns pc 
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (isActive !== null && isActive !== undefined) {
      countQuery += ` AND pc.is_active = $${countParamIndex}`;
      countParams.push(isActive === 'true');
      countParamIndex++;
    }

    if (type) {
      countQuery += ` AND pc.campaign_type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }

    if (search) {
      countQuery += ` AND (pc.name ILIKE $${countParamIndex} OR pc.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    // Get campaign types for filters
    const typesQuery = `
      SELECT DISTINCT campaign_type 
      FROM price_campaigns 
      ORDER BY campaign_type
    `;
    const typesResult = await pool.query(typesQuery);

    return NextResponse.json({
      campaigns: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      },
      filters: {
        campaignTypes: typesResult.rows.map(row => row.campaign_type)
      },
      stats: {
        total,
        active: result.rows.filter(c => c.status === 'active').length,
        scheduled: result.rows.filter(c => c.status === 'scheduled').length,
        expired: result.rows.filter(c => c.status === 'expired').length
      }
    });

  } catch (error) {
    console.error('[API] Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching campaigns.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing/campaigns - Create campaign
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

    const body: Campaign = await request.json();
    const { 
      name, 
      description, 
      campaign_type, 
      start_date, 
      end_date, 
      is_active = true 
    } = body;

    // Validações
    if (!name || !campaign_type || !start_date) {
      return NextResponse.json(
        { error: 'name, campaign_type, and start_date are required' },
        { status: 400 }
      );
    }

    const validTypes = ['promotional', 'seasonal', 'clearance', 'flash_sale', 'bulk_discount'];
    if (!validTypes.includes(campaign_type)) {
      return NextResponse.json(
        { error: `campaign_type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Verificar se as datas são válidas
    const startDateTime = new Date(start_date);
    const endDateTime = end_date ? new Date(end_date) : null;

    if (isNaN(startDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start_date format' },
        { status: 400 }
      );
    }

    if (endDateTime && isNaN(endDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid end_date format' },
        { status: 400 }
      );
    }

    if (endDateTime && endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'end_date must be after start_date' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO price_campaigns (
        name, description, campaign_type, start_date, end_date, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING campaign_id, name, description, campaign_type, start_date, end_date, 
                is_active, created_at, updated_at
    `;

    const result = await pool.query(insertQuery, [
      name.trim(),
      description?.trim() || null,
      campaign_type,
      start_date,
      end_date || null,
      is_active,
      adminUser.userId
    ]);

    console.log(`[CAMPAIGNS] Admin ${adminUser.email} created campaign: ${name}`);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating campaign.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/campaigns - Update campaign
 */
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_settings']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body: Campaign & { campaign_id: number } = await request.json();
    const { 
      campaign_id,
      name, 
      description, 
      campaign_type, 
      start_date, 
      end_date, 
      is_active 
    } = body;

    if (!campaign_id || !name || !campaign_type || !start_date) {
      return NextResponse.json(
        { error: 'campaign_id, name, campaign_type, and start_date are required' },
        { status: 400 }
      );
    }

    // Check if campaign exists
    const checkQuery = 'SELECT campaign_id FROM price_campaigns WHERE campaign_id = $1';
    const checkResult = await pool.query(checkQuery, [campaign_id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Validar datas
    const startDateTime = new Date(start_date);
    const endDateTime = end_date ? new Date(end_date) : null;

    if (endDateTime && endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: 'end_date must be after start_date' },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE price_campaigns 
      SET name = $1, description = $2, campaign_type = $3, start_date = $4, 
          end_date = $5, is_active = $6
      WHERE campaign_id = $7
      RETURNING campaign_id, name, description, campaign_type, start_date, end_date, 
                is_active, created_at, updated_at
    `;

    const result = await pool.query(updateQuery, [
      name.trim(),
      description?.trim() || null,
      campaign_type,
      start_date,
      end_date || null,
      is_active,
      campaign_id
    ]);

    console.log(`[CAMPAIGNS] Admin ${adminUser.email} updated campaign ID ${campaign_id}: ${name}`);

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating campaign.' },
      { status: 500 }
    );
  }
} 