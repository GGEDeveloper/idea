#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔧 CORREÇÃO PRODUCT QUERIES VIP
==============================
Corrigir query SQL e implementar redirecionamento de variantes
"""

import re

def corrigir_query_variants():
    """Gerar correção para a query das variantes VIP"""
    
    # Query corrigida para variantes VIP
    query_corrigida = '''
        WHEN p.source_type = 'internal' THEN
          (SELECT json_agg(var ORDER BY var.sort_order) FROM
            (SELECT iv_detail.internal_variant_id as variantid, 
                    iv_detail.variant_name, 
                    ist_detail.quantity as stockquantity, 
                    ip_base.base_cost as supplier_price, 
                    false as is_on_sale,
                    iv_detail.sort_order,
                    (SELECT ip_detail.selling_price FROM internal_pricing ip_detail WHERE ip_detail.internal_variant_id = iv_detail.internal_variant_id AND ip_detail.price_list_id = 4 AND ip_detail.is_active = true LIMIT 1) as base_selling_price,
                    null as promotional_price
             FROM internal_variants iv_detail 
             JOIN internal_stock ist_detail ON iv_detail.internal_variant_id = ist_detail.internal_variant_id
             JOIN internal_products ip_base ON iv_detail.internal_ean = ip_base.internal_ean
             WHERE iv_detail.internal_ean = p.product_ean
            ) as var
          )
    '''
    
    return query_corrigida.strip()

def gerar_middleware_redirect():
    """Gerar middleware para redirecionamento de variantes"""
    
    middleware_code = '''
// Middleware para detectar e redirecionar acessos a variantes VIP
function isVipVariant(ean) {
    // Detectar se EAN é uma variante VIP (formato: INT_XXXXX_VN)
    return /^INT_[A-Z0-9]+_V\\d+$/.test(ean);
}

function extractParentEan(variantEan) {
    // Extrair EAN do produto pai de uma variante
    return variantEan.replace(/_V\\d+$/, '');
}

async function handleVariantRedirect(ean) {
    if (isVipVariant(ean)) {
        const parentEan = extractParentEan(ean);
        const variantNumber = ean.match(/_V(\\d+)$/)?.[1];
        
        // Retornar dados de redirecionamento
        return {
            shouldRedirect: true,
            parentEan: parentEan,
            variantId: ean,
            variantNumber: variantNumber,
            redirectUrl: `/produtos/${parentEan}?variant=${ean}`
        };
    }
    
    return { shouldRedirect: false };
}
    '''
    
    return middleware_code.strip()

def main():
    print("🔧 CORREÇÃO PRODUCT QUERIES VIP")
    print("=" * 50)
    
    print("\n1️⃣ CORREÇÃO DA QUERY SQL:")
    print("Problem: Query tenta ordenar por 'sort_order' sem incluí-lo no SELECT")
    print("Solução: Incluir sort_order no SELECT das variantes VIP")
    
    query_corrigida = corrigir_query_variants()
    print("\n✅ Query corrigida:")
    print(query_corrigida)
    
    print("\n2️⃣ MIDDLEWARE DE REDIRECIONAMENTO:")
    print("Problem: Variantes são acedidas diretamente vs produto pai")
    print("Solução: Detectar variantes e redirecionar para produto pai")
    
    middleware = gerar_middleware_redirect()
    print("\n✅ Middleware gerado:")
    print(middleware)
    
    print("\n3️⃣ ANÁLISE DO CASO ESPECÍFICO:")
    exemplo_ean = "INT_75D07C82"
    
    # Verificar se segue padrão de variante
    is_variant = re.match(r'^INT_[A-Z0-9]+_V\d+$', exemplo_ean)
    
    if is_variant:
        parent_ean = re.sub(r'_V\d+$', '', exemplo_ean)
        variant_num = re.search(r'_V(\d+)$', exemplo_ean).group(1)
        print(f"   🔍 {exemplo_ean} é uma VARIANTE")
        print(f"   📦 Produto pai: {parent_ean}")
        print(f"   🔢 Variante número: {variant_num}")
        print(f"   🔄 Deveria redirecionar para: /produtos/{parent_ean}?variant={exemplo_ean}")
    else:
        print(f"   🔍 {exemplo_ean} NÃO é uma variante (não segue padrão INT_XXXXX_VN)")
        print(f"   📦 É um produto principal")
        print(f"   ✅ Query SQL corrigida deveria resolver o problema")
    
    print("\n🎯 PRÓXIMOS PASSOS:")
    print("   1. Aplicar correção SQL no product-queries.cjs")
    print("   2. Implementar middleware de redirecionamento")
    print("   3. Testar acesso a variantes e produtos principais")
    print("   4. Validar pré-seleção de variantes na interface")

if __name__ == "__main__":
    main() 