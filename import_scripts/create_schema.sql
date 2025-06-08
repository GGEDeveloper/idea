-- Criação do schema para catálogo Geko (compatível Neon/PostgreSQL)

CREATE TABLE IF NOT EXISTS categories (
    internal_category_id SERIAL PRIMARY KEY,
    geko_category_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    parent_geko_category_id VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS units (
    internal_unit_id SERIAL PRIMARY KEY,
    geko_unit_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    ean VARCHAR(32) PRIMARY KEY,
    product_id_geko VARCHAR(64),
    code_geko VARCHAR(64),
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    card_url TEXT,
    vat_rate DECIMAL(5,2),
    price_net DECIMAL(12,2),
    price_gross DECIMAL(12,2),
    producer_name VARCHAR(255),
    producer_id_geko VARCHAR(64),
    category_geko_id VARCHAR(64) REFERENCES categories(geko_category_id),
    unit_geko_id VARCHAR(64) REFERENCES units(geko_unit_id),
    has_variants BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_sizes (
    internal_size_id SERIAL PRIMARY KEY,
    product_ean VARCHAR(32) REFERENCES products(ean) ON DELETE CASCADE,
    geko_size_code VARCHAR(64) NOT NULL,
    producer_size_code VARCHAR(64),
    name VARCHAR(128),
    UNIQUE(product_ean, geko_size_code)
);

CREATE TABLE IF NOT EXISTS stock_levels (
    internal_stock_id SERIAL PRIMARY KEY,
    geko_stock_id VARCHAR(64) UNIQUE NOT NULL,
    product_size_internal_id INTEGER REFERENCES product_sizes(internal_size_id) ON DELETE CASCADE,
    quantity INTEGER
);

CREATE TABLE IF NOT EXISTS product_images (
    internal_image_id SERIAL PRIMARY KEY,
    product_ean VARCHAR(32) REFERENCES products(ean) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INTEGER
);

CREATE TABLE IF NOT EXISTS prices (
    internal_price_id SERIAL PRIMARY KEY,
    product_ean VARCHAR(32) REFERENCES products(ean) ON DELETE CASCADE,
    value DECIMAL(12,2) NOT NULL,
    currency VARCHAR(8) NOT NULL,
    valid_from TIMESTAMP,
    valid_to TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productcategories (
    internal_id SERIAL PRIMARY KEY,
    product_ean VARCHAR(32) REFERENCES products(ean) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(internal_category_id) ON DELETE CASCADE,
    UNIQUE(product_ean, category_id)
);

-- Futuras tabelas de atributos (não criadas agora)
-- CREATE TABLE attributes (...)
-- CREATE TABLE product_attributes (...)
