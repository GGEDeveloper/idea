import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../../src/utils/adminAuth';

/**
 * POST /api/admin/pricing/geko-approvals/simulate - Simular atualizações da Geko
 * Esta API é para fins de desenvolvimento/teste apenas
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
    const { 
      ean, 
      newPrice, 
      newStock, 
      batchId = `sim_${Date.now()}`,
      simulate = true // Flag para indicar que é simulação
    } = body;

    if (!ean) {
      return NextResponse.json(
        { error: 'EAN é obrigatório' },
        { status: 400 }
      );
    }

    // Se não especificado, gerar valores aleatórios baseados no produto existente
    let targetPrice = newPrice;
    let targetStock = newStock;

    if (!targetPrice || !targetStock) {
      const currentProduct = await pool.query(
        'SELECT supplier_price, stock_quantity FROM geko_products WHERE ean = $1',
        [ean]
      );

      if (currentProduct.rows.length === 0) {
        return NextResponse.json(
          { error: 'Produto não encontrado' },
          { status: 404 }
        );
      }

      const current = currentProduct.rows[0];
      
      // Gerar variação de preço entre -20% e +30%
      if (!targetPrice) {
        const variation = (Math.random() - 0.3) * 0.5; // -20% a +30%
        targetPrice = Number((current.supplier_price * (1 + variation)).toFixed(4));
      }
      
      // Gerar variação de stock
      if (!targetStock) {
        const stockVariation = Math.floor(Math.random() * 200) - 50; // -50 a +150
        targetStock = Math.max(0, current.stock_quantity + stockVariation);
      }
    }

    // Usar função SQL para detectar mudanças
    const detectResult = await pool.query(
      'SELECT detect_geko_price_changes($1, $2, $3, $4, $5) as has_changes',
      [
        ean,
        targetPrice,
        targetStock,
        batchId,
        JSON.stringify({
          simulated: true,
          simulated_by: adminUser.userId,
          simulated_at: new Date().toISOString(),
          note: 'Dados simulados para teste do sistema de aprovação'
        })
      ]
    );

    const hasChanges = detectResult.rows[0].has_changes;

    if (!hasChanges) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma mudança significativa detectada para criar update pendente',
        data: {
          ean,
          targetPrice,
          targetStock,
          hasChanges: false
        }
      });
    }

    // Buscar o update criado
    const createdUpdate = await pool.query(`
      SELECT 
        *,
        EXTRACT(DAYS FROM (expires_at - NOW())) as days_until_expiry
      FROM pending_geko_price_updates 
      WHERE ean = $1 AND geko_sync_batch_id = $2
    `, [ean, batchId]);

    return NextResponse.json({
      success: true,
      message: 'Update simulado criado com sucesso',
      data: {
        update: createdUpdate.rows[0],
        simulation: {
          ean,
          targetPrice,
          targetStock,
          batchId,
          hasChanges: true
        }
      }
    });

  } catch (error) {
    console.error('[GekoApprovals] Erro ao simular update:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao simular update da Geko',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pricing/geko-approvals/simulate - Listar produtos disponíveis para simulação
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
    const limit = parseInt(searchParams.get('limit') || '10');

    // Buscar produtos com dados da Geko para simulação
    const query = `
      SELECT 
        gp.ean,
        p.name,
        p.brand,
        gp.supplier_price,
        gp.stock_quantity,
        gp.last_sync,
        -- Verificar se já tem update pendente
        CASE WHEN pgu.ean IS NOT NULL THEN true ELSE false END as has_pending_update
      FROM geko_products gp
      INNER JOIN products p ON gp.ean = p.ean
      LEFT JOIN pending_geko_price_updates pgu ON gp.ean = pgu.ean AND pgu.status = 'pending'
      WHERE gp.supplier_price IS NOT NULL 
        AND gp.supplier_price > 0
        AND p.name IS NOT NULL
      ORDER BY gp.last_sync DESC NULLS LAST, p.name
      LIMIT $1
    `;

    const result = await pool.query(query, [limit]);

    return NextResponse.json({
      success: true,
      data: {
        products: result.rows,
        message: `${result.rows.length} produtos disponíveis para simulação`
      }
    });

  } catch (error) {
    console.error('[GekoApprovals] Erro ao buscar produtos para simulação:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
} 