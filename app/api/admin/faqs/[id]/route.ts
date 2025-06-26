import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../../src/utils/adminAuth';

/**
 * GET /api/admin/faqs/[id] - Get specific FAQ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_content']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const faqQuery = `
      SELECT 
        faq_id,
        question,
        answer,
        category,
        display_order,
        is_published,
        created_at,
        updated_at
      FROM faqs
      WHERE faq_id = $1
    `;

    const result = await pool.query(faqQuery, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching FAQ.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/faqs/[id] - Update specific FAQ
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_content']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { question, answer, category, displayOrder, isPublished } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const updateFaqQuery = `
      UPDATE faqs 
      SET 
        question = $2,
        answer = $3,
        category = $4,
        display_order = $5,
        is_published = $6,
        updated_at = NOW()
      WHERE faq_id = $1
      RETURNING faq_id, question, answer, category, display_order, is_published, updated_at
    `;

    const result = await pool.query(updateFaqQuery, [
      id,
      question,
      answer,
      category || 'geral',
      displayOrder || 0,
      isPublished !== undefined ? isPublished : true
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error('[API] Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating FAQ.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/faqs/[id] - Delete specific FAQ
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_content']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const { id } = params;

    const deleteFaqQuery = `
      DELETE FROM faqs
      WHERE faq_id = $1
      RETURNING faq_id, question
    `;

    const result = await pool.query(deleteFaqQuery, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'FAQ deleted successfully',
      deleted: result.rows[0]
    });

  } catch (error) {
    console.error('[API] Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting FAQ.' },
      { status: 500 }
    );
  }
} 