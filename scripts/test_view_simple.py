#!/usr/bin/env python3
"""
Teste simples da view unified_product_catalog
"""

import psycopg2

# Conectar
db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("🔍 TESTANDO VIEW UNIFIED_PRODUCT_CATALOG")
    print("=" * 50)
    
    # Testar se view existe e funciona
    cur.execute("""
        SELECT 
            source_type,
            COUNT(*) as total
        FROM unified_product_catalog
        GROUP BY source_type
        ORDER BY total DESC;
    """)
    
    results = cur.fetchall()
    print("📊 ESTATÍSTICAS POR TIPO:")
    total = 0
    for row in results:
        source_type, count = row
        print(f"  • {source_type}: {count:,} produtos")
        total += count
        
    print(f"\n🎯 TOTAL UNIFICADO: {total:,} produtos")
    
    # Testar exemplos VIP
    cur.execute("""
        SELECT product_ean, display_name_pt, brand
        FROM unified_product_catalog
        WHERE source_type = 'internal'
        LIMIT 3;
    """)
    
    vip_products = cur.fetchall()
    print(f"\n🏷️ EXEMPLOS PRODUTOS VIP ({len(vip_products)}):")
    for ean, name, brand in vip_products:
        print(f"  • {ean}: {name} ({brand})")
        
    print("\n✅ VIEW UNIFIED_PRODUCT_CATALOG FUNCIONANDO!")
    
except Exception as e:
    print(f"❌ Erro: {e}")
    import traceback
    traceback.print_exc()
finally:
    if 'conn' in locals():
        conn.close()
