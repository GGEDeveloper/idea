const express = require('express');
const pool = require('../../../db/index.cjs');
const { requireAdmin } = require('../middleware/localAuth.cjs');

const router = express.Router();

// Aplica middleware de admin a todas as rotas
router.use(requireAdmin);

/**
 * GET /api/admin/content/banners
 * Lista todos os banners do sistema
 */
router.get('/banners', async (req, res) => {
  try {
    // Primeiro, vamos verificar se a tabela existe, se não, criá-la
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
      ORDER BY display_order ASC, created_at DESC
    `;

    const result = await pool.query(bannersQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar banners:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/content/banners/:bannerId
 * Obter detalhes de um banner específico
 */
router.get('/banners/:bannerId', async (req, res) => {
  try {
    const { bannerId } = req.params;

    const bannerQuery = `
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
      WHERE banner_id = $1
    `;

    const result = await pool.query(bannerQuery, [bannerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Banner não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar banner:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/content/banners
 * Criar novo banner
 */
router.post('/banners', async (req, res) => {
  try {
    const {
      title,
      subtitle,
      image_url,
      link_url,
      button_text,
      position = 'homepage',
      is_active = true,
      display_order = 0,
      start_date,
      end_date
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título do banner é obrigatório' });
    }

    const createBannerQuery = `
      INSERT INTO content_banners (
        title, subtitle, image_url, link_url, button_text, 
        position, is_active, display_order, start_date, end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(createBannerQuery, [
      title, subtitle, image_url, link_url, button_text,
      position, is_active, display_order, start_date, end_date
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar banner:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/content/banners/:bannerId
 * Atualizar banner existente
 */
router.put('/banners/:bannerId', async (req, res) => {
  try {
    const { bannerId } = req.params;
    const {
      title,
      subtitle,
      image_url,
      link_url,
      button_text,
      position,
      is_active,
      display_order,
      start_date,
      end_date
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título do banner é obrigatório' });
    }

    const updateBannerQuery = `
      UPDATE content_banners 
      SET 
        title = $2,
        subtitle = $3,
        image_url = $4,
        link_url = $5,
        button_text = $6,
        position = $7,
        is_active = $8,
        display_order = $9,
        start_date = $10,
        end_date = $11,
        updated_at = NOW()
      WHERE banner_id = $1
      RETURNING *
    `;

    const result = await pool.query(updateBannerQuery, [
      bannerId, title, subtitle, image_url, link_url, button_text,
      position, is_active, display_order, start_date, end_date
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Banner não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar banner:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * DELETE /api/admin/content/banners/:bannerId
 * Eliminar banner
 */
router.delete('/banners/:bannerId', async (req, res) => {
  try {
    const { bannerId } = req.params;

    const deleteResult = await pool.query(
      'DELETE FROM content_banners WHERE banner_id = $1',
      [bannerId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ error: 'Banner não encontrado' });
    }

    res.json({ message: 'Banner eliminado com sucesso' });
  } catch (error) {
    console.error('Erro ao eliminar banner:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/content/promotions
 * Lista todas as promoções
 */
router.get('/promotions', async (req, res) => {
  try {
    // Criar tabela de promoções se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS content_promotions (
        promotion_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed', 'free_shipping')),
        discount_value NUMERIC(10,2),
        min_order_value NUMERIC(10,2),
        promotion_code VARCHAR(50) UNIQUE,
        is_active BOOLEAN DEFAULT true,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ,
        usage_limit INTEGER,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await pool.query(createTableQuery);

    const promotionsQuery = `
      SELECT 
        promotion_id,
        title,
        description,
        discount_type,
        discount_value,
        min_order_value,
        promotion_code,
        is_active,
        start_date,
        end_date,
        usage_limit,
        usage_count,
        created_at,
        updated_at
      FROM content_promotions
      ORDER BY created_at DESC
    `;

    const result = await pool.query(promotionsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar promoções:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * POST /api/admin/content/promotions
 * Criar nova promoção
 */
router.post('/promotions', async (req, res) => {
  try {
    const {
      title,
      description,
      discount_type,
      discount_value,
      min_order_value,
      promotion_code,
      is_active = true,
      start_date,
      end_date,
      usage_limit
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título da promoção é obrigatório' });
    }

    const createPromotionQuery = `
      INSERT INTO content_promotions (
        title, description, discount_type, discount_value, min_order_value,
        promotion_code, is_active, start_date, end_date, usage_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await pool.query(createPromotionQuery, [
      title, description, discount_type, discount_value, min_order_value,
      promotion_code, is_active, start_date, end_date, usage_limit
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar promoção:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'Código de promoção já existe' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
});

/**
 * GET /api/admin/content/pages
 * Lista páginas de conteúdo dinâmico
 */
router.get('/pages', async (req, res) => {
  try {
    // Criar tabela de páginas se não existir
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS content_pages (
        page_id SERIAL PRIMARY KEY,
        slug VARCHAR(100) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    await pool.query(createTableQuery);

    // Inserir páginas padrão se não existirem
    const insertDefaultPagesQuery = `
      INSERT INTO content_pages (slug, title, content, is_published) VALUES
      ('about', 'Sobre Nós', '<h1>Sobre a Nossa Empresa</h1><p>Conteúdo sobre a empresa...</p>', true),
      ('privacy', 'Política de Privacidade', '<h1>Política de Privacidade</h1><p>Conteúdo da política...</p>', true),
      ('terms', 'Termos e Condições', '<h1>Termos e Condições</h1><p>Conteúdo dos termos...</p>', true)
      ON CONFLICT (slug) DO NOTHING;
    `;

    await pool.query(insertDefaultPagesQuery);

    const pagesQuery = `
      SELECT 
        page_id,
        slug,
        title,
        LEFT(content, 200) as content_preview,
        meta_title,
        meta_description,
        is_published,
        created_at,
        updated_at
      FROM content_pages
      ORDER BY title
    `;

    const result = await pool.query(pagesQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar páginas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * GET /api/admin/content/pages/:pageId
 * Obter detalhes completos de uma página
 */
router.get('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;

    const pageQuery = `
      SELECT * FROM content_pages WHERE page_id = $1
    `;

    const result = await pool.query(pageQuery, [pageId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar página:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

/**
 * PUT /api/admin/content/pages/:pageId
 * Atualizar página existente
 */
router.put('/pages/:pageId', async (req, res) => {
  try {
    const { pageId } = req.params;
    const {
      title,
      content,
      meta_title,
      meta_description,
      is_published
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título da página é obrigatório' });
    }

    const updatePageQuery = `
      UPDATE content_pages 
      SET 
        title = $2,
        content = $3,
        meta_title = $4,
        meta_description = $5,
        is_published = $6,
        updated_at = NOW()
      WHERE page_id = $1
      RETURNING *
    `;

    const result = await pool.query(updatePageQuery, [
      pageId, title, content, meta_title, meta_description, is_published
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar página:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router; 