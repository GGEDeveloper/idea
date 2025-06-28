-- ============================================
-- SISTEMA VIP - TABELAS PRODUTOS INTERNOS
-- Gerado automaticamente da BD real
-- Data: Fri Jun 27 20:58:04 WEST 2025
-- Atualizado: Com números reais da BD - Jan 2025
-- ============================================

-- Tabela: internal_images
CREATE TABLE IF NOT EXISTS internal_images (
    image_id UUID NOT NULL DEFAULT gen_random_uuid(),
    internal_ean TEXT NOT NULL,
    internal_variant_id TEXT,
    file_path TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    alt_text_pt TEXT,
    alt_text_en TEXT,
    image_type TEXT,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    uploaded_by UUID NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE internal_images IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: internal_pricing
CREATE TABLE IF NOT EXISTS internal_pricing (
    pricing_id UUID NOT NULL DEFAULT gen_random_uuid(),
    internal_variant_id TEXT NOT NULL,
    price_list_id INTEGER NOT NULL,
    selling_price NUMERIC(12,4) NOT NULL,
    cost_basis NUMERIC(12,4),
    margin_percentage NUMERIC(5,2),
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    pricing_notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE internal_pricing IS 'Tabela com 3792 registos. Última inspeção: 2025-01-29';

-- Tabela: internal_product_categories
CREATE TABLE IF NOT EXISTS internal_product_categories (
    internal_ean TEXT NOT NULL,
    category_id TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);
COMMENT ON TABLE internal_product_categories IS 'Tabela com 410 registos. Última inspeção: 2025-01-29';

-- Tabela: internal_product_images
CREATE TABLE IF NOT EXISTS internal_product_images (
    image_id INTEGER NOT NULL PRIMARY KEY,
    internal_ean TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text_pt TEXT,
    alt_text_en TEXT,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    uploaded_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE internal_product_images IS 'Tabela com 490 registos. Última inspeção: 2025-01-29';

-- Tabela: internal_products
CREATE TABLE IF NOT EXISTS internal_products (
    internal_ean TEXT NOT NULL,
    internal_sku TEXT,
    supplier_id TEXT NOT NULL,
    name TEXT NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    short_description TEXT,
    short_description_pt TEXT,
    short_description_en TEXT,
    brand TEXT NOT NULL,
    base_cost NUMERIC(12,4),
    markup_percentage NUMERIC(5,2) DEFAULT 30.0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE internal_products IS 'Tabela com 410 registos. Última inspeção: 2025-01-29';

-- Tabela: internal_stock
CREATE TABLE IF NOT EXISTS internal_stock (
    stock_id UUID NOT NULL DEFAULT gen_random_uuid(),
    internal_variant_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    minimum_stock INTEGER DEFAULT 0,
    maximum_stock INTEGER,
    reorder_point INTEGER DEFAULT 5,
    location TEXT,
    location_details TEXT,
    batch_number TEXT,
    expiry_date DATE,
    last_count_date DATE,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID,
    notes TEXT
);
COMMENT ON TABLE internal_stock IS 'Tabela com 0 registos. Última inspeção: 2025-06-27';

-- Tabela: internal_variants
CREATE TABLE IF NOT EXISTS internal_variants (
    internal_variant_id TEXT NOT NULL,
    internal_ean TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    variant_name_pt TEXT NOT NULL,
    variant_name_en TEXT NOT NULL,
    size_value TEXT,
    color_value TEXT,
    variant_sku TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE internal_variants IS 'Tabela com 971 registos. Última inspeção: 2025-01-29';
