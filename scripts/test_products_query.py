#!/usr/bin/env python3
"""
Testar se as queries de produtos modificadas funcionam
"""

import sys
import os
sys.path.append('/home/pixie/idea')

# Simular Node.js query para testar
import psycopg2

db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def test_products_query():
    print("🔍 TESTANDO QUERIES DE PRODUTOS MODIFICADAS")
    print("=" * 60)
    
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # 1. Testar query similar à getProducts
        print("📋 Teste 1: Query básica de produtos")
        cur.execute("""
            SELECT 
              p.product_ean as ean, 
              p.display_name_pt as name, 
              p.brand, 
              p.is_active as active, 
              p.display_shortdesc_pt as shortdescription, 
              p.is_featured, 
              p.source_type
            FROM unified_product_catalog p
            WHERE p.is_active = true
            ORDER BY p.display_name_pt ASC
            LIMIT 10;
        """)
        
        products = cur.fetchall()
        print(f"✅ Encontrados {len(products)} produtos")
        
        geko_count = sum(1 for p in products if p[6] == 'geko')
        vip_count = sum(1 for p in products if p[6] == 'internal')
        
        print(f"  • Produtos Geko: {geko_count}")
        print(f"  • Produtos VIP: {vip_count}")
        
        # 2. Mostrar exemplos de cada tipo
        print(f"\n🏷️ EXEMPLOS PRODUTOS VIP:")
        for p in products:
            if p[6] == 'internal':
                print(f"  • {p[0]}: {p[1]} ({p[2]})")
                
        print(f"\n🔧 EXEMPLOS PRODUTOS GEKO:")
        for p in products[:3]:
            if p[6] == 'geko':
                print(f"  • {p[0]}: {p[1]} ({p[2]})")
        
        # 3. Testar contagem
        print(f"\n📊 Teste 2: Contagem total")
        cur.execute("""
            SELECT COUNT(DISTINCT p.product_ean) 
            FROM unified_product_catalog p
            WHERE p.is_active = true;
        """)
        
        total = cur.fetchone()[0]
        print(f"✅ Total produtos ativos: {total:,}")
        
        # 4. Testar filtro por marca
        print(f"\n🔍 Teste 3: Filtro por marca")
        cur.execute("""
            SELECT p.source_type, COUNT(*) 
            FROM unified_product_catalog p
            WHERE p.brand = 'Genérico' AND p.is_active = true
            GROUP BY p.source_type;
        """)
        
        brand_results = cur.fetchall()
        print(f"✅ Produtos 'Genérico' por tipo:")
        for source, count in brand_results:
            print(f"  • {source}: {count:,}")
        
        print(f"\n✅ TODAS AS QUERIES FUNCIONARAM!")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    test_products_query() 