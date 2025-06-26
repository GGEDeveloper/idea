import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * GET /api/admin/pricing/geko-approvals - Buscar updates pendentes da Geko
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_prices', 'view_prices']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Buscar updates baseado no status
    const query = `
      SELECT 
        pgu.*,
        p.name as product_name,
        p.brand,
        p.shortdescription,
        CASE 
          WHEN pgu.reviewed_by IS NOT NULL THEN 
            u.first_name || ' ' || u.last_name 
          ELSE NULL 
        END as reviewed_by_name,
        EXTRACT(DAYS FROM (pgu.expires_at - NOW())) as days_until_expiry,
        
        -- Calculações auxiliares
        CASE 
          WHEN pgu.current_supplier_price IS NOT NULL AND pgu.current_supplier_price > 0 THEN
            ROUND(
              ((pgu.new_supplier_price - pgu.current_supplier_price) / pgu.current_supplier_price) * 100, 
              2
            )
          ELSE NULL
        END as calculated_price_change_percentage,
        
        CASE 
          WHEN pgu.new_supplier_price > COALESCE(pgu.current_supplier_price, 0) THEN 'increase'
          WHEN pgu.new_supplier_price < COALESCE(pgu.current_supplier_price, 0) THEN 'decrease'
          ELSE 'no_change'
        END as price_trend,
        
        CASE 
          WHEN pgu.new_stock_quantity > COALESCE(pgu.current_stock_quantity, 0) THEN 'increase'
          WHEN pgu.new_stock_quantity < COALESCE(pgu.current_stock_quantity, 0) THEN 'decrease'
          ELSE 'no_change'
        END as stock_trend
        
      FROM pending_geko_price_updates pgu
      LEFT JOIN products p ON pgu.ean = p.ean
      LEFT JOIN users u ON pgu.reviewed_by = u.user_id
      WHERE pgu.status = $1
      ORDER BY 
        CASE WHEN pgu.status = 'pending' THEN pgu.detected_at ELSE pgu.reviewed_at END DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM pending_geko_price_updates pgu
      WHERE pgu.status = $1
    `;

    const [updatesResult, countResult] = await Promise.all([
      pool.query(query, [status, limit, offset]),
      pool.query(countQuery, [status])
    ]);

    const updates = updatesResult.rows;
    const total = parseInt(countResult.rows[0].total);

    // Buscar estatísticas gerais
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        AVG(price_change_percentage) as avg_price_change,
        SUM(CASE WHEN price_change_percentage > 0 THEN 1 ELSE 0 END) as price_increases,
        SUM(CASE WHEN price_change_percentage < 0 THEN 1 ELSE 0 END) as price_decreases
      FROM pending_geko_price_updates
      WHERE detected_at >= NOW() - INTERVAL '30 days'
      GROUP BY status
    `;

    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows.reduce((acc, row) => {
      acc[row.status] = {
        count: parseInt(row.count),
        avgPriceChange: parseFloat(row.avg_price_change || 0),
        priceIncreases: parseInt(row.price_increases || 0),
        priceDecreases: parseInt(row.price_decreases || 0)
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: {
        updates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats
      }
    });

  } catch (error) {
    console.error('[GekoApprovals] Erro ao buscar updates:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing/geko-approvals - Aprovar ou rejeitar updates
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_prices']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, updateIds, notes } = body;

    if (!action || !updateIds || !Array.isArray(updateIds)) {
      return NextResponse.json(
        { error: 'Action and updateIds são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action deve ser "approve" ou "reject"' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    const results = [];

    try {
      await client.query('BEGIN');

      for (const updateId of updateIds) {
        if (action === 'approve') {
          // Usar função SQL para aprovar
          const approveResult = await client.query(
            'SELECT approve_pending_price_update($1, $2, $3) as success',
            [updateId, adminUser.userId, notes || null]
          );
          
          results.push({
            updateId,
            success: approveResult.rows[0].success,
            action: 'approved'
          });
        } else if (action === 'reject') {
          // Rejeitar update
          const rejectResult = await client.query(`
            UPDATE pending_geko_price_updates 
            SET 
              status = 'rejected',
              reviewed_by = $2,
              reviewed_at = NOW(),
              review_notes = $3,
              updated_at = NOW()
            WHERE update_id = $1 AND status = 'pending'
            RETURNING update_id
          `, [updateId, adminUser.userId, notes || null]);

          results.push({
            updateId,
            success: rejectResult.rows.length > 0,
            action: 'rejected'
          });
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: `${action === 'approve' ? 'Aprovados' : 'Rejeitados'} ${results.filter(r => r.success).length} de ${updateIds.length} updates`,
        data: { results }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[GekoApprovals] Erro ao processar updates:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao processar updates',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pricing/geko-approvals - Limpar updates expirados
 */
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_prices']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    // Usar função SQL para limpar updates expirados
    const result = await pool.query('SELECT cleanup_expired_pending_updates() as deleted_count');
    const deletedCount = result.rows[0].deleted_count;

    return NextResponse.json({
      success: true,
      message: `${deletedCount} updates expirados removidos`,
      data: { deletedCount }
    });

  } catch (error) {
    console.error('[GekoApprovals] Erro ao limpar updates expirados:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar updates expirados' },
      { status: 500 }
    );
  }
} 