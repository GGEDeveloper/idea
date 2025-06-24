import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';

// Helper function to check admin auth
async function checkAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  // TODO: Implement JWT verification for admin
  return null;
}

/**
 * GET /api/admin/content - Get content pages and banners
 */
export async function GET(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'pages';

    if (type === 'pages') {
      // Create content_pages table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS content_pages (
          page_id SERIAL PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT,
          is_active BOOLEAN DEFAULT true,
          meta_title VARCHAR(255),
          meta_description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);

      const pagesQuery = `
        SELECT 
          page_id,
          slug,
          title,
          content,
          is_active,
          meta_title,
          meta_description,
          created_at,
          updated_at
        FROM content_pages
        ORDER BY title
      `;

      const result = await pool.query(pagesQuery);
      return NextResponse.json({ pages: result.rows });
    }

    if (type === 'banners') {
      const bannersQuery = `
        SELECT 
          banner_id,
          title,
          subtitle,
          image_url,
          link_url,
          button_text,
          position,
          is_active,
          display_order,
          start_date,
          end_date,
          created_at,
          updated_at
        FROM content_banners
        ORDER BY position, display_order, created_at DESC
      `;

      const result = await pool.query(bannersQuery);
      return NextResponse.json({ banners: result.rows });
    }

    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Admin error fetching content:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching content.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/content - Create new content
 */
export async function POST(request: NextRequest) {
  try {
    const adminAuth = await checkAdminAuth(request);
    if (!adminAuth) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'page') {
      const { slug, title, content, isActive = true, metaTitle, metaDescription } = data;

      if (!slug || !title) {
        return NextResponse.json(
          { error: 'Slug and title are required' },
          { status: 400 }
        );
      }

      const createPageQuery = `
        INSERT INTO content_pages (slug, title, content, is_active, meta_title, meta_description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING page_id, slug, title, content, is_active, meta_title, meta_description, created_at
      `;

      const result = await pool.query(createPageQuery, [
        slug,
        title,
        content,
        isActive,
        metaTitle,
        metaDescription
      ]);

      return NextResponse.json(result.rows[0], { status: 201 });
    }

    if (type === 'banner') {
      const { 
        title, 
        subtitle, 
        imageUrl, 
        linkUrl, 
        buttonText, 
        position = 'homepage', 
        isActive = true, 
        displayOrder = 0,
        startDate,
        endDate
      } = data;

      if (!title) {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        );
      }

      const createBannerQuery = `
        INSERT INTO content_banners (
          title, subtitle, image_url, link_url, button_text, 
          position, is_active, display_order, start_date, end_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING banner_id, title, subtitle, image_url, link_url, button_text, 
                  position, is_active, display_order, start_date, end_date, created_at
      `;

      const result = await pool.query(createBannerQuery, [
        title,
        subtitle,
        imageUrl,
        linkUrl,
        buttonText,
        position,
        isActive,
        displayOrder,
        startDate,
        endDate
      ]);

      return NextResponse.json(result.rows[0], { status: 201 });
    }

    return NextResponse.json(
      { error: 'Invalid content type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Admin error creating content:', error);
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Content with this identifier already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error while creating content.' },
      { status: 500 }
    );
  }
} 