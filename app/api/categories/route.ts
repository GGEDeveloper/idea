import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Import database dependencies
    const pool = await import('../../../db/index.cjs');
    const { buildCategoryTreeFromPaths } = await import('../../../src/api/utils/category-utils.cjs');

    // Get categories from database
    const categoryData = await pool.default.query(
      'SELECT categoryid as id, name, "path", parent_id FROM categories ORDER BY "path"'
    );

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