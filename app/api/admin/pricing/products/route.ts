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
  source_type: string; // 'geko' | 'internal'
}

/**
 * GET /api/admin/pricing/products - Get products with their prices (Geko + VIP unified)
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
    const sourceFilter = searchParams.get('source'); // 'geko', 'internal', ou undefined para ambos

    const offset = (page - 1) * limit;

    // Query unificada que combina produtos Geko e VIP
    let baseQuery = `
      WITH unified_products AS (
        -- PRODUTOS GEKO
        SELECT 
          p.ean,
          p.display_name_pt as name,
          p.brand,
          pv.variantid::text as variantid,
          pv.name as variant_name,
          pv.stockquantity,
          pv.supplier_price,
          p.source_type,
          
          -- Preço da lista selecionada (Geko)
          COALESCE(pr_selected.price, 0) as current_price,
          
          -- Preço promocional ativo (se existir)
          cp.promotional_price,
          
          -- Preços de outras listas para referência
          pr_supplier.price as supplier_price_list,
          pr_base.price as base_selling_price,
          
          -- Verificar se tem campanha ativa
          CASE WHEN cp.promotional_price IS NOT NULL THEN true ELSE false END as has_campaign,
          pc.name as campaign_name,
          
          -- Categorias (agregadas)
          COALESCE(
            ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), 
            ARRAY[]::TEXT[]
          ) as categories
          
        FROM unified_product_catalog p
        LEFT JOIN product_variants pv ON p.product_ean = pv.ean AND p.source_type = 'geko'
        LEFT JOIN prices pr_selected ON pv.variantid = pr_selected.variantid 
          AND pr_selected.price_list_id = $1
        
        -- Preços promocionais ativos (só Geko por enquanto)
        LEFT JOIN campaign_prices cp ON pv.variantid = cp.variantid
        LEFT JOIN price_campaigns pc ON cp.campaign_id = pc.campaign_id 
          AND pc.is_active = true
          AND pc.start_date <= NOW()
          AND (pc.end_date IS NULL OR pc.end_date > NOW())
        
        -- Categorias (unificadas)
        LEFT JOIN product_categories pc_cat ON p.product_ean = pc_cat.product_ean
        LEFT JOIN categories c ON pc_cat.category_id = c.categoryid
        
        -- Preços de outras listas para referência (só Geko)
        LEFT JOIN prices pr_supplier ON pv.variantid = pr_supplier.variantid 
          AND pr_supplier.price_list_id = 1  -- Supplier Price
        LEFT JOIN prices pr_base ON pv.variantid = pr_base.variantid 
          AND pr_base.price_list_id = 2      -- Base Selling Price
        
        WHERE p.source_type = 'geko' AND p.is_active = true
        GROUP BY 
          p.ean, p.display_name_pt, p.brand, pv.variantid, pv.name, pv.stockquantity, 
          pv.supplier_price, p.source_type, pr_selected.price, cp.promotional_price, 
          pc.name, pr_supplier.price, pr_base.price
        
        UNION ALL
        
        -- PRODUTOS VIP
        SELECT 
          ip.product_ean as ean,
          ip.display_name_pt as name,
          ip.brand,
          CONCAT('VIP_', ip.product_ean) as variantid, -- Criar variantid virtual para VIP
          ip.display_name_pt as variant_name,
          0 as stockquantity, -- VIP não tem controle de stock por enquanto
          ip_pricing.base_price as supplier_price,
          ip.source_type,
          
          -- Preço da lista selecionada (VIP)
          COALESCE(ip_pricing.final_price, 0) as current_price,
          
          -- VIP não tem sistema promocional ainda
          NULL::numeric as promotional_price,
          
          -- Preços de outras listas para referência (VIP)
          ip_pricing.base_price as supplier_price_list,
          ip_pricing.final_price as base_selling_price,
          
          -- VIP não tem campanhas ainda
          false as has_campaign,
          NULL::text as campaign_name,
          
          -- Categorias VIP
          COALESCE(
            ARRAY_AGG(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), 
            ARRAY[]::TEXT[]
          ) as categories
          
        FROM unified_product_catalog ip
        LEFT JOIN internal_pricing ip_pricing ON ip.product_ean = ip_pricing.internal_ean 
          AND ip_pricing.price_list_id = $1 AND ip_pricing.is_active = true
        
        -- Categorias VIP
        LEFT JOIN internal_product_categories ipc ON ip.product_ean = ipc.internal_ean
        LEFT JOIN categories c ON ipc.category_id = c.categoryid
        
        WHERE ip.source_type = 'internal' AND ip.is_active = true
        GROUP BY 
          ip.product_ean, ip.display_name_pt, ip.brand, ip.source_type,
          ip_pricing.base_price, ip_pricing.final_price
      )
      
      SELECT 
        ean,
        name,
        brand,
        variantid,
        variant_name,
        stockquantity,
        supplier_price,
        source_type,
        current_price,
        promotional_price,
        COALESCE(promotional_price, current_price, 0) as effective_price,
        supplier_price_list,
        base_selling_price,
        has_campaign,
        campaign_name,
        categories
      FROM unified_products
      WHERE 1=1
    `;

    const params: any[] = [parseInt(priceListId)];
    let paramIndex = 2;

    // Aplicar filtros
    if (search) {
      baseQuery += ` AND (name ILIKE $${paramIndex} OR ean ILIKE $${paramIndex} OR brand ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (brand) {
      baseQuery += ` AND brand ILIKE $${paramIndex}`;
      params.push(`%${brand}%`);
      paramIndex++;
    }

    if (category) {
      baseQuery += ` AND $${paramIndex} = ANY(categories)`;
      params.push(category);
      paramIndex++;
    }

    if (sourceFilter) {
      baseQuery += ` AND source_type = $${paramIndex}`;
      params.push(sourceFilter);
      paramIndex++;
    }

    if (hasPromotion === 'true') {
      baseQuery += ` AND promotional_price IS NOT NULL`;
    } else if (hasPromotion === 'false') {
      baseQuery += ` AND promotional_price IS NULL`;
    }

    // Aplicar ordenação
    const validSortFields = {
      'name': 'name',
      'brand': 'brand', 
      'price': 'effective_price',
      'stock': 'stockquantity',
      'supplier_price': 'supplier_price'
    };
    
    const sortField = validSortFields[sortBy as keyof typeof validSortFields] || 'name';
    const order = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    
    baseQuery += ` ORDER BY ${sortField} ${order}`;

    // Aplicar paginação
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Executar query principal
    const result = await pool.query(baseQuery, params);

    // Query para contar total de registos
    let countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT p.product_ean 
        FROM unified_product_catalog p
        WHERE p.is_active = true
        
        UNION ALL
        
        SELECT ip.product_ean 
        FROM unified_product_catalog ip
        WHERE ip.source_type = 'internal' AND ip.is_active = true
      ) combined
      WHERE 1=1
    `;

    const countParams: any[] = [];
    let countParamIndex = 1;

    // Aplicar mesmos filtros para contagem (simplificado)
    if (search || brand || category || sourceFilter) {
      // Para contagem, usar query simplificada na view unificada
      countQuery = `
        SELECT COUNT(*) as total
        FROM unified_product_catalog p
        WHERE p.is_active = true
      `;
      
      if (search) {
        countQuery += ` AND (p.display_name_pt ILIKE $${countParamIndex} OR p.product_ean ILIKE $${countParamIndex} OR p.brand ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
        countParamIndex++;
      }

      if (brand) {
        countQuery += ` AND p.brand ILIKE $${countParamIndex}`;
        countParams.push(`%${brand}%`);
        countParamIndex++;
      }

      if (sourceFilter) {
        countQuery += ` AND p.source_type = $${countParamIndex}`;
        countParams.push(sourceFilter);
        countParamIndex++;
      }
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

    // Buscar marcas únicas para filtros (unificadas) - CORREÇÃO para incluir marcas VIP
    const brandsQuery = `
      SELECT DISTINCT brand 
      FROM (
        -- Marcas Geko
        SELECT DISTINCT brand 
        FROM products 
        WHERE brand IS NOT NULL AND brand != '' AND active = true
        
        UNION ALL
        
        -- Marcas VIP
        SELECT DISTINCT brand 
        FROM internal_products 
        WHERE brand IS NOT NULL AND brand != '' AND is_active = true
      ) combined_brands
      ORDER BY brand
    `;
    const brandsResult = await pool.query(brandsQuery);

    // Buscar categorias únicas para filtros - CORREÇÃO para incluir categorias VIP
    const categoriesQuery = `
      SELECT DISTINCT c.name 
      FROM categories c
      WHERE EXISTS (
        -- Categorias Geko
        SELECT 1 FROM product_categories pc 
        WHERE pc.category_id = c.categoryid
        
        UNION ALL
        
        -- Categorias VIP
        SELECT 1 FROM internal_product_categories ipc 
        WHERE ipc.category_id = c.categoryid
      )
      ORDER BY c.name
    `;
    const categoriesResult = await pool.query(categoriesQuery);

    return NextResponse.json({
      products: result.rows.map(row => ({
        ...row,
        // Adicionar informações sobre listas de preços
        price_list_id: parseInt(priceListId),
        price_list_name: priceListsResult.rows.find(pl => pl.price_list_id === parseInt(priceListId))?.name || 'Lista de Preços'
      })),
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
        currentPriceList: priceListId,
        sources: [
          { id: 'geko', name: 'Produtos Geko' },
          { id: 'internal', name: 'Produtos VIP' }
        ]
      },
      stats: {
        totalProducts: totalRecords,
        withPromotions: result.rows.filter(p => p.has_campaign).length,
        withoutPrices: result.rows.filter(p => !p.current_price || p.current_price === 0).length,
        gekoProducts: result.rows.filter(p => p.source_type === 'geko').length,
        vipProducts: result.rows.filter(p => p.source_type === 'internal').length
      }
    });

  } catch (error) {
    console.error('[API] Error fetching unified product prices:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching product prices.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/pricing/products - Update product prices (Geko + VIP unified)
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
    let gekoUpdates = 0;
    let vipUpdates = 0;

    try {
      await client.query('BEGIN');

      // Definir utilizador atual para triggers
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [adminUser.userId]);

      for (const update of updates) {
        const { variantid, price_list_id, new_price } = update;

        if (!variantid || !price_list_id || new_price === undefined) {
          continue; // Skip invalid updates
        }

        // Detectar se é produto VIP ou Geko pelo variantid
        const isVipProduct = variantid.startsWith('VIP_');
        
        if (isVipProduct) {
          // PRODUTO VIP: Atualizar internal_pricing
          const internal_ean = variantid.replace('VIP_', '');
          
          // Verificar se o preço existe
          const existingPriceQuery = `
            SELECT final_price, base_price FROM internal_pricing 
            WHERE internal_ean = $1 AND price_list_id = $2 AND is_active = true
          `;
          const existingResult = await client.query(existingPriceQuery, [internal_ean, price_list_id]);

          if (existingResult.rows.length > 0) {
            // Atualizar preço VIP existente
            const updatePriceQuery = `
              UPDATE internal_pricing 
              SET final_price = $1, updated_at = NOW()
              WHERE internal_ean = $2 AND price_list_id = $3 AND is_active = true
            `;
            await client.query(updatePriceQuery, [new_price, internal_ean, price_list_id]);
          } else {
            // Inserir novo preço VIP (com base_price = final_price por enquanto)
            const insertPriceQuery = `
              INSERT INTO internal_pricing (internal_ean, price_list_id, base_price, final_price, is_active)
              VALUES ($1, $2, $3, $3, true)
            `;
            await client.query(insertPriceQuery, [internal_ean, price_list_id, new_price]);
          }

          vipUpdates++;
          
        } else {
          // PRODUTO GEKO: Atualizar prices (comportamento original)
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

          // Log histórico para Geko
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

          gekoUpdates++;
        }

        updatedCount++;
      }

      await client.query('COMMIT');

      console.log(`[PRICING] Admin ${adminUser.email} updated ${updatedCount} prices (${gekoUpdates} Geko + ${vipUpdates} VIP)${reason ? ` - Reason: ${reason}` : ''}`);

      return NextResponse.json({
        message: `${updatedCount} preços atualizados com sucesso`,
        updatedCount,
        breakdown: {
          geko: gekoUpdates,
          vip: vipUpdates
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('[API] Error updating unified product prices:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating prices.' },
      { status: 500 }
    );
  }
} 