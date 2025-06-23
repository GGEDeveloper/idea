import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const category = searchParams.get('category');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long.' },
        { status: 400 }
      );
    }

    // Import database dependencies
    const productQueries = await import('../../../src/db/product-queries.cjs');

    // Build search filters
    const filters = {
      searchQuery: query.trim(),
      categoryId: category,
    };

    const pagination = { 
      page: 1, 
      limit: Math.min(limit, 50), 
      sortBy: 'relevance', 
      order: 'desc' 
    };

    // Search products
    const [totalResults, products] = await Promise.all([
      productQueries.default.countProducts(filters),
      productQueries.default.getProducts(filters, pagination)
    ]);

    // Sanitize products for guest users (since no auth yet)
    const sanitizedProducts = products.map(p => {
      const sanitized = { ...p };
      // Remove sensitive fields for non-authenticated users
      delete sanitized.price;
      delete sanitized.product_price;
      sanitized.priceStatus = 'unauthenticated';
      return sanitized;
    });

    return NextResponse.json({
      query,
      products: sanitizedProducts,
      totalResults,
      resultsShown: sanitizedProducts.length
    });

  } catch (error) {
    console.error('[API] Error during search:', error);
    return NextResponse.json(
      { message: 'Internal server error during search.' },
      { status: 500 }
    );
  }
} 