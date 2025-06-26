import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../db/index.cjs';
import { checkAdminAuth } from '../../../../src/utils/adminAuth';

/**
 * GET /api/admin/faqs - Get all FAQs
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_content']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    // Create FAQs table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        faq_id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) DEFAULT 'geral',
        display_order INTEGER DEFAULT 0,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Insert default FAQs if table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM faqs');
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO faqs (question, answer, category, display_order, is_published) VALUES
        ('Como posso tornar-me parceiro da AliTools?', 'Para se tornar nosso parceiro, preencha o formulário de contacto em nossa página com os dados da sua empresa. Nossa equipa entrará em contacto consigo num prazo de 24 horas para avaliar a parceria.', 'parcerias', 1, true),
        ('Quais são os prazos de entrega?', 'Os nossos prazos de entrega variam conforme a localização e o tipo de produto. Geralmente, entregamos em 2-5 dias úteis em Portugal continental. Para ilhas e outros destinos, o prazo pode ser de 5-10 dias úteis.', 'entregas', 2, true),
        ('Como funciona o sistema de preços B2B?', 'O nosso sistema oferece preços especiais para parceiros comerciais. Após aprovação da sua conta empresarial, terá acesso a preços preferenciais e condições de pagamento diferenciadas.', 'precos', 3, true),
        ('Que tipos de pagamento aceitam?', 'Aceitamos transferência bancária, cheque e condições especiais de pagamento para parceiros estabelecidos. Os métodos de pagamento específicos são acordados durante o processo de parceria.', 'pagamentos', 4, true),
        ('Têm suporte técnico para os produtos?', 'Sim, oferecemos suporte técnico especializado para todos os nossos produtos. A nossa equipa pode ajudar com especificações técnicas, instalação e resolução de problemas.', 'suporte', 5, true)
      `);
    }

    const faqsQuery = `
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
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.query(faqsQuery);
    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('[API] Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching FAQs.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/faqs - Create new FAQ
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await checkAdminAuth(request, ['manage_content']);
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { question, answer, category = 'geral', displayOrder = 0, isPublished = true } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const createFaqQuery = `
      INSERT INTO faqs (question, answer, category, display_order, is_published)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING faq_id, question, answer, category, display_order, is_published, created_at
    `;

    const result = await pool.query(createFaqQuery, [
      question,
      answer,
      category,
      displayOrder,
      isPublished
    ]);

    return NextResponse.json(result.rows[0], { status: 201 });

  } catch (error) {
    console.error('[API] Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating FAQ.' },
      { status: 500 }
    );
  }
} 