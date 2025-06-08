-- DROP ALL TABLES (safe for re-import, disables FKs temporarily)
DO $$ DECLARE
    r RECORD;
BEGIN
    -- Drop all tables if exist
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- CREATE TABLES
CREATE TABLE producers (
    geko_producer_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL
);

CREATE TABLE units (
    geko_unit_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    moq INTEGER
);

CREATE TABLE categories (
    geko_category_id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    path VARCHAR,
    parent_geko_category_id VARCHAR
);

CREATE TABLE products (
    ean VARCHAR PRIMARY KEY,
    geko_product_id VARCHAR,
    name VARCHAR NOT NULL,
    short_description_en TEXT,
    long_description_en TEXT,
    desc_fallback_en TEXT,
    short_description_pt TEXT,
    long_description_pt TEXT,
    desc_fallback_pt TEXT,
    card_url VARCHAR,
    vat_rate INTEGER,
    geko_updated_at VARCHAR,
    geko_producer_id VARCHAR REFERENCES producers(geko_producer_id),
    geko_unit_id VARCHAR REFERENCES units(geko_unit_id)
);

CREATE TABLE product_categories (
    ean VARCHAR REFERENCES products(ean),
    geko_category_id VARCHAR REFERENCES categories(geko_category_id)
);

CREATE TABLE product_variants (
    ean VARCHAR REFERENCES products(ean),
    geko_variant_size_code VARCHAR,
    geko_variant_producer_code VARCHAR,
    geko_variant_stock_id VARCHAR PRIMARY KEY,
    weight DECIMAL,
    gross_weight DECIMAL
);

CREATE TABLE stock_levels (
    geko_variant_stock_id VARCHAR PRIMARY KEY REFERENCES product_variants(geko_variant_stock_id),
    quantity DECIMAL
);

CREATE TABLE prices (
    ean VARCHAR REFERENCES products(ean),
    geko_variant_stock_id VARCHAR REFERENCES product_variants(geko_variant_stock_id),
    price_type VARCHAR,
    net_value DECIMAL,
    gross_value DECIMAL,
    currency VARCHAR
);

CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    ean VARCHAR REFERENCES products(ean),
    url VARCHAR NOT NULL,
    is_main BOOLEAN,
    sort_order INTEGER
);
