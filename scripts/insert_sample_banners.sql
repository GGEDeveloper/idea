-- Script para inserir banners de exemplo no sistema
-- Execute este script na sua base de dados PostgreSQL

-- Primeiro, certifica-se que a tabela existe
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

-- Limpar banners existentes (opcional)
-- DELETE FROM content_banners WHERE position = 'homepage';

-- Inserir banners de exemplo para a homepage
INSERT INTO content_banners (
  title, 
  subtitle, 
  image_url, 
  link_url, 
  button_text, 
  position, 
  is_active, 
  display_order
) VALUES
(
  'A MARCA DAS MARCAS',
  'Ferramentas, bricolage, construção, jardim e proteção com inovação, variedade e preços competitivos para revendedores exigentes.',
  NULL, -- Sem imagem de fundo, usa gradiente padrão
  '/produtos',
  'Ver Produtos',
  'homepage',
  true,
  1
),
(
  'FERRAMENTAS PROFISSIONAIS',
  'Descubra nossa seleção exclusiva de ferramentas de alta qualidade para profissionais exigentes. Preços especiais para revendedores.',
  '/produtos/berbequim_profissional.png', -- Usar uma das imagens existentes
  '/produtos?category=ferramentas',
  'Ver Ferramentas',
  'homepage',
  true,
  2
),
(
  'EQUIPAMENTOS DE JARDIM',
  'Mantenha o seu espaço verde em perfeitas condições com os nossos equipamentos de jardinagem de última geração.',
  '/produtos/corta_relva_auto.png', -- Usar uma das imagens existentes
  '/produtos?category=jardim',
  'Ver Equipamentos',
  'homepage',
  true,
  3
),
(
  'COMPRESSORES INDUSTRIAIS',
  'Potência e eficiência para os trabalhos mais exigentes. Compressores profissionais com garantia de qualidade.',
  '/produtos/compressor_industrial.png', -- Usar uma das imagens existentes
  '/produtos?category=compressores',
  'Ver Compressores',
  'homepage',
  true,
  4
),
(
  'NOVIDADES 2025',
  'Seja o primeiro a conhecer as últimas inovações em ferramentas e equipamentos. Tecnologia de ponta ao seu alcance.',
  NULL, -- Sem imagem de fundo, usa gradiente padrão
  '/produtos?isNew=true',
  'Ver Novidades',
  'homepage',
  true,
  5
);

-- Verificar os banners inseridos
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
  created_at
FROM content_banners 
WHERE position = 'homepage' 
ORDER BY display_order ASC; 