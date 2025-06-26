import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET: Listar notificações
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unread_only') === 'true';

    let whereClause = '1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }

    if (unreadOnly) {
      whereClause += ' AND is_read = false';
    }

    // Query principal
    const notificationsQuery = `
      SELECT 
        notification_id,
        type,
        title,
        message,
        priority,
        related_entity_type,
        related_entity_id,
        action_url,
        is_read,
        read_at,
        created_at
      FROM admin_notifications 
      WHERE ${whereClause}
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'normal' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END,
        created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const notifications = await pool.query(notificationsQuery, params);

    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM admin_notifications 
      WHERE ${whereClause}
    `;
    const countParams = params.slice(0, paramCount);
    const totalResult = await pool.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].total);

    // Contar não lidas
    const unreadQuery = `
      SELECT COUNT(*) as unread_count 
      FROM admin_notifications 
      WHERE is_read = false
    `;
    const unreadResult = await pool.query(unreadQuery);
    const unreadCount = parseInt(unreadResult.rows[0].unread_count);

    return NextResponse.json({
      notifications: notifications.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      unread_count: unreadCount
    });

  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH: Marcar como lida/não lida
export async function PATCH(request: NextRequest) {
  try {
    const { notification_ids, is_read } = await request.json();

    if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
      return NextResponse.json(
        { error: 'IDs de notificação são obrigatórios' },
        { status: 400 }
      );
    }

    const placeholders = notification_ids.map((_, index) => `$${index + 1}`).join(',');
    const params = [...notification_ids];

    if (typeof is_read === 'boolean') {
      params.push(is_read);
      params.push(is_read ? new Date().toISOString() : null);

      const query = `
        UPDATE admin_notifications 
        SET is_read = $${params.length - 1}, 
            read_at = $${params.length}
        WHERE notification_id IN (${placeholders})
        RETURNING notification_id, is_read
      `;

      const result = await pool.query(query, params);

      return NextResponse.json({
        success: true,
        updated_count: result.rows.length,
        updated_notifications: result.rows
      });
    }

    return NextResponse.json(
      { error: 'Estado is_read inválido' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 