-- RESET E IMPORTAÇÃO COMPLETA DA BASE DE DADOS GEKO
-- Apagar tabelas existentes (ordem inversa de dependências)
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS producers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Criação das tabelas
CREATE TABLE units (
    geko_unit_id TEXT PRIMARY KEY,
    name TEXT,
    moq INTEGER
);

CREATE TABLE producers (
    geko_producer_id TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE categories (
    geko_category_id TEXT PRIMARY KEY,
    name TEXT,
    path TEXT,
    parent_geko_category_id TEXT
);

CREATE TABLE products (
    productId TEXT PRIMARY KEY,
    name TEXT,
    sku TEXT,
    ean TEXT,
    codeProducer TEXT,
    shortDescription TEXT,
    longDescription TEXT,
    descriptionLang TEXT,
    stockQuantity TEXT,
    deliveryTime TEXT,
    priceNet TEXT,
    priceGross TEXT,
    priceVat TEXT,
    srpNet TEXT,
    srpGross TEXT,
    srpVat TEXT,
    producerName TEXT,
    categoryName TEXT,
    categoryIDosell TEXT,
    unitName TEXT,
    specifications_json JSONB,
    compatibilityCodes TEXT
);

CREATE TABLE stock_levels (
    geko_variant_stock_id TEXT PRIMARY KEY,
    quantity INTEGER
);

CREATE TABLE product_variants (
    ean TEXT,
    geko_variant_size_code TEXT,
    geko_variant_producer_code TEXT,
    geko_variant_stock_id TEXT,
    weight TEXT,
    gross_weight TEXT
);

CREATE TABLE product_images (
    ean TEXT,
    url TEXT,
    is_main BOOLEAN,
    sort_order INTEGER
);

CREATE TABLE product_categories (
    ean TEXT,
    geko_category_id TEXT
);

CREATE TABLE prices (
    ean TEXT,
    geko_variant_stock_id TEXT,
    price_type TEXT,
    net_value TEXT,
    gross_value TEXT,
    currency TEXT
);

-- IMPORTAÇÃO DOS CSVs
-- (Executar estes comandos no psql, substituindo o caminho se necessário)
-- Exemplo:
-- \copy products FROM 'data/csv_para_bd/products_table.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- Unidades
\copy units FROM 'data/csv_exports/units.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Produtores
\copy producers FROM 'data/csv_exports/producers.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Categorias
\copy categories FROM 'data/csv_exports/categories.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Produtos
\copy products FROM 'data/csv_para_bd/products_table.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Stock
\copy stock_levels FROM 'data/csv_exports/stock_levels.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Variantes
\copy product_variants FROM 'data/csv_exports/product_variants.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Imagens
\copy product_images FROM 'data/csv_exports/product_images.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Produto-Categoria
\copy product_categories FROM 'data/csv_exports/product_categories.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
-- Preços
\copy prices FROM 'data/csv_exports/prices.csv' WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- Fim do reset e importação
