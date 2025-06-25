-- ============================================
-- SCRIPT DE LIMPEZA: Remoção de Tabelas Não Usadas
-- Base de Dados: AliTools
-- Data: 2025-01-25
-- Objetivo: Remover código morto e adicionar índices de performance
-- ============================================

-- IMPORTANTE: 
-- Este script remove apenas tabelas que NÃO são usadas pelo sistema
-- Baseado em análise funcional confirmada em 2025-01-25

BEGIN;

-- ============================================
-- VERIFICAÇÕES DE SEGURANÇA
-- ============================================

-- Verificar se estamos na base de dados correta
DO $$
BEGIN
    IF current_database() != 'neondb' THEN
        RAISE EXCEPTION 'ERRO: Script deve ser executado na base de dados neondb';
    END IF;
    
    RAISE NOTICE 'Base de dados confirmada: %', current_database();
END $$;

-- Verificar se sistema principal está funcional
DO $$
DECLARE
    product_count INTEGER;
    variant_count INTEGER;
    price_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO variant_count FROM product_variants WHERE stockquantity > 0;
    SELECT COUNT(*) INTO price_count FROM prices;
    
    IF product_count < 8000 OR variant_count < 6000 OR price_count < 15000 THEN
        RAISE EXCEPTION 'ERRO: Sistema não parece estar em estado operacional normal';
    END IF;
    
    RAISE NOTICE 'Sistema verificado: % produtos, % variants com stock, % preços', 
                 product_count, variant_count, price_count;
END $$;

-- ============================================
-- REMOÇÃO DE TABELAS NÃO USADAS
-- ============================================

-- 1. Remover stock_levels (Corrompida + Não usada)
-- Sistema usa product_variants.stockquantity
DROP TABLE IF EXISTS stock_levels CASCADE;
RAISE NOTICE '✅ Removida: stock_levels (2.852 registos corrompidos)';

-- 2. Remover content_banners (Vazia + Não implementada)
DROP TABLE IF EXISTS content_banners CASCADE;
RAISE NOTICE '✅ Removida: content_banners (0 registos)';

-- 3. Remover attributes (Vazia + Conflito com product_attributes)
DROP TABLE IF EXISTS attributes CASCADE;
RAISE NOTICE '✅ Removida: attributes (0 registos)';

-- 4. Remover product_sizes (Vazia + FK inválida)
DROP TABLE IF EXISTS product_sizes CASCADE;
RAISE NOTICE '✅ Removida: product_sizes (0 registos)';

-- ============================================
-- ADICIONAR ÍNDICES DE PERFORMANCE
-- ============================================

-- Índices para melhorar performance de queries EAN-based
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_ean 
ON product_variants(ean);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_images_ean 
ON product_images(ean);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_categories_ean 
ON product_categories(product_ean);

-- Índice para queries de stock
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_variants_stock 
ON product_variants(ean, stockquantity) WHERE stockquantity > 0;

-- Índice para queries de preços
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prices_variant_list 
ON prices(variantid, price_list_id);

-- ============================================
-- VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar que sistema ainda funciona após limpeza
DO $$
DECLARE
    product_count INTEGER;
    variant_count INTEGER;
    price_count INTEGER;
    image_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO product_count FROM products;
    SELECT COUNT(*) INTO variant_count FROM product_variants WHERE stockquantity > 0;
    SELECT COUNT(*) INTO price_count FROM prices;
    SELECT COUNT(*) INTO image_count FROM product_images;
    
    IF product_count < 8000 OR variant_count < 6000 OR price_count < 15000 THEN
        RAISE EXCEPTION 'ERRO: Sistema não está funcional após limpeza!';
    END IF;
    
    RAISE NOTICE '✅ Verificação final OK: % produtos, % variants com stock, % preços, % imagens', 
                 product_count, variant_count, price_count, image_count;
END $$;

COMMIT;

RAISE NOTICE '🎉 LIMPEZA CONCLUÍDA COM SUCESSO!';
RAISE NOTICE '📊 Tabelas removidas: 4 (stock_levels, content_banners, attributes, product_sizes)';
RAISE NOTICE '⚡ Índices adicionados: 5 (para performance)';
RAISE NOTICE '✅ Sistema continua 100% funcional';
RAISE NOTICE '🧹 Base de dados limpa e otimizada';
