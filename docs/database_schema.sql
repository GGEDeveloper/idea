-- ============================================
-- Database Schema for Geko B2B Application
-- Generated: 2025-06-08
-- ============================================

-- ============================================
-- Table: products
-- Main products table
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    productid TEXT PRIMARY KEY,
    name TEXT,
    sku TEXT,
    ean TEXT,
    codeproducer TEXT,
    shortdescription TEXT,
    longdescription TEXT,
    descriptionlang TEXT,
    stockquantity TEXT,
    deliverytime TEXT,
    pricenet TEXT,
    pricegross TEXT,
    pricevat TEXT,
    srpnet TEXT,
    srpgross TEXT,
    srpvat TEXT,
    producername TEXT,
    categoryname TEXT,
    categoryidosell TEXT,
    unitname TEXT,
    specifications_json JSONB,
    compatibilitycodes TEXT
);

-- ============================================
-- Table: product_images
-- Product images with main image flag and sorting
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
    ean TEXT,
    url TEXT,
    is_main BOOLEAN,
    sort_order INTEGER
);

-- ============================================
-- Table: categories
-- Product categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    geko_category_id TEXT PRIMARY KEY,
    name TEXT,
    parent_id_categories INTEGER REFERENCES categories(geko_category_id)
);

-- ============================================
-- Table: units
-- Measurement units
-- ============================================
CREATE TABLE IF NOT EXISTS units (
    geko_unit_id TEXT PRIMARY KEY,
    name TEXT,
    moq INTEGER
);

-- ============================================
-- Table: producers
-- Product manufacturers/producers
-- ============================================
CREATE TABLE IF NOT EXISTS producers (
    geko_producer_id TEXT PRIMARY KEY,
    name TEXT
);

-- ============================================
-- Table: attributes
-- Product attributes/features
-- ============================================
CREATE TABLE IF NOT EXISTS attributes (
    id_attributes SERIAL PRIMARY KEY,
    geko_feature_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255),
    type VARCHAR(32)
);

-- ============================================
-- Table: product_attributes
-- Many-to-many relationship between products and attributes
-- ============================================
CREATE TABLE IF NOT EXISTS product_attributes (
    id_product_attributes SERIAL PRIMARY KEY,
    product_id_products INTEGER,
    attribute_id_attributes INTEGER REFERENCES attributes(id_attributes),
    value_text TEXT,
    value_numeric NUMERIC(18,6),
    value_boolean BOOLEAN,
    geko_value_id VARCHAR(64),
    UNIQUE(product_id_products, attribute_id_attributes)
);

-- ============================================
-- Table: product_categories
-- Many-to-many relationship between products and categories
-- ============================================
CREATE TABLE IF NOT EXISTS product_categories (
    ean TEXT,
    geko_category_id TEXT REFERENCES categories(geko_category_id)
);

-- ============================================
-- Table: product_variants
-- Product variants information
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
    ean TEXT,
    geko_variant_size_code TEXT,
    geko_variant_producer_code TEXT,
    geko_variant_stock_id TEXT,
    weight TEXT,
    gross_weight TEXT
);

-- ============================================
-- Table: prices
-- Product pricing information
-- ============================================
CREATE TABLE IF NOT EXISTS prices (
    ean TEXT,
    geko_variant_stock_id TEXT,
    price_type TEXT,
    net_value TEXT,
    gross_value TEXT,
    currency TEXT
);

-- ============================================
-- Table: stock_levels
-- Product stock information
-- ============================================
CREATE TABLE IF NOT EXISTS stock_levels (
    geko_variant_stock_id TEXT,
    quantity NUMERIC
);

-- ============================================
-- Indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_ean ON products(ean);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_images_ean ON product_images(ean);
CREATE INDEX IF NOT EXISTS idx_product_attributes_product ON product_attributes(product_id_products);
CREATE INDEX IF NOT EXISTS idx_prices_ean ON prices(ean);
CREATE INDEX IF NOT EXISTS idx_stock_levels_stock_id ON stock_levels(geko_variant_stock_id);

-- ============================================
-- Foreign Key Constraints
-- ============================================
-- Note: Some foreign key constraints are defined inline with the table definitions
-- Add any additional constraints here if needed

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE products IS 'Main products table containing all product information';
COMMENT ON TABLE product_images IS 'Product images with main image flag and sorting order';
COMMENT ON TABLE categories IS 'Product categories hierarchy';
COMMENT ON TABLE units IS 'Measurement units for products';
COMMENT ON TABLE producers IS 'Product manufacturers/producers';
COMMENT ON TABLE attributes IS 'Product attributes/features definition';
COMMENT ON TABLE product_attributes IS 'Many-to-many relationship between products and their attributes';
COMMENT ON TABLE product_categories IS 'Many-to-many relationship between products and categories';
COMMENT ON TABLE product_variants IS 'Product variants information';
COMMENT ON TABLE prices IS 'Product pricing information';
COMMENT ON TABLE stock_levels IS 'Product stock information';
