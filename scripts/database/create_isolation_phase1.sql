-- ============================================
-- FASE 1: BASE DO SISTEMA DE ISOLAMENTO VIP
-- Criação das tabelas fundamentais para produtos internos
-- ============================================

BEGIN;

-- 1. SUPPLIER REGISTRY
CREATE TABLE IF NOT EXISTS supplier_registry (
    supplier_id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    supplier_type TEXT NOT NULL CHECK (supplier_type IN ('internal', 'geko', 'external_csv', 'api')),
    is_active BOOLEAN DEFAULT true,
    default_markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    import_config JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. INTERNAL PRODUCTS (425 produtos base)
CREATE TABLE IF NOT EXISTS internal_products (
    internal_ean TEXT PRIMARY KEY CHECK (internal_ean ~ '^INT_[A-Z0-9]+$'),
    internal_sku TEXT UNIQUE,
    supplier_id TEXT NOT NULL DEFAULT 'internal' REFERENCES supplier_registry(supplier_id),
    
    -- Nomes multi-idioma
    name TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    
    -- Descrições multi-idioma
    short_description TEXT,
    short_description_pt TEXT,
    short_description_en TEXT,
    
    -- Dados comerciais
    brand TEXT NOT NULL DEFAULT 'Genérico',
    base_cost NUMERIC(12,4),
    markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INTERNAL VARIANTS (996 variantes)
CREATE TABLE IF NOT EXISTS internal_variants (
    internal_variant_id TEXT PRIMARY KEY,
    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
    
    -- Nomes da variante multi-idioma
    variant_name TEXT NOT NULL,
    variant_name_pt TEXT NOT NULL,
    variant_name_en TEXT NOT NULL,
    
    -- Atributos
    size_value TEXT,
    color_value TEXT,
    variant_sku TEXT UNIQUE,
    
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dados iniciais
INSERT INTO supplier_registry (supplier_id, supplier_name, supplier_type, default_markup_percentage, notes) VALUES 
('internal', 'Produtos Próprios ALITOOLS', 'internal', 30.0, 'Produtos internos isolados'),
('geko', 'Geko Poland B2B', 'api', 25.0, 'Sistema existente Geko - NÃO ALTERAR')
ON CONFLICT (supplier_id) DO NOTHING;

-- Nova categoria necessária 
INSERT INTO categories (categoryid, name, path, parent_id, name_pt, name_en, path_pt, path_en) VALUES 
('110006', 'Trowels and Spatulas', 'Construction and Renovation\\Trowels and Spatulas', '105652',
 'Espátulas e Taloches', 'Trowels and Spatulas',
 'Construção e Renovação\\Espátulas e Taloches', 'Construction and Renovation\\Trowels and Spatulas')
ON CONFLICT (categoryid) DO NOTHING;

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_internal_products_active ON internal_products(is_active);
CREATE INDEX IF NOT EXISTS idx_internal_products_brand ON internal_products(brand);
CREATE INDEX IF NOT EXISTS idx_internal_variants_ean ON internal_variants(internal_ean);

-- Trigger para updated_at
CREATE TRIGGER trigger_supplier_registry_updated_at
    BEFORE UPDATE ON supplier_registry
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER trigger_internal_products_updated_at
    BEFORE UPDATE ON internal_products
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

COMMIT;

-- Log do sucesso
INSERT INTO admin_notifications (
    type, 
    title, 
    message, 
    priority, 
    created_at
) VALUES (
    'system_update',
    'Base do Sistema de Isolamento Criada',
    'Tabelas fundamentais criadas: supplier_registry, internal_products, internal_variants. Sistema base pronto.',
    'normal',
    NOW()
); 