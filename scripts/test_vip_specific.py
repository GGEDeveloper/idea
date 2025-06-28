#!/usr/bin/env python3
"""
Testar busca específica de produtos VIP
"""

import psycopg2

db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    print("🔍 BUSCA ESPECÍFICA PRODUTOS VIP")
    print("=" * 50)
    
    # Buscar produtos VIP especificamente
    cur.execute("""
        SELECT 
          p.product_ean as ean, 
          p.display_name_pt as name, 
          p.brand, 
          p.source_type
        FROM unified_product_catalog p
        WHERE p.source_type = 'internal'
        ORDER BY p.display_name_pt ASC
        LIMIT 10;
    """)
    
    vip_products = cur.fetchall()
    print(f"✅ Produtos VIP encontrados: {len(vip_products)}")
    
    for ean, name, brand, source in vip_products:
        print(f"  • {ean}: {name} ({brand})")
    
    # Testar busca por marca específica VIP
    cur.execute("""
        SELECT COUNT(*) 
        FROM unified_product_catalog p
        WHERE p.source_type = 'internal' 
        AND p.brand = 'FERMAN';
    """)
    
    ferman_count = cur.fetchone()[0]
    print(f"\n🛡️ Produtos FERMAN VIP: {ferman_count}")
    
    # Testar busca textual
    cur.execute("""
        SELECT product_ean, display_name_pt, brand
        FROM unified_product_catalog p
        WHERE p.source_type = 'internal' 
        AND p.display_name_pt ILIKE '%espatula%'
        LIMIT 5;
    """)
    
    espatula_products = cur.fetchall()
    print(f"\n🏗️ Produtos VIP com 'espatula': {len(espatula_products)}")
    for ean, name, brand in espatula_products:
        print(f"  • {ean}: {name}")

except Exception as e:
    print(f"❌ Erro: {e}")
finally:
    if 'conn' in locals():
        conn.close()
