import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json([], { status: 200 });
    }

    // Search query with ILIKE for partial matching
    const searchQuery = `
      SELECT DISTINCT 
        p.ean,
        p.name,
        p.shortdescription,
        pi.url as image_url,
        pr.price
      FROM products p
      LEFT JOIN product_images pi ON p.ean = pi.ean AND pi.is_primary = true
      LEFT JOIN product_variants pv ON p.ean = pv.ean
      LEFT JOIN prices pr ON pv.variantid = pr.variantid AND pr.price_list_id = 2
      WHERE 
        p.active = true 
        AND (
          p.name ILIKE $1 
          OR p.shortdescription ILIKE $1
          OR p.brand ILIKE $1
        )
      ORDER BY p.name
      LIMIT 10
    `;

    const searchTerm = `%${q}%`;
    const results = await query(searchQuery, [searchTerm]);

    return NextResponse.json(results.rows, { status: 200 });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
} 