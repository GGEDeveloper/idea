
-- ===================================================
-- 🔥 SEMANA 1 - DIA 1: CRIAR VARIANTES DEFAULT
-- Data: 2025-06-28 09:57:24
-- Objetivo: Tornar 100% dos produtos VIP funcionais
-- ===================================================

BEGIN;

-- Criar variantes default para produtos sem variantes
INSERT INTO internal_variants (
    internal_variant_id,
    internal_ean,
    variant_name,
    variant_name_pt,
    variant_name_en,
    size_value,
    color_value,
    variant_sku,
    is_active,
    sort_order,
    created_at
)
SELECT 
    ip.internal_ean || '_V001' as internal_variant_id,
    ip.internal_ean,
    'Padrão' as variant_name,
    'Padrão' as variant_name_pt,
    'Default' as variant_name_en,
    NULL as size_value,
    NULL as color_value,
    ip.internal_sku || '_DEF' as variant_sku,
    true as is_active,
    0 as sort_order,
    NOW() as created_at
FROM internal_products ip
WHERE NOT EXISTS (
    SELECT 1 FROM internal_variants iv 
    WHERE iv.internal_ean = ip.internal_ean
);

-- Verificar se todas as variantes foram criadas
DO $$
DECLARE
    produtos_total INTEGER;
    produtos_com_variantes INTEGER;
    variantes_criadas INTEGER;
BEGIN
    SELECT COUNT(*) INTO produtos_total FROM internal_products;
    
    SELECT COUNT(DISTINCT internal_ean) INTO produtos_com_variantes 
    FROM internal_variants;
    
    SELECT COUNT(*) INTO variantes_criadas
    FROM internal_variants 
    WHERE internal_variant_id LIKE '%_V001';
    
    RAISE NOTICE '✅ RESULTADO DA CRIAÇÃO DE VARIANTES:';
    RAISE NOTICE '   • Total produtos VIP: %', produtos_total;
    RAISE NOTICE '   • Produtos com variantes: % (%.1f%%)', 
        produtos_com_variantes, 
        (produtos_com_variantes::FLOAT / produtos_total * 100);
    RAISE NOTICE '   • Variantes default criadas: %', variantes_criadas;
    
    IF produtos_com_variantes = produtos_total THEN
        RAISE NOTICE '🎉 SUCESSO: 100%% dos produtos têm variantes!';
    ELSE
        RAISE EXCEPTION 'ERRO: Ainda há produtos sem variantes!';
    END IF;
END $$;

COMMIT;

-- Verificação final
SELECT 
    'VERIFICAÇÃO FINAL' as status,
    COUNT(*) as total_produtos,
    COUNT(DISTINCT iv.internal_ean) as produtos_com_variantes,
    (COUNT(DISTINCT iv.internal_ean)::FLOAT / COUNT(*) * 100)::NUMERIC(5,1) as percentagem_cobertura
FROM internal_products ip
LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean;
