-- Limpeza total do catálogo Geko (dropar todas as tabelas, pela ordem de dependências)
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS attributes CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS product_sizes CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
