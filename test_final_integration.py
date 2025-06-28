#!/usr/bin/env python3
import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def test_final_integration():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("🎉 TESTE FINAL DE INTEGRAÇÃO SIMBIÓTICA")
    print("=" * 60)
    
    # 1. Verificar inventário VIP implementado
    cursor.execute("""
        SELECT 
            COUNT(*) as total_stock_records,
            SUM(quantity) as total_inventory_units,
            AVG(quantity) as avg_stock_per_variant
        FROM internal_stock;
    """)
    
    stock_stats = cursor.fetchone()
    print("📦 INVENTÁRIO VIP:")
    print(f"   • {stock_stats['total_stock_records']} registos de stock")
    print(f"   • {stock_stats['total_inventory_units']} unidades totais")
    print(f"   • {stock_stats['avg_stock_per_variant']:.1f} unidades por variante")
    
    # 2. Testar query unificada de produtos
    cursor.execute("""
        SELECT 
            source_type,
            brand,
            COUNT(*) as produtos,
            SUM(CASE 
                WHEN source_type = 'internal' THEN 
                    (SELECT SUM(ist.quantity) 
                     FROM internal_variants iv 
                     JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id 
                     WHERE iv.internal_ean = upc.product_ean)
                ELSE 0
            END) as stock_total
        FROM unified_product_catalog upc
        WHERE source_type = 'internal'
        GROUP BY source_type, brand
        ORDER BY COUNT(*) DESC;
    """)
    
    brand_stats = cursor.fetchall()
    print(f"\n🏭 STOCK POR MARCA VIP:")
    for brand in brand_stats:
        print(f"   • {brand['brand']}: {brand['produtos']} produtos, {brand['stock_total']} unidades")
    
    # 3. Testar produto VIP específico
    cursor.execute("""
        SELECT product_ean 
        FROM unified_product_catalog 
        WHERE source_type = 'internal' 
        LIMIT 1;
    """)
    
    test_product = cursor.fetchone()
    if test_product:
        test_ean = test_product['product_ean']
        
        # Simular a query que será usada pelo frontend
        cursor.execute("""
            SELECT 
                p.product_ean as ean,
                p.display_name_pt as name,
                p.brand,
                p.source_type,
                CASE 
                    WHEN p.source_type = 'internal' THEN
                        (SELECT ip_price.selling_price 
                         FROM internal_pricing ip_price
                         WHERE ip_price.internal_variant_id IN (
                           SELECT iv.internal_variant_id 
                           FROM internal_variants iv 
                           WHERE iv.internal_ean = p.product_ean
                         )
                         AND ip_price.price_list_id = 4
                         AND ip_price.is_active = true
                         LIMIT 1)
                    ELSE NULL
                END as product_price,
                CASE 
                    WHEN p.source_type = 'internal' THEN 
                        (SELECT SUM(ist.quantity) 
                         FROM internal_variants iv 
                         JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id 
                         WHERE iv.internal_ean = p.product_ean)
                    ELSE NULL
                END as total_stock
            FROM unified_product_catalog p
            WHERE p.product_ean = %s;
        """, (test_ean,))
        
        product_test = cursor.fetchone()
        print(f"\n🧪 TESTE PRODUTO VIP: {test_ean}")
        print(f"   • Nome: {product_test['name']}")
        print(f"   • Marca: {product_test['brand']}")
        print(f"   • Preço: €{product_test['product_price']}")
        print(f"   • Stock: {product_test['total_stock']} unidades")
        print(f"   • Fonte: {product_test['source_type']}")
    
    # 4. Verificar se interface vai receber stock corretamente
    print(f"\n✅ VERIFICAÇÕES DE INTEGRAÇÃO:")
    
    # Campo stock deve estar presente
    has_stock = product_test['total_stock'] is not None and product_test['total_stock'] > 0
    print(f"   • Campo stock populado: {'✅' if has_stock else '❌'}")
    
    # Preço deve estar presente
    has_price = product_test['product_price'] is not None
    print(f"   • Campo price populado: {'✅' if has_price else '❌'}")
    
    # Source type deve ser internal
    is_vip = product_test['source_type'] == 'internal'
    print(f"   • Produto identificado como VIP: {'✅' if is_vip else '❌'}")
    
    cursor.close()
    conn.close()
    
    print(f"\n🎯 RESULTADO:")
    if has_stock and has_price and is_vip:
        print("✅ INTEGRAÇÃO SIMBIÓTICA PERFEITA!")
        print("   • Interface receberá stock VIP corretamente")
        print("   • Produtos VIP serão vendáveis")
        print("   • Sistema unificado operacional")
    else:
        print("❌ Problemas de integração encontrados")

if __name__ == "__main__":
    test_final_integration()
