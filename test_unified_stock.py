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

def test_stock_integration():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("🔍 TESTANDO INTEGRAÇÃO DE STOCK VIP")
    print("=" * 60)
    
    # Verificar se unified_product_catalog inclui produtos VIP
    cursor.execute("""
        SELECT source_type, COUNT(*) 
        FROM unified_product_catalog 
        GROUP BY source_type;
    """)
    
    catalog_stats = cursor.fetchall()
    print("📊 Produtos na unified_product_catalog:")
    for stat in catalog_stats:
        print(f"   • {stat['source_type']}: {stat['count']} produtos")
    
    # Testar alguns produtos VIP específicos
    cursor.execute("""
        SELECT 
            product_ean, 
            display_name_pt, 
            brand, 
            source_type
        FROM unified_product_catalog 
        WHERE source_type = 'internal'
        LIMIT 5;
    """)
    
    vip_products = cursor.fetchall()
    print(f"\n📋 Amostra de produtos VIP (primeiros 5):")
    for product in vip_products:
        print(f"   • {product['product_ean']} - {product['display_name_pt'][:30]} ({product['brand']})")
    
    # Verificar stock VIP
    if vip_products:
        test_ean = vip_products[0]['product_ean']
        cursor.execute("""
            SELECT 
                iv.internal_ean,
                iv.variant_name,
                ist.quantity,
                ist.minimum_stock,
                ist.reorder_point
            FROM internal_variants iv
            JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id
            WHERE iv.internal_ean = %s
            LIMIT 3;
        """, (test_ean,))
        
        stock_data = cursor.fetchall()
        print(f"\n🏭 Stock do produto {test_ean}:")
        for stock in stock_data:
            print(f"   • {stock['variant_name']}: {stock['quantity']} unidades (min: {stock['minimum_stock']})")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    test_stock_integration()
