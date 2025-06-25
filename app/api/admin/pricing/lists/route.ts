import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * POST /api/admin/pricing/lists - Create new price list
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
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da lista de preços é obrigatório' },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO price_lists (name, description)
      VALUES ($1, $2)
      RETURNING price_list_id, name, description
    `;

    const result = await pool.query(insertQuery, [
      name.trim(),
      description?.trim() || null
    ]);

    console.log(`Admin ${adminUser.email} criou nova lista de preços: ${name}`);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Error creating price list:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao criar lista de preços' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/lists - Update existing price list
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

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name || !name.trim()) {
      return NextResponse.json(
        { error: 'ID e nome da lista são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if price list exists
    const checkQuery = 'SELECT price_list_id FROM price_lists WHERE price_list_id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lista de preços não encontrada' },
        { status: 404 }
      );
    }

    const updateQuery = `
      UPDATE price_lists 
      SET name = $1, description = $2
      WHERE price_list_id = $3
      RETURNING price_list_id, name, description
    `;

    const result = await pool.query(updateQuery, [
      name.trim(),
      description?.trim() || null,
      id
    ]);

    console.log(`Admin ${adminUser.email} atualizou lista de preços ID ${id}: ${name}`);

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Error updating price list:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao atualizar lista de preços' },
      { status: 500 }
    );
  }
}
