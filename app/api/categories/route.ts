import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import database dependencies
    const pool = await import('../../../db/index.cjs');
    const { buildCategoryTreeFromPaths } = await import('../../../src/api/utils/category-utils.cjs');

    // Get categories from database with product count
    const categoryData = await pool.default.query(`
      SELECT 
        c.categoryid as id, 
        c.name, 
        c."path", 
        c.parent_id,
        COALESCE(pc.product_count, 0) as product_count
      FROM categories c
      LEFT JOIN (
        SELECT 
          pc.category_id,
          COUNT(DISTINCT pc.product_ean) as product_count
        FROM product_categories pc
        JOIN products p ON pc.product_ean = p.ean AND p.active = true
        GROUP BY pc.category_id
      ) pc ON c.categoryid = pc.category_id
      ORDER BY c."path"
    `);

    // Build category tree structure
    const categoryTree = buildCategoryTreeFromPaths(categoryData.rows);

    return NextResponse.json({
      categories: categoryTree,
      totalCategories: categoryData.rows.length
    });

  } catch (error) {
    console.error('[API] Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Internal server error while fetching categories.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );

  } catch (error) {
    console.error('[API] Error creating category:', error);
    return NextResponse.json(
      { error: 'Error creating category.' },
      { status: 500 }
    );
  }
} 