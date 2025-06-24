import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../src/utils/adminAuth';

/**
 * GET /api/admin/products - List all products with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
    const brand = searchParams.get('brand');
    const active = searchParams.get('active');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'updated_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    let whereClause = '';
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Build WHERE clause for filters
    const whereConditions = [];

    if (search) {
      whereConditions.push(`(
        p.name ILIKE $${paramIndex} OR 
        p.shortdescription ILIKE $${paramIndex} OR 
        p.brand ILIKE $${paramIndex} OR
        p.ean ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (brand) {
      whereConditions.push(`p.brand = $${paramIndex}`);
      queryParams.push(brand);
      paramIndex++;
    }

    if (active !== null && active !== undefined) {
      whereConditions.push(`p.active = $${paramIndex}`);
      queryParams.push(active === 'true');
      paramIndex++;
    }

    if (featured !== null && featured !== undefined) {
      whereConditions.push(`p.is_featured = $${paramIndex}`);
      queryParams.push(featured === 'true');
      paramIndex++;
    }

    if (whereConditions.length > 0) {
      whereClause = 'WHERE ' + whereConditions.join(' AND ');
    }

    // Main query
    const offset = (page - 1) * limit;
    const productsQuery = `
      SELECT 
        p.ean,
        p.name,
        p.shortdescription,
        p.brand,
        p.active,
        p.is_featured,
        p.created_at,
        p.updated_at,
        COUNT(DISTINCT pv.variantid) as variant_count,
        COUNT(DISTINCT pi.imageid) as image_count
      FROM products p
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN product_images pi ON p.ean = pi.ean
      ${whereClause}
      GROUP BY p.ean, p.name, p.shortdescription, p.brand, p.active, p.is_featured, p.created_at, p.updated_at
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Count query
    const countQuery = `
      SELECT COUNT(DISTINCT p.ean) as total
      FROM products p
      ${whereClause}
    `;

    const [productsResult, countResult] = await Promise.all([
      pool.query(productsQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const totalProducts = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products: productsResult.rows,
      totalPages,
      currentPage: page,
      totalProducts
    });

  } catch (error) {
    console.error('[API] Admin error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching products.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products - Create new product
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      ean, 
      name, 
      shortDescription, 
      longDescription, 
      brand, 
      active = true, 
      isFeatured = false 
    } = body;

    // Validate required fields
    if (!ean || !name) {
      return NextResponse.json(
        { error: 'EAN and name are required' },
        { status: 400 }
      );
    }

    // Check if product already exists
    const existingProduct = await pool.query(
      'SELECT ean FROM products WHERE ean = $1',
      [ean]
    );

    if (existingProduct.rows.length > 0) {
      return NextResponse.json(
        { error: 'Product with this EAN already exists' },
        { status: 409 }
      );
    }

    // Insert new product
    const newProductQuery = `
      INSERT INTO products (ean, name, shortdescription, longdescription, brand, active, is_featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ean, name, shortdescription, longdescription, brand, active, is_featured, created_at, updated_at
    `;

    const result = await pool.query(newProductQuery, [
      ean,
      name,
      shortDescription,
      longDescription,
      brand,
      active,
      isFeatured
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Admin error creating product:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating product.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/products - Update existing product
 */
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_products']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      ean, 
      name, 
      shortDescription, 
      longDescription, 
      brand, 
      active, 
      isFeatured 
    } = body;

    if (!ean) {
      return NextResponse.json(
        { error: 'EAN is required for update' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await pool.query(
      'SELECT ean FROM products WHERE ean = $1',
      [ean]
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const updateQuery = `
      UPDATE products 
      SET name = $2, shortdescription = $3, longdescription = $4, brand = $5, active = $6, is_featured = $7, updated_at = NOW()
      WHERE ean = $1
      RETURNING ean, name, shortdescription, longdescription, brand, active, is_featured, updated_at
    `;

    const result = await pool.query(updateQuery, [
      ean,
      name,
      shortDescription,
      longDescription,
      brand,
      active,
      isFeatured
    ]);

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Admin error updating product:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating product.' },
      { status: 500 }
    );
  }
} 