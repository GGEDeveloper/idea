import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../db/index.cjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const withProductCount = searchParams.get('withProductCount') === 'true';

    let query;
    if (withProductCount) {
      query = `
        SELECT 
          p.brand as name,
          COUNT(DISTINCT p.ean) as product_count,
          COUNT(DISTINCT pi.imageid) as image_count
        FROM products p
        LEFT JOIN product_images pi ON p.ean = pi.ean
        WHERE p.brand IS NOT NULL 
          AND p.brand != '' 
          AND p.active = true
        GROUP BY p.brand
        HAVING COUNT(DISTINCT p.ean) > 0
        ORDER BY COUNT(DISTINCT p.ean) DESC, p.brand ASC
        LIMIT $1
      `;
    } else {
      query = `
        SELECT DISTINCT brand as name
        FROM products 
        WHERE brand IS NOT NULL 
          AND brand != '' 
          AND active = true
        ORDER BY brand ASC
        LIMIT $1
      `;
    }

    const result = await pool.query(query, [limit]);
    
    return NextResponse.json({
      brands: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('[API] Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching brands.' },
      { status: 500 }
    );
  }
} 