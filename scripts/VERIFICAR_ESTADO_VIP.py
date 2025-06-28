#!/usr/bin/env python3
"""
Verificar estado atual do sistema VIP
"""

import psycopg2

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def verificar_estado():
    """Verificar estado atual das tabelas VIP"""
    print("🔍 VERIFICAÇÃO ESTADO SISTEMA VIP")
    print("=" * 40)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Verificar tabelas VIP
        tabelas = [
            ('internal_products', 'Produtos VIP'),
            ('internal_variants', 'Variantes VIP'),
            ('internal_product_categories', 'Categorizações'),
            ('internal_pricing', 'Preços'),
            ('internal_product_attributes', 'Atributos'),
            ('internal_product_images', 'Imagens')
        ]
        
        for tabela, desc in tabelas:
            cur.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cur.fetchone()[0]
            status = "✅" if count > 0 else "❌"
            print(f"   {status} {desc}: {count}")
        
        # Verificar Sistema Geko
        cur.execute("SELECT COUNT(*) FROM products")
        geko_count = cur.fetchone()[0]
        print(f"   🛡️ Sistema Geko: {geko_count} (preservado)")
        
        # Verificar view unificada
        try:
            cur.execute("SELECT COUNT(*) FROM unified_product_catalog WHERE source_type = 'internal'")
            vip_visible = cur.fetchone()[0]
            print(f"   🌐 VIP visíveis na view: {vip_visible}")
        except:
            print("   ⚠️ View unificada: ERRO")
        
        # Alguns detalhes extras
        if count > 0:
            print("\n📊 DETALHES:")
            
            # Produtos com preço
            cur.execute("SELECT COUNT(*) FROM internal_products WHERE base_cost > 0")
            com_preco = cur.fetchone()[0]
            print(f"   💰 Produtos com preço: {com_preco}")
            
            # Distribuição de marcas
            cur.execute("SELECT brand, COUNT(*) FROM internal_products GROUP BY brand ORDER BY COUNT(*) DESC LIMIT 3")
            marcas = cur.fetchall()
            print("   🏭 Top marcas:")
            for marca, count in marcas:
                print(f"      {marca or 'SEM MARCA'}: {count}")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ ERRO: {e}")

if __name__ == "__main__":
    verificar_estado() 