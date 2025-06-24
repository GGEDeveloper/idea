import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../db/index.cjs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position') || 'homepage';

    // Criar tabela de banners se não existir (failsafe)
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS content_banners (
        banner_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        image_url TEXT,
        link_url TEXT,
        button_text VARCHAR(100),
        position VARCHAR(50) DEFAULT 'homepage' CHECK (position IN ('homepage', 'category', 'product')),
        is_active BOOLEAN DEFAULT true,
        display_order INTEGER DEFAULT 0,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await pool.query(createTableQuery);

    // Buscar banners ativos para a posição especificada
    const bannersQuery = `
      SELECT 
        banner_id,
        title,
        subtitle,
        image_url,
        link_url,
        button_text,
        position,
        display_order
      FROM content_banners
      WHERE 
        is_active = true 
        AND position = $1
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.query(bannersQuery, [position]);

    return NextResponse.json({
      banners: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 