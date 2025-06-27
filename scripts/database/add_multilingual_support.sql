-- ============================================
-- SCRIPT: ADICIONAR SUPORTE MULTI-IDIOMA
-- Data: 2025-01-20
-- Objetivo: Preparar BD para produtos PT/EN sem afetar dados atuais
-- APROVADO: Adicionar colunas de tradução sem impacto nos dados Geko
-- ============================================

BEGIN;

-- ============================================
-- 1. TABELA: products
-- Adicionar colunas para nomes e descrições em PT/EN
-- ============================================

-- Nomes em ambos idiomas
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Descrições curtas em ambos idiomas  
ALTER TABLE products ADD COLUMN IF NOT EXISTS shortdescription_pt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS shortdescription_en TEXT;

-- Descrições longas em ambos idiomas
ALTER TABLE products ADD COLUMN IF NOT EXISTS longdescription_pt TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS longdescription_en TEXT;

-- Adicionar campo para identificar fonte do produto
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_source VARCHAR(20) DEFAULT 'geko';

-- ============================================
-- 2. TABELA: categories  
-- Adicionar colunas para nomes e paths em PT/EN
-- ============================================

-- Nomes das categorias em ambos idiomas
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_en TEXT;

-- Paths das categorias em ambos idiomas
ALTER TABLE categories ADD COLUMN IF NOT EXISTS path_pt TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS path_en TEXT;

-- ============================================
-- 3. TABELA: product_variants
-- Adicionar colunas para nomes de variantes em PT/EN
-- ============================================

-- Nomes das variantes em ambos idiomas
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS name_en TEXT;

-- ============================================
-- 4. TABELA: product_attributes
-- Adicionar colunas para atributos em PT/EN
-- ============================================

-- Chaves e valores dos atributos em ambos idiomas
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS key_pt TEXT;
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS key_en TEXT;
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS value_pt TEXT;
ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS value_en TEXT;

-- ============================================
-- 5. ÍNDICES DE PERFORMANCE
-- Criar índices para otimizar consultas multi-idioma
-- ============================================

-- Índices para pesquisa de produtos por idioma
CREATE INDEX IF NOT EXISTS idx_products_name_pt ON products(name_pt);
CREATE INDEX IF NOT EXISTS idx_products_name_en ON products(name_en);
CREATE INDEX IF NOT EXISTS idx_products_source ON products(product_source);

-- Índices para categorias por idioma
CREATE INDEX IF NOT EXISTS idx_categories_name_pt ON categories(name_pt);
CREATE INDEX IF NOT EXISTS idx_categories_name_en ON categories(name_en);

-- Índices para variantes por idioma
CREATE INDEX IF NOT EXISTS idx_variants_name_pt ON product_variants(name_pt);
CREATE INDEX IF NOT EXISTS idx_variants_name_en ON product_variants(name_en);

-- ============================================
-- 6. VIEWS HELPER PARA CONSULTAS MULTI-IDIOMA
-- Criar views que facilitam consultas por idioma
-- ============================================

-- View para produtos com idioma dinâmico
CREATE OR REPLACE VIEW products_multilingual AS
SELECT 
    ean,
    productid,
    product_source,
    
    -- Campos originais (mantidos para compatibilidade)
    name,
    shortdescription,
    longdescription,
    
    -- Campos portugueses
    COALESCE(name_pt, name) as display_name_pt,
    COALESCE(shortdescription_pt, shortdescription) as display_shortdesc_pt,
    COALESCE(longdescription_pt, longdescription) as display_longdesc_pt,
    
    -- Campos ingleses  
    COALESCE(name_en, name) as display_name_en,
    COALESCE(shortdescription_en, shortdescription) as display_shortdesc_en,
    COALESCE(longdescription_en, longdescription) as display_longdesc_en,
    
    brand,
    active,
    created_at,
    updated_at
FROM products;

-- View para categorias com idioma dinâmico
CREATE OR REPLACE VIEW categories_multilingual AS
SELECT 
    categoryid,
    
    -- Campos originais (mantidos para compatibilidade)
    name,
    path,
    
    -- Campos portugueses
    COALESCE(name_pt, name) as display_name_pt,
    COALESCE(path_pt, path) as display_path_pt,
    
    -- Campos ingleses
    COALESCE(name_en, name) as display_name_en,
    COALESCE(path_en, path) as display_path_en,
    
    parent_id,
    created_at,
    updated_at
FROM categories;

-- ============================================
-- 7. FUNÇÃO HELPER PARA OBTER CONTEÚDO POR IDIOMA
-- Função que retorna o conteúdo no idioma solicitado
-- ============================================

CREATE OR REPLACE FUNCTION get_product_name(product_ean TEXT, lang VARCHAR(5) DEFAULT 'pt')
RETURNS TEXT AS $$
BEGIN
    CASE lang
        WHEN 'en' THEN
            RETURN (SELECT COALESCE(name_en, name) FROM products WHERE ean = product_ean);
        ELSE
            RETURN (SELECT COALESCE(name_pt, name) FROM products WHERE ean = product_ean);
    END CASE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_category_name(cat_id TEXT, lang VARCHAR(5) DEFAULT 'pt')
RETURNS TEXT AS $$
BEGIN
    CASE lang
        WHEN 'en' THEN
            RETURN (SELECT COALESCE(name_en, name) FROM categories WHERE categoryid = cat_id);
        ELSE
            RETURN (SELECT COALESCE(name_pt, name) FROM categories WHERE categoryid = cat_id);
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. COMENTÁRIOS DE DOCUMENTAÇÃO
-- ============================================

COMMENT ON COLUMN products.name_pt IS 'Nome do produto em português - usado para produtos internos';
COMMENT ON COLUMN products.name_en IS 'Nome do produto em inglês - usado para produtos internos';
COMMENT ON COLUMN products.product_source IS 'Fonte do produto: geko, internal, etc.';

COMMENT ON COLUMN categories.name_pt IS 'Nome da categoria em português';
COMMENT ON COLUMN categories.name_en IS 'Nome da categoria em inglês';

COMMENT ON VIEW products_multilingual IS 'View que retorna produtos com fallback inteligente para idiomas';
COMMENT ON VIEW categories_multilingual IS 'View que retorna categorias com fallback inteligente para idiomas';

-- ============================================
-- 9. VALIDAÇÃO E LOGS
-- ============================================

-- Log da operação
INSERT INTO admin_notifications (
    type, 
    title, 
    message, 
    priority, 
    created_at
) VALUES (
    'system_update',
    'Suporte Multi-idioma Adicionado',
    'Estrutura de base de dados preparada para produtos PT/EN. Colunas adicionadas sem impacto nos dados existentes.',
    'normal',
    NOW()
);

-- Verificação final
DO $$
BEGIN
    -- Verificar se as colunas foram criadas
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'name_pt'
    ) THEN
        RAISE NOTICE 'SUCCESS: Suporte multi-idioma adicionado com sucesso!';
        RAISE NOTICE 'INFO: % produtos Geko preservados intactos', (SELECT COUNT(*) FROM products);
        RAISE NOTICE 'INFO: % categorias prontas para traduções', (SELECT COUNT(*) FROM categories);
    ELSE
        RAISE EXCEPTION 'ERRO: Falha ao adicionar suporte multi-idioma';
    END IF;
END $$;

COMMIT;

-- ============================================
-- RESUMO DA MIGRAÇÃO
-- ============================================

/*
✅ COLUNAS ADICIONADAS:
- products: name_pt, name_en, shortdescription_pt, shortdescription_en, longdescription_pt, longdescription_en, product_source
- categories: name_pt, name_en, path_pt, path_en  
- product_variants: name_pt, name_en
- product_attributes: key_pt, key_en, value_pt, value_en

✅ VIEWS CRIADAS:
- products_multilingual: Produtos com fallback inteligente de idioma
- categories_multilingual: Categorias com fallback inteligente de idioma

✅ FUNÇÕES CRIADAS:
- get_product_name(ean, lang): Obter nome do produto no idioma específico
- get_category_name(id, lang): Obter nome da categoria no idioma específico

✅ COMPATIBILIDADE:
- 🔒 Dados Geko: PRESERVADOS e intactos
- 🔒 Campos originais: MANTIDOS para retrocompatibilidade  
- 🆕 Sistema pronto para produtos internos PT/EN
- 🆕 Interface i18n pode usar as novas views

🎯 PRÓXIMO PASSO: Importar produtos internos com traduções PT/EN
*/ 