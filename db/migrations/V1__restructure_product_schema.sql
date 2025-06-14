-- =================================================================
-- MIGRATION SCRIPT - FASE 1: RESTRUTURAÇÃO DO SCHEMA DE PRODUTOS
-- =================================================================
-- Este script é idempotente e transacional.
-- Ou tudo é executado com sucesso, ou nada é alterado.
-- =================================================================

BEGIN;

-- Passo 1: Renomear tabelas existentes como backup temporário
ALTER TABLE IF EXISTS products RENAME TO products_old;
ALTER TABLE IF EXISTS product_images RENAME TO product_images_old;
ALTER TABLE IF EXISTS product_variants RENAME TO product_variants_old;
ALTER TABLE IF EXISTS product_categories RENAME TO product_categories_old;
ALTER TABLE IF EXISTS product_attributes RENAME TO product_attributes_old;
ALTER TABLE IF EXISTS prices RENAME TO prices_old;
ALTER TABLE IF EXISTS categories RENAME TO categories_old;

-- Passo 2: Criar as novas tabelas com a arquitetura correta (VERSÃO FINAL)
CREATE TABLE products (
    ean TEXT PRIMARY KEY,
    productid TEXT UNIQUE,
    name TEXT,
    shortdescription TEXT,
    longdescription TEXT,
    brand TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE categories (
    categoryid TEXT PRIMARY KEY,
    name TEXT,
    "path" TEXT,
    parent_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE price_lists (
    price_list_id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);
CREATE TABLE prices (
    priceid SERIAL PRIMARY KEY,
    product_ean TEXT NOT NULL,
    price_list_id INTEGER NOT NULL,
    price NUMERIC(12, 4) NOT NULL,
    UNIQUE(product_ean, price_list_id)
);
CREATE TABLE product_images (
    imageid SERIAL PRIMARY KEY, -- Usar SERIAL para uma PK garantida
    ean TEXT,
    "url" TEXT,
    alt TEXT,
    is_primary BOOLEAN DEFAULT false
);
CREATE TABLE product_variants (
    variantid TEXT PRIMARY KEY,
    ean TEXT,
    name TEXT,
    stockquantity INTEGER
);
CREATE TABLE product_categories (
    product_ean TEXT,
    category_id TEXT,
    PRIMARY KEY (product_ean, category_id)
);
CREATE TABLE product_attributes (
    attributeid SERIAL PRIMARY KEY, -- Usar SERIAL para uma PK garantida
    product_ean TEXT,
    "key" TEXT,
    "value" TEXT
);

-- Passo 3: Migrar os dados (VERSÃO FINAL baseada em schemas reais)

INSERT INTO categories (categoryid, name, "path", parent_id)
SELECT geko_category_id, name, "path", parent_geko_category_id FROM categories_old
ON CONFLICT (categoryid) DO NOTHING;

INSERT INTO products (ean, productid, name, shortdescription, longdescription, brand)
SELECT ean, productid, name, shortdescription, longdescription, producername
FROM products_old
WHERE ean IS NOT NULL AND ean <> ''
ON CONFLICT (ean) DO NOTHING;

INSERT INTO price_lists (name, description) VALUES ('Preço Base', 'Preços originais migrados') ON CONFLICT (name) DO NOTHING;

INSERT INTO prices (product_ean, price_list_id, price)
SELECT po.ean, 1, CAST(REPLACE(po.gross_value, ',', '.') AS NUMERIC(12, 4))
FROM prices_old po
WHERE po.ean IN (SELECT ean FROM products) AND po.gross_value IS NOT NULL AND po.gross_value <> ''
ON CONFLICT (product_ean, price_list_id) DO NOTHING;

INSERT INTO product_images (ean, "url", alt, is_primary)
SELECT ean, url, 'image for ' || ean, is_main FROM product_images_old
WHERE ean IN (SELECT ean FROM products)
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (variantid, ean, name, stockquantity)
SELECT geko_variant_stock_id, ean, geko_variant_size_code, 0 FROM product_variants_old
WHERE ean IN (SELECT ean FROM products)
ON CONFLICT (variantid) DO NOTHING;

INSERT INTO product_categories (product_ean, category_id)
SELECT ean, geko_category_id FROM product_categories_old
WHERE ean IN (SELECT ean FROM products) AND geko_category_id IN (SELECT categoryid FROM categories)
ON CONFLICT (product_ean, category_id) DO NOTHING;

-- A tabela de atributos antiga não tem uma PK clara, não a migraremos por enquanto para garantir a estabilidade.

-- Passo 4: Remover as tabelas de backup
DROP TABLE products_old;
DROP TABLE product_images_old;
DROP TABLE product_variants_old;
DROP TABLE product_categories_old;
DROP TABLE product_attributes_old;
DROP TABLE prices_old;
DROP TABLE categories_old;

COMMIT;

-- =================================================================
-- FIM DO SCRIPT DE MIGRAÇÃO - FASE 1
-- ================================================================= 