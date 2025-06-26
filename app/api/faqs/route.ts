import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../db/index.cjs';

/**
 * GET /api/faqs - Get all published FAQs (public endpoint)
 */
export async function GET(request: NextRequest) {
  try {
    // Get published FAQs only (public access)
    const faqsQuery = `
      SELECT 
        faq_id,
        question,
        answer,
        category,
        display_order,
        created_at,
        updated_at
      FROM faqs
      WHERE is_published = true
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.query(faqsQuery);
    
    // Group FAQs by category
    const categories = result.rows.reduce((acc: any, faq: any) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push({
        id: faq.faq_id,
        question: faq.question,
        answer: faq.answer,
        displayOrder: faq.display_order,
        createdAt: faq.created_at,
        updatedAt: faq.updated_at
      });
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      categories,
      total: result.rows.length,
      categoryNames: {
        geral: 'Geral',
        parcerias: 'Parcerias',
        entregas: 'Entregas',
        precos: 'Preços',
        pagamentos: 'Pagamentos',
        suporte: 'Suporte Técnico',
        produtos: 'Produtos'
      }
    });

  } catch (error) {
    console.error('[API] Error fetching public FAQs:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao carregar perguntas frequentes.',
        success: false 
      },
      { status: 500 }
    );
  }
} 