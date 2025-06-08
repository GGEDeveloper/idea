-- Estrutura completa das tabelas do catálogo Geko (NeonDB)
-- Gerado automaticamente a partir da base real

-- Tabela: attributes
CREATE TABLE IF NOT EXISTS attributes (
  id_attributes integer PRIMARY KEY,
  geko_feature_id varchar(64) UNIQUE,
  name varchar(255),
  type varchar(32)
);

-- Tabela: categories
CREATE TABLE IF NOT EXISTS categories (
  geko_category_id text PRIMARY KEY,
  name text,
  path text,
  parent_geko_category_id text
);

-- Tabela: prices
CREATE TABLE IF NOT EXISTS prices (
  ean text,
  geko_variant_stock_id text,
  price_type text,
  net_value text,
  gross_value text,
  currency text
);

-- Tabela: producers
CREATE TABLE IF NOT EXISTS producers (
  geko_producer_id text PRIMARY KEY,
  name text
);

-- Tabela: product_attributes
CREATE TABLE IF NOT EXISTS product_attributes (
  id_product_attributes integer PRIMARY KEY,
  product_id_products integer,
  attribute_id_attributes integer REFERENCES attributes(id_attributes),
  value_text text,
  value_numeric numeric(18,6),
  value_boolean boolean,
  geko_value_id varchar(64),
  UNIQUE(product_id_products, attribute_id_attributes)
);

-- Tabela: product_categories
CREATE TABLE IF NOT EXISTS product_categories (
  ean text,
  geko_category_id text
);

-- Tabela: product_images
CREATE TABLE IF NOT EXISTS product_images (
  ean text,
  url text,
  is_main boolean,
  sort_order integer
);

-- Tabela: product_sizes
CREATE TABLE IF NOT EXISTS product_sizes (
  id_product_sizes integer PRIMARY KEY,
  product_id_products integer,
  geko_size_code varchar(64),
  producer_size_code varchar(64),
  name varchar(255),
  UNIQUE(product_id_products, geko_size_code)
);

-- Tabela: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  ean text,
  geko_variant_size_code text,
  geko_variant_producer_code text,
  geko_variant_stock_id text,
  weight text,
  gross_weight text
);

-- Tabela: products
CREATE TABLE IF NOT EXISTS products (
  productid text PRIMARY KEY,
  name text,
  sku text,
  ean text,
  codeproducer text,
  shortdescription text,
  longdescription text,
  descriptionlang text,
  stockquantity text,
  deliverytime text,
  pricenet text,
  pricegross text,
  pricevat text,
  srpnet text,
  srpgross text,
  srpvat text,
  producername text,
  categoryname text,
  categoryidosell text,
  unitname text,
  specifications_json jsonb,
  compatibilitycodes text
);

-- Tabela: stock_levels
CREATE TABLE IF NOT EXISTS stock_levels (
  geko_variant_stock_id text,
  quantity numeric
);

-- Tabela: units
CREATE TABLE IF NOT EXISTS units (
  geko_unit_id text PRIMARY KEY,
  name text,
  moq integer
);
