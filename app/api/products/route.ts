import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../src/utils/jwtUtils';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const token = request.cookies.get('idea_session_token')?.value;
    let isAuthenticated = false;
    let userPermissions: string[] = [];

    if (token) {
      try {
        const decodedToken = verifyToken(token);
        if (decodedToken) {
          isAuthenticated = true;
          // Get user permissions
          const pool = await import('../../../db/index.cjs');
          const userQuery = `
            SELECT u.user_id, u.email, p.permission_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.role_id
            LEFT JOIN role_permissions rp ON r.role_id = rp.role_id
            LEFT JOIN permissions p ON rp.permission_id = p.permission_id
            WHERE u.email = $1
          `;
          const userResult = await pool.default.query(userQuery, [decodedToken.email]);
          if (userResult.rows.length > 0) {
            userPermissions = userResult.rows.map(row => row.permission_name).filter(Boolean);
          }
        }
      } catch (error) {
        console.error('[API] Error verifying token:', error);
        // Continue as unauthenticated user
      }
    }

    const canViewPrices = isAuthenticated && userPermissions.includes('view_price');
    const canViewStock = isAuthenticated && userPermissions.includes('view_stock');

    // Get query parameters from URL
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};
    
    // Convert URLSearchParams to object
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Mock Express request/response objects
    const req = {
      query: queryParams,
      method: 'GET',
      localUser: isAuthenticated ? { permissions: userPermissions } : null,
      params: {},
      body: {}
    };

    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
        send: () => new NextResponse(null, { status: code })
      }),
      json: (data: any) => NextResponse.json(data)
    };

    // Import and execute the products handler
    const pool = await import('../../../db/index.cjs');
    const productQueries = await import('../../../src/db/product-queries.cjs');
    const { buildCategoryTreeFromPaths } = await import('../../../src/api/utils/category-utils.cjs');

    // Handle filters route
    if (searchParams.get('filters') === 'true') {
      const [categoryData, brandData, priceData] = await Promise.all([
        pool.default.query('SELECT categoryid as id, name, "path" FROM categories ORDER BY "path"'),
        pool.default.query("SELECT DISTINCT brand as name FROM products WHERE brand IS NOT NULL AND brand <> '' ORDER BY name"),
        pool.default.query("SELECT MIN(price) as min, MAX(price) as max FROM prices WHERE price_list_id = (SELECT price_list_id FROM price_lists WHERE name = 'Base Selling Price' LIMIT 1)")
      ]);

      const categoryTree = buildCategoryTreeFromPaths(categoryData.rows);

      const filterOptions = {
        categories: categoryTree,
        brands: brandData.rows.map(row => row.name),
        price: {
          min: parseFloat(priceData.rows[0].min) || 0,
          max: parseFloat(priceData.rows[0].max) || 10000,
        }
      };

      return NextResponse.json(filterOptions);
    }

    // Handle main products listing
    const { 
      page = '1', 
      limit,
      sortBy: querySortBy,
      order: queryOrder,
      brands,
      categories, 
      priceMin,
      priceMax,
      q: searchQuery,
      featured,
      hasStock,
      onSale,
      isNew
    } = queryParams;

    let defaultSortBy = 'name';
    let defaultOrder = 'asc';
    const isFeaturedRequest = String(featured).toLowerCase() === 'true';

    if (isFeaturedRequest) {
      defaultSortBy = 'created_at';
      defaultOrder = 'desc';
    }

    const finalSortBy = querySortBy || defaultSortBy;
    const finalOrder = queryOrder || defaultOrder;
    
    const effectiveLimit = parseInt(limit, 10) || (isFeaturedRequest ? 5 : 20);
    const safeLimit = Math.min(effectiveLimit, 2000);

    const filters: any = {
      brands,
      categoryId: categories,
      priceMin,
      priceMax,
      searchQuery
    };

    if (isFeaturedRequest) {
      filters.is_featured = true;
    }

    // **ESTRATÉGIA VISITANTES**: Visitantes não autenticados só veem produtos com stock
    if (!isAuthenticated) {
      console.log('[API] Visitante não autenticado - aplicando hasStock=true automaticamente');
      filters.hasStock = true;
    } else {
      // Para utilizadores autenticados, aplicar filtro hasStock apenas se explicitamente definido
      if (hasStock === 'true') {
        filters.hasStock = true;
      }
    }
    
    if (onSale === 'true') {
      filters.onSale = true;
    }
    
    if (isNew === 'true') {
      filters.isNew = true;
    }

    const pagination = { 
      page: parseInt(page, 10), 
      limit: safeLimit, 
      sortBy: finalSortBy, 
      order: finalOrder 
    };

    const [totalProducts, productsFromDB] = await Promise.all([
      productQueries.default.countProducts(filters),
      productQueries.default.getProducts(filters, pagination)
    ]);

    // Handle product data based on authentication and permissions
    const processedProducts = productsFromDB.map(p => {
      const processed: any = { ...p };
      
      if (canViewPrices) {
        // User is authenticated and has view_price permission
        processed.priceStatus = 'authenticated';
        // Keep price and product_price fields as they are
      } else {
        // User is not authenticated or doesn't have permission
        delete processed.price;
        delete processed.product_price;
        processed.priceStatus = isAuthenticated ? 'no_permission' : 'unauthenticated';
      }

      if (canViewStock) {
        // User is authenticated and has view_stock permission
        processed.stockStatus = 'authenticated';
        // Keep total_stock field as is
        processed.stock = processed.total_stock || 0;
      } else {
        // User is not authenticated or doesn't have permission
        delete processed.total_stock;
        processed.stockStatus = isAuthenticated ? 'no_permission' : 'unauthenticated';
        processed.stock = null;
      }
      
      return processed;
    });

    return NextResponse.json({
      products: processedProducts,
      totalPages: Math.ceil(totalProducts / safeLimit),
      currentPage: parseInt(page, 10),
      totalProducts,
      userInfo: {
        isAuthenticated,
        canViewPrices,
        canViewStock,
        permissions: userPermissions
      }
    });

  } catch (error) {
    console.error('[API] Error fetching products:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching products.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Add admin authentication check
    // For now, return 401 since we don't have auth implemented
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product.' },
      { status: 500 }
    );
  }
} 