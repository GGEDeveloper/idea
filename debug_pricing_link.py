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

def debug_pricing():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("🔍 DEBUG LIGAÇÃO PREÇOS VIP")
    print("=" * 50)
    
    # Obter um produto VIP para teste
    cursor.execute("""
        SELECT product_ean 
        FROM unified_product_catalog 
        WHERE source_type = 'internal' 
        LIMIT 1;
    """)
    
    test_ean = cursor.fetchone()['product_ean']
    print(f"📋 Testando produto: {test_ean}")
    
    # Verificar variantes do produto
    cursor.execute("""
        SELECT internal_variant_id, variant_name
        FROM internal_variants
        WHERE internal_ean = %s;
    """, (test_ean,))
    
    variants = cursor.fetchall()
    print(f"\n🔧 Variantes encontradas: {len(variants)}")
    for variant in variants:
        print(f"   • {variant['internal_variant_id']}: {variant['variant_name']}")
    
    if variants:
        test_variant = variants[0]['internal_variant_id']
        
        # Verificar preços diretos
        cursor.execute("""
            SELECT selling_price, price_list_id, is_active
            FROM internal_pricing
            WHERE internal_variant_id = %s;
        """, (test_variant,))
        
        prices = cursor.fetchall()
        print(f"\n💰 Preços para {test_variant}: {len(prices)}")
        for price in prices:
            print(f"   • Lista {price['price_list_id']}: €{price['selling_price']} (ativo: {price['is_active']})")
        
        # Verificar stock direto
        cursor.execute("""
            SELECT quantity, minimum_stock, reorder_point
            FROM internal_stock
            WHERE internal_variant_id = %s;
        """, (test_variant,))
        
        stock = cursor.fetchone()
        if stock:
            print(f"\n📦 Stock para {test_variant}:")
            print(f"   • Quantidade: {stock['quantity']}")
            print(f"   • Mínimo: {stock['minimum_stock']}")
        
        # Testar query como no produto-queries.cjs
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
        print(f"\n🧪 RESULTADO DA QUERY PRODUTO-QUERIES:")
        print(f"   • Preço: €{result['test_price']}")
        print(f"   • Stock: {result['test_stock']} unidades")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    debug_pricing()
