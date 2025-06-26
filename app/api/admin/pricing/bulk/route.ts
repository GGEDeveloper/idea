import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

interface BulkOperationRequest {
  operationType: 'markup' | 'discount' | 'fixed_price' | 'category_update' | 'brand_update';
  operationName: string;
  filters: {
    category?: string;
    brand?: string;
    priceListId: number;
    minPrice?: number;
    maxPrice?: number;
    hasStock?: boolean;
    eans?: string[];
  };
  operationData: {
    percentage?: number;  // Para markup/discount
    fixedPrice?: number;  // Para fixed_price
    newPriceListId?: number; // Para transferir preços
  };
  applyImmediately?: boolean;
}

/**
 * GET /api/admin/pricing/bulk - List bulk operations
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
    const status = searchParams.get('status') || '';
    const type = searchParams.get('type') || '';

    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        bpo.operation_id,
        bpo.operation_type,
        bpo.operation_name,
        bpo.filter_criteria,
        bpo.operation_data,
        bpo.affected_count,
        bpo.status,
        bpo.error_message,
        bpo.executed_at,
        bpo.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM bulk_price_operations bpo
      LEFT JOIN users u ON bpo.created_by = u.user_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND bpo.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (type) {
      query += ` AND bpo.operation_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY bpo.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Count total
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM bulk_price_operations bpo 
      WHERE 1=1
    `;
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (status) {
      countQuery += ` AND bpo.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (type) {
      countQuery += ` AND bpo.operation_type = $${countParamIndex}`;
      countParams.push(type);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      operations: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('[API] Error fetching bulk operations:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching bulk operations.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pricing/bulk - Create and execute bulk operation
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

    const body: BulkOperationRequest = await request.json();
    const { 
      operationType, 
      operationName, 
      filters, 
      operationData, 
      applyImmediately = false 
    } = body;

    // Validações
    if (!operationType || !operationName || !filters || !operationData) {
      return NextResponse.json(
        { error: 'operationType, operationName, filters, and operationData are required' },
        { status: 400 }
      );
    }

    if (!filters.priceListId) {
      return NextResponse.json(
        { error: 'priceListId is required in filters' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    let operationId: number | null = null;

    try {
      await client.query('BEGIN');

      // 1. Criar operação em bulk_price_operations
      const createOpQuery = `
        INSERT INTO bulk_price_operations (
          operation_type, operation_name, filter_criteria, operation_data,
          status, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING operation_id
      `;

      const opResult = await client.query(createOpQuery, [
        operationType,
        operationName,
        JSON.stringify(filters),
        JSON.stringify(operationData),
        applyImmediately ? 'processing' : 'pending',
        adminUser.userId
      ]);

      operationId = opResult.rows[0].operation_id;

      if (applyImmediately && operationId) {
        // 2. Executar operação imediatamente
        const result = await executeBulkOperation(client, operationId, filters, operationType, operationData, adminUser.userId);
        
        // 3. Atualizar status da operação
        await client.query(`
          UPDATE bulk_price_operations 
          SET status = $1, affected_count = $2, executed_at = NOW()
          WHERE operation_id = $3
        `, ['completed', result.affectedCount, operationId]);

        await client.query('COMMIT');

        console.log(`[BULK-PRICING] Admin ${adminUser.email} executed bulk operation ${operationType}: ${result.affectedCount} prices affected`);

        return NextResponse.json({
          operationId,
          status: 'completed',
          affectedCount: result.affectedCount,
          message: `Operação em massa executada: ${result.affectedCount} preços atualizados`
        });

      } else {
        // Apenas criar a operação para execução posterior
        await client.query('COMMIT');

        return NextResponse.json({
          operationId,
          status: 'pending',
          message: 'Operação criada e agendada para execução'
        });
      }

    } catch (error) {
      await client.query('ROLLBACK');
      
      // Atualizar operação como falhada se foi criada
      if (operationId) {
        await client.query(`
          UPDATE bulk_price_operations 
          SET status = 'failed', error_message = $1
          WHERE operation_id = $2
        `, [(error as Error).message, operationId]);
      }
      
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error creating bulk operation:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating bulk operation.' },
      { status: 500 }
    );
  }
}

/**
 * Executar operação em massa
 */
async function executeBulkOperation(
  client: any,
  operationId: number,
  filters: any,
  operationType: string,
  operationData: any,
  userId: string
) {
  // Definir utilizador atual para triggers
  await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);

  // 1. Construir query para encontrar produtos/variantes que atendem aos filtros
  let selectQuery = `
    SELECT DISTINCT pv.variantid, pr.price as current_price, p.name as product_name
    FROM products p
    JOIN product_variants pv ON p.ean = pv.ean
    LEFT JOIN prices pr ON pv.variantid = pr.variantid AND pr.price_list_id = $1
    WHERE p.active = true
  `;

  const queryParams: any[] = [filters.priceListId];
  let paramIndex = 2;

  // Aplicar filtros
  if (filters.category) {
    selectQuery += ` AND EXISTS (
      SELECT 1 FROM product_categories pc 
      JOIN categories c ON pc.category_id = c.categoryid
      WHERE pc.product_ean = p.ean AND c.name ILIKE $${paramIndex}
    )`;
    queryParams.push(`%${filters.category}%`);
    paramIndex++;
  }

  if (filters.brand) {
    selectQuery += ` AND p.brand ILIKE $${paramIndex}`;
    queryParams.push(`%${filters.brand}%`);
    paramIndex++;
  }

  if (filters.minPrice !== undefined) {
    selectQuery += ` AND pr.price >= $${paramIndex}`;
    queryParams.push(filters.minPrice);
    paramIndex++;
  }

  if (filters.maxPrice !== undefined) {
    selectQuery += ` AND pr.price <= $${paramIndex}`;
    queryParams.push(filters.maxPrice);
    paramIndex++;
  }

  if (filters.hasStock !== undefined) {
    if (filters.hasStock) {
      selectQuery += ` AND pv.stockquantity > 0`;
    } else {
      selectQuery += ` AND pv.stockquantity <= 0`;
    }
  }

  if (filters.eans && filters.eans.length > 0) {
    const eanPlaceholders = filters.eans.map((_: string, index: number) => `$${paramIndex + index}`).join(',');
    selectQuery += ` AND p.ean IN (${eanPlaceholders})`;
    queryParams.push(...filters.eans);
    paramIndex += filters.eans.length;
  }

  // 2. Buscar variantes que atendem aos critérios
  const variantsResult = await client.query(selectQuery, queryParams);
  const variants = variantsResult.rows;

  if (variants.length === 0) {
    return { affectedCount: 0 };
  }

  // 3. Calcular novos preços baseado na operação
  const updates: Array<{variantid: string, newPrice: number, oldPrice: number}> = [];

  for (const variant of variants) {
    const currentPrice = variant.current_price || 0;
    let newPrice: number;

    switch (operationType) {
      case 'markup':
        newPrice = currentPrice * (1 + (operationData.percentage / 100));
        break;
      
      case 'discount':
        newPrice = currentPrice * (1 - (operationData.percentage / 100));
        break;
      
      case 'fixed_price':
        newPrice = operationData.fixedPrice;
        break;
      
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }

    // Arredondar para 4 casas decimais
    newPrice = Math.round(newPrice * 10000) / 10000;

    if (newPrice >= 0 && newPrice !== currentPrice) {
      updates.push({
        variantid: variant.variantid,
        newPrice,
        oldPrice: currentPrice
      });
    }
  }

  // 4. Aplicar atualizações
  let affectedCount = 0;

  for (const update of updates) {
    if (update.oldPrice > 0) {
      // Atualizar preço existente
      await client.query(`
        UPDATE prices 
        SET price = $1 
        WHERE variantid = $2 AND price_list_id = $3
      `, [update.newPrice, update.variantid, filters.priceListId]);
    } else {
      // Inserir novo preço
      await client.query(`
        INSERT INTO prices (variantid, price_list_id, price)
        VALUES ($1, $2, $3)
      `, [update.variantid, filters.priceListId, update.newPrice]);
    }

    // Log no histórico
    await client.query(`
      INSERT INTO price_history (
        variantid, price_list_id, old_price, new_price, changed_by, change_reason
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      update.variantid,
      filters.priceListId,
      update.oldPrice > 0 ? update.oldPrice : null,
      update.newPrice,
      userId,
      `Bulk operation ${operationType}: ${operationData.percentage ? operationData.percentage + '%' : 'fixed price'}`
    ]);

    affectedCount++;
  }

  return { affectedCount };
} 