import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../../src/utils/adminAuth';

/**
 * DELETE /api/admin/pricing/lists/[id] - Delete price list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_settings']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const priceListId = params.id;

    if (!priceListId || isNaN(Number(priceListId))) {
      return NextResponse.json(
        { error: 'ID da lista de preços inválido' },
        { status: 400 }
      );
    }

    // Check if price list exists
    const checkQuery = 'SELECT price_list_id, name FROM price_lists WHERE price_list_id = $1';
    const checkResult = await pool.query(checkQuery, [priceListId]);

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lista de preços não encontrada' },
        { status: 404 }
      );
    }

    const priceList = checkResult.rows[0];

    // Check if price list is being used by any prices
    const usageQuery = 'SELECT COUNT(*) as count FROM prices WHERE price_list_id = $1';
    const usageResult = await pool.query(usageQuery, [priceListId]);
    const isInUse = parseInt(usageResult.rows[0].count) > 0;

    if (isInUse) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir esta lista de preços porque ela está sendo usada por produtos. Remova os preços associados primeiro.' 
        },
        { status: 409 }
      );
    }

    // Delete the price list
    const deleteQuery = 'DELETE FROM price_lists WHERE price_list_id = $1';
    await pool.query(deleteQuery, [priceListId]);

    console.log(`Admin ${adminUser.email} excluiu lista de preços ID ${priceListId}: ${priceList.name}`);

    return NextResponse.json({ 
      message: 'Lista de preços excluída com sucesso',
      deletedId: priceListId 
    });

  } catch (error) {
    console.error('[API] Error deleting price list:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor ao excluir lista de preços' },
      { status: 500 }
    );
  }
}
