import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET: Listar pedidos de cooperação
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let whereClause = '1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND application_status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (company_name ILIKE $${paramCount} OR vat_number ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Query principal para buscar pedidos (simplificada)
    const applicationsQuery = `
      SELECT 
        u.user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.company_name,
        u.vat_number,
        u.economic_activity_code,
        u.monthly_purchase_forecast,
        u.website_url,
        u.application_status,
        u.created_at,
        u.updated_at
      FROM users u
      WHERE ${whereClause} AND u.application_status IS NOT NULL AND u.application_status != 'active'
      ORDER BY 
        CASE u.application_status
          WHEN 'application_submitted' THEN 1
          WHEN 'under_review' THEN 2
          WHEN 'approved' THEN 3
          WHEN 'rejected' THEN 4
          ELSE 5
        END,
        u.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const applications = await pool.query(applicationsQuery, params);

    // Contar total
    const countQuery = `
      SELECT COUNT(u.user_id) as total 
      FROM users u
      WHERE ${whereClause} AND u.application_status IS NOT NULL AND u.application_status != 'active'
    `;
    const countParams = params.slice(0, paramCount);
    const totalResult = await pool.query(countQuery, countParams);
    const total = parseInt(totalResult.rows[0].total);

    // Estatísticas rápidas
    const statsQuery = `
      SELECT 
        application_status,
        COUNT(*) as count
      FROM users 
      WHERE application_status IS NOT NULL
      GROUP BY application_status
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows.reduce((acc, row) => {
      acc[row.application_status] = parseInt(row.count);
      return acc;
    }, {});

    return NextResponse.json({
      applications: applications.rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      statistics: stats
    });

  } catch (error) {
    console.error('Erro ao buscar pedidos de cooperação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH: Atualizar status de pedido
export async function PATCH(request: NextRequest) {
  try {
    const { user_id, status, admin_notes } = await request.json();

    if (!user_id || !status) {
      return NextResponse.json(
        { error: 'user_id e status são obrigatórios' },
        { status: 400 }
      );
    }

    const validStatuses = ['application_submitted', 'under_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Atualizar status do utilizador
      const updateQuery = `
        UPDATE users 
        SET application_status = $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING user_id, email, company_name, application_status
      `;

      const result = await client.query(updateQuery, [status, user_id]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Utilizador não encontrado' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      // Se aprovado, atribuir role de customer e ativar conta
      if (status === 'approved') {
        await client.query(`
          UPDATE users 
          SET role_id = 2, is_active = true
          WHERE user_id = $1
        `, [user_id]);
      }

      // TODO: Criar entrada no audit log quando tabela existir
      // TODO: Criar notificação quando sistema estiver pronto

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Status atualizado com sucesso',
        user: user
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 