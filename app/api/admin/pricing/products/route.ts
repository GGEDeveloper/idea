import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

interface ProductPriceData {
  ean: string;
  name: string;
  brand: string;
  variantid: string;
  variant_name: string;
  stockquantity: number;
  supplier_price: number;
  base_selling_price: number;
  promotional_price?: number;
  effective_price: number;
  price_list_id: number;
  price_list_name: string;
  categories: string[];
  has_campaign: boolean;
}

/**
 * GET /api/admin/pricing/products - Get products with their prices
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
    
    // Parâmetros de consulta
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || '';
    const category = searchParams.get('category') || '';
    const priceListId = searchParams.get('priceListId') || '4'; // Default: Preço Cliente
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const hasPromotion = searchParams.get('hasPromotion');

    const offset = (page - 1) * limit;

    // Query base com todas as informações necessárias
    let baseQuery = `
      SELECT 
        p.ean,
        p.name,
        p.brand,
        pv.variantid,
        pv.name as variant_name,
        pv.stockquantity,
        pv.supplier_price,
        
        -- Preço da lista selecionada
        COALESCE(pr_selected.price, 0) as current_price,
        
        -- Preço promocional ativo (se existir)
        cp.promotional_price,
        
        -- Preço efetivo (promocional ou normal)
        COALESCE(cp.promotional_price, pr_selected.price, 0) as effective_price,
        
        -- Informações da lista de preços
        pl.price_list_id,
        pl.name as price_list_name,
        
        -- Verificar se tem campanha ativa
        CASE WHEN cp.promotional_price IS NOT NULL THEN true ELSE false END as has_campaign,
        pc.name as campaign_name,
        
        -- Categorias (agregadas)
        COALESCE(
          ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), 
          ARRAY[]::TEXT[]
        ) as categories,
        
        -- Preços de outras listas para comparação
        pr_supplier.price as supplier_price_list,
        pr_base.price as base_selling_price
        
      FROM products p
      JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN prices pr_selected ON pv.variantid = pr_selected.variantid 
        AND pr_selected.price_list_id = $1
      LEFT JOIN price_lists pl ON pr_selected.price_list_id = pl.price_list_id
      
      -- Preços promocionais ativos
      LEFT JOIN campaign_prices cp ON pv.variantid = cp.variantid
      LEFT JOIN price_campaigns pc ON cp.campaign_id = pc.campaign_id 
        AND pc.is_active = true
        AND pc.start_date <= NOW()
        AND (pc.end_date IS NULL OR pc.end_date > NOW())
      
      -- Categorias
      LEFT JOIN product_categories pc_cat ON p.ean = pc_cat.product_ean
      LEFT JOIN categories c ON pc_cat.category_id = c.categoryid
      
      -- Preços de outras listas para referência
      LEFT JOIN prices pr_supplier ON pv.variantid = pr_supplier.variantid 
        AND pr_supplier.price_list_id = 1  -- Supplier Price
      LEFT JOIN prices pr_base ON pv.variantid = pr_base.variantid 
        AND pr_base.price_list_id = 2      -- Base Selling Price
      
      WHERE p.active = true
    `;

    const params: any[] = [parseInt(priceListId)];
    let paramIndex = 2;

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (p.name ILIKE $${paramIndex} OR p.ean ILIKE $${paramIndex} OR p.brand ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (brand) {
      baseQuery += ` AND p.brand ILIKE $${paramIndex}`;
      params.push(`%${brand}%`);
      paramIndex++;
    }

    if (category) {
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM product_categories pc_filter 
        JOIN categories c_filter ON pc_filter.category_id = c_filter.categoryid
        WHERE pc_filter.product_ean = p.ean 
        AND c_filter.name ILIKE $${paramIndex}
      )`;
      params.push(`%${category}%`);
      paramIndex++;
    }

    if (hasPromotion === 'true') {
      baseQuery += ` AND cp.promotional_price IS NOT NULL`;
    } else if (hasPromotion === 'false') {
      baseQuery += ` AND cp.promotional_price IS NULL`;
    }

    // Group by para agregar categorias
    baseQuery += `
      GROUP BY 
        p.ean, p.name, p.brand, pv.variantid, pv.name, pv.stockquantity, pv.supplier_price,
        pr_selected.price, cp.promotional_price, pl.price_list_id, pl.name, 
        pc.name, pr_supplier.price, pr_base.price
    `;

    // Aplicar ordenação
    const validSortFields = {
      'name': 'p.name',
      'brand': 'p.brand',
      'price': 'effective_price',
      'stock': 'pv.stockquantity',
      'supplier_price': 'pv.supplier_price'
    };
    
    const sortField = validSortFields[sortBy as keyof typeof validSortFields] || 'p.name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    baseQuery += ` ORDER BY ${sortField} ${order}`;

    // Aplicar paginação
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Executar query principal
    const result = await pool.query(baseQuery, params);

    // Query para contar total de registos
    let countQuery = `
      SELECT COUNT(DISTINCT p.ean) as total
      FROM products p
      JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN campaign_prices cp ON pv.variantid = cp.variantid
      LEFT JOIN price_campaigns pc ON cp.campaign_id = pc.campaign_id 
        AND pc.is_active = true
        AND pc.start_date <= NOW()
        AND (pc.end_date IS NULL OR pc.end_date > NOW())
      WHERE p.active = true
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    // Aplicar mesmos filtros para contagem
    if (search) {
      countQuery += ` AND (p.name ILIKE $${countParamIndex} OR p.ean ILIKE $${countParamIndex} OR p.brand ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (brand) {
      countQuery += ` AND p.brand ILIKE $${countParamIndex}`;
      countParams.push(`%${brand}%`);
      countParamIndex++;
    }

    if (category) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM product_categories pc_filter 
        JOIN categories c_filter ON pc_filter.category_id = c_filter.categoryid
        WHERE pc_filter.product_ean = p.ean 
        AND c_filter.name ILIKE $${countParamIndex}
      )`;
      countParams.push(`%${category}%`);
      countParamIndex++;
    }

    if (hasPromotion === 'true') {
      countQuery += ` AND cp.promotional_price IS NOT NULL`;
    } else if (hasPromotion === 'false') {
      countQuery += ` AND cp.promotional_price IS NULL`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].total);

    // Buscar listas de preços disponíveis
    const priceListsQuery = `
      SELECT price_list_id, name, description 
      FROM price_lists 
      ORDER BY price_list_id
    `;
    const priceListsResult = await pool.query(priceListsQuery);

    // Buscar marcas únicas para filtros
    const brandsQuery = `
      SELECT DISTINCT brand 
      FROM products 
      WHERE brand IS NOT NULL AND brand != '' 
      ORDER BY brand
    `;
    const brandsResult = await pool.query(brandsQuery);

    // Buscar categorias únicas para filtros
    const categoriesQuery = `
      SELECT DISTINCT c.name 
      FROM categories c
      JOIN product_categories pc ON c.categoryid = pc.category_id
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);

    return NextResponse.json({
      products: result.rows,
      pagination: {
        page,
        limit,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        hasNextPage: page < Math.ceil(totalRecords / limit),
        hasPrevPage: page > 1
      },
      filters: {
        priceLists: priceListsResult.rows,
        brands: brandsResult.rows.map(row => row.brand),
        categories: categoriesResult.rows.map(row => row.name),
        currentPriceList: priceListId
      },
      stats: {
        totalProducts: totalRecords,
        withPromotions: result.rows.filter(p => p.has_campaign).length,
        withoutPrices: result.rows.filter(p => !p.current_price || p.current_price === 0).length
      }
    });

  } catch (error) {
    console.error('[API] Error fetching product prices:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching product prices.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/products - Update product prices
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
    const { updates, reason } = body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    let updatedCount = 0;

    try {
      await client.query('BEGIN');

      // Definir utilizador atual para triggers
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [adminUser.userId]);

      for (const update of updates) {
        const { variantid, price_list_id, new_price } = update;

        if (!variantid || !price_list_id || new_price === undefined) {
          continue; // Skip invalid updates
        }

        // Verificar se o preço existe
        const existingPriceQuery = `
          SELECT price FROM prices 
          WHERE variantid = $1 AND price_list_id = $2
        `;
        const existingResult = await client.query(existingPriceQuery, [variantid, price_list_id]);

        if (existingResult.rows.length > 0) {
          // Atualizar preço existente
          const updatePriceQuery = `
            UPDATE prices 
            SET price = $1 
            WHERE variantid = $2 AND price_list_id = $3
          `;
          await client.query(updatePriceQuery, [new_price, variantid, price_list_id]);
        } else {
          // Inserir novo preço
          const insertPriceQuery = `
            INSERT INTO prices (variantid, price_list_id, price)
            VALUES ($1, $2, $3)
          `;
          await client.query(insertPriceQuery, [variantid, price_list_id, new_price]);
        }

        // Log manual adicional se necessário
        if (reason) {
          const logHistoryQuery = `
            INSERT INTO price_history (
              variantid, price_list_id, old_price, new_price, changed_by, change_reason
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `;
          const oldPrice = existingResult.rows[0]?.price || null;
          await client.query(logHistoryQuery, [
            variantid, price_list_id, oldPrice, new_price, adminUser.userId, reason
          ]);
        }

        updatedCount++;
      }

      await client.query('COMMIT');

      console.log(`[PRICING] Admin ${adminUser.email} updated ${updatedCount} prices${reason ? ` - Reason: ${reason}` : ''}`);

      return NextResponse.json({
        message: `${updatedCount} preços atualizados com sucesso`,
        updatedCount
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error updating product prices:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating prices.' },
      { status: 500 }
    );
  }
} 