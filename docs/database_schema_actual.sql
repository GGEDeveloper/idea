-- Estrutura real das tabelas principais do catálogo Geko
-- Gerado automaticamente a partir da base em produção (NeonDB)

-- Tabela: products
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

-- Tabela: product_images
CREATE TABLE IF NOT EXISTS product_images (
  ean TEXT,
  url TEXT,
  is_main BOOLEAN,
  sort_order INTEGER
);

-- Tabela: product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  ean TEXT,
  geko_variant_size_code TEXT,
  geko_variant_producer_code TEXT,
  geko_variant_stock_id TEXT,
  weight TEXT,
  gross_weight TEXT
);

-- Tabela: stock_levels
CREATE TABLE IF NOT EXISTS stock_levels (
  geko_variant_stock_id TEXT,
  quantity NUMERIC
);

-- Tabela: units
CREATE TABLE IF NOT EXISTS units (
  geko_unit_id TEXT PRIMARY KEY,
  name TEXT,
  moq INTEGER
);
