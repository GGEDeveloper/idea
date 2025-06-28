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

def check_variants():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("🔍 VERIFICANDO PROBLEMA DAS VARIANTES")
    print("=" * 50)
    
    # Verificar produtos VIP vs variantes
    cursor.execute("""
        SELECT 
            (SELECT COUNT(*) FROM internal_products) as produtos_vip,
            (SELECT COUNT(*) FROM internal_variants) as variantes_vip,
            (SELECT COUNT(*) FROM internal_stock) as registos_stock,
            (SELECT COUNT(*) FROM internal_pricing) as registos_pricing;
    """)
    
    counts = cursor.fetchone()
    print(f"📊 CONTAGENS:")
    print(f"   • Produtos VIP: {counts['produtos_vip']}")
    print(f"   • Variantes VIP: {counts['variantes_vip']}")
    print(f"   • Registos stock: {counts['registos_stock']}")
    print(f"   • Registos pricing: {counts['registos_pricing']}")
    
    # Verificar se há produtos sem variantes
    cursor.execute("""
        SELECT ip.internal_ean, ip.name_pt
        FROM internal_products ip
        LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
        WHERE iv.internal_ean IS NULL
        LIMIT 5;
    """)
    
    no_variants = cursor.fetchall()
    print(f"\n❌ Produtos SEM variantes: {len(no_variants)}")
    for product in no_variants:
        print(f"   • {product['internal_ean']}: {product['name_pt']}")
    
    # Verificar alguns produtos COM variantes
    cursor.execute("""
        SELECT ip.internal_ean, ip.name_pt, COUNT(iv.internal_variant_id) as num_variants
        FROM internal_products ip
        JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
        GROUP BY ip.internal_ean, ip.name_pt
        ORDER BY COUNT(iv.internal_variant_id) DESC
        LIMIT 5;
    """)
    
    with_variants = cursor.fetchall()
    print(f"\n✅ Produtos COM variantes (top 5):")
    for product in with_variants:
        print(f"   • {product['internal_ean']}: {product['name_pt']} ({product['num_variants']} variantes)")
    
    # Se há produtos com variantes, testar um
    if with_variants:
        test_ean = with_variants[0]['internal_ean']
        
        cursor.execute("""
            SELECT 
                (SELECT ip_price.selling_price 
                 FROM internal_pricing ip_price
                 WHERE ip_price.internal_variant_id IN (
                   SELECT iv.internal_variant_id 
                   FROM internal_variants iv 
                   WHERE iv.internal_ean = %s
                 )
                 AND ip_price.price_list_id = 4
                 AND ip_price.is_active = true
                 LIMIT 1) as test_price,
                (SELECT SUM(ist.quantity) 
                 FROM internal_variants iv 
                 JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id 
                 WHERE iv.internal_ean = %s) as test_stock;
        """, (test_ean, test_ean))
        
        result = cursor.fetchone()
        print(f"\n🧪 TESTE PRODUTO COM VARIANTES ({test_ean}):")
        print(f"   • Preço: €{result['test_price']}")
        print(f"   • Stock: {result['test_stock']} unidades")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_variants()
