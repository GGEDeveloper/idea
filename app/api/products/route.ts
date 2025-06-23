import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
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
      localUser: null, // TODO: Add authentication middleware
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

    if (hasStock === 'true') {
      filters.hasStock = true;
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

    // Sanitize products for guest users (since no auth yet)
    const sanitizedProducts = productsFromDB.map(p => {
      const sanitized: any = { ...p };
      // Remove sensitive fields for non-authenticated users
      delete sanitized.price;
      delete sanitized.product_price;
      sanitized.priceStatus = 'unauthenticated';
      return sanitized;
    });

    return NextResponse.json({
      products: sanitizedProducts,
      totalPages: Math.ceil(totalProducts / safeLimit),
      currentPage: parseInt(page, 10),
      totalProducts
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