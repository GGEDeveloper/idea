-- Geko Catalog - Esquema relacional completo (v2025-06-07)
-- Todas as PK/FK com nomes explícitos e rastreáveis

-- =============================
-- Tabela: categories
-- =============================
CREATE TABLE IF NOT EXISTS categories (
    id_categories SERIAL PRIMARY KEY,
    geko_category_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_id_categories INTEGER REFERENCES categories(id_categories)
);

-- =============================
-- Tabela: units
-- =============================
CREATE TABLE IF NOT EXISTS units (
    id_units SERIAL PRIMARY KEY,
    geko_unit_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL
);

-- =============================
-- Tabela: products
-- =============================
CREATE TABLE IF NOT EXISTS products (
    id_products SERIAL PRIMARY KEY,
    ean VARCHAR(32) UNIQUE NOT NULL,
    product_id_geko VARCHAR(64),
    code_geko VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    card_url TEXT,
    vat_rate VARCHAR(16),
    price_net DECIMAL(12,2),
    price_gross DECIMAL(12,2),
    producer_name VARCHAR(255),
    producer_id_geko VARCHAR(64),
    category_id_categories INTEGER REFERENCES categories(id_categories),
    unit_id_units INTEGER REFERENCES units(id_units),
    geko_size_code VARCHAR(64),
    weight VARCHAR(32),
    gross_weight VARCHAR(32)
);

-- =============================
-- Tabela: product_sizes
-- =============================
CREATE TABLE IF NOT EXISTS product_sizes (
    id_product_sizes SERIAL PRIMARY KEY,
    product_id_products INTEGER REFERENCES products(id_products),
    geko_size_code VARCHAR(64),
    producer_size_code VARCHAR(64),
    name VARCHAR(255),
    UNIQUE(product_id_products, geko_size_code)
);

-- =============================
-- Tabela: stock_levels
-- =============================
CREATE TABLE IF NOT EXISTS stock_levels (
    id_stock_levels SERIAL PRIMARY KEY,
    product_size_id_product_sizes INTEGER REFERENCES product_sizes(id_product_sizes),
    geko_stock_id VARCHAR(64) UNIQUE,
    quantity INTEGER
);

-- =============================
-- Tabela: product_images
-- =============================
CREATE TABLE IF NOT EXISTS product_images (
    id_product_images SERIAL PRIMARY KEY,
    product_id_products INTEGER REFERENCES products(id_products),
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER,
    UNIQUE (product_id_products, url)
);

-- =============================
-- Tabela: attributes (futura)
-- =============================
CREATE TABLE IF NOT EXISTS attributes (
    id_attributes SERIAL PRIMARY KEY,
    geko_feature_id VARCHAR(64) UNIQUE,
    name VARCHAR(255),
    type VARCHAR(32)
);

-- =============================
-- Tabela: product_attributes (futura)
-- =============================
CREATE TABLE IF NOT EXISTS product_attributes (
    id_product_attributes SERIAL PRIMARY KEY,
    product_id_products INTEGER REFERENCES products(id_products),
    attribute_id_attributes INTEGER REFERENCES attributes(id_attributes),
    value_text TEXT,
    value_numeric DECIMAL(18,6),
    value_boolean BOOLEAN,
    geko_value_id VARCHAR(64),
    UNIQUE(product_id_products, attribute_id_attributes)
);

-- =============================
-- Índices e constraints adicionais recomendados
-- =============================
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id_categories);
CREATE INDEX IF NOT EXISTS idx_products_unit_id ON products(unit_id_units);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product_id ON product_sizes(product_id_products);
CREATE INDEX IF NOT EXISTS idx_stock_levels_product_size_id ON stock_levels(product_size_id_product_sizes);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id_products);
-- FKs já estão explícitas e rastreáveis
