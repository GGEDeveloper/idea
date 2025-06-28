#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏆 VALIDAÇÃO FINAL COMPLETA DO SISTEMA VIP
==========================================
Verificação completa incluindo stock recém-implementado
"""

import psycopg2
from datetime import datetime

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def main():
    print("🏆 VALIDAÇÃO FINAL COMPLETA DO SISTEMA VIP")
    print("=" * 60)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%H:%M:%S')}")
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # 1. VERIFICAÇÃO DO SISTEMA UNIFICADO
        print("\n🌐 SISTEMA UNIFICADO:")
        cur.execute("SELECT COUNT(*) FROM unified_product_catalog")
        total_unificado = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM unified_product_catalog WHERE source_type = 'internal'")
        vip_visivel = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM unified_product_catalog WHERE source_type = 'geko'")
        geko_preservado = cur.fetchone()[0]
        
        print(f"   📊 Total produtos unificados: {total_unificado}")
        print(f"   🎉 Produtos VIP visíveis: {vip_visivel}")
        print(f"   🛡️ Produtos Geko preservados: {geko_preservado}")
        
        # 2. VERIFICAÇÃO DO SISTEMA DE STOCK VIP ✅ NOVO
        print("\n📦 SISTEMA DE STOCK VIP:")
        cur.execute("SELECT COUNT(*) FROM internal_stock")
        stock_vip_total = cur.fetchone()[0]
        
        cur.execute("SELECT SUM(quantity) FROM internal_stock")
        total_unidades = cur.fetchone()[0]
        
        cur.execute("SELECT AVG(quantity) FROM internal_stock")
        media_stock = cur.fetchone()[0]
        
        print(f"   📊 Variantes com stock: {stock_vip_total}")
        print(f"   📦 Total unidades em stock: {total_unidades}")
        print(f"   📈 Média por variante: {media_stock:.1f}")
        
        # Verificar cobertura de stock
        cur.execute("SELECT COUNT(*) FROM internal_variants")
        total_variants = cur.fetchone()[0]
        cobertura_stock = (stock_vip_total / total_variants * 100) if total_variants > 0 else 0
        
        print(f"   🎯 Cobertura de stock: {cobertura_stock:.1f}% ({stock_vip_total}/{total_variants})")
        
        # 3. VERIFICAÇÃO DO SISTEMA DE PREÇOS
        print("\n💰 SISTEMA DE PREÇOS:")
        cur.execute("SELECT COUNT(DISTINCT ip.internal_ean) FROM internal_products ip WHERE ip.base_cost > 0")
        produtos_com_precos = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM internal_pricing")
        total_precos = cur.fetchone()[0]
        
        print(f"   💵 Produtos com preços base: {produtos_com_precos}")
        print(f"   📋 Total preços no sistema: {total_precos}")
        
        # 4. VERIFICAÇÃO DE CATEGORIZAÇÃO
        print("\n🏷️ SISTEMA DE CATEGORIZAÇÃO:")
        cur.execute("""
            SELECT c.name, COUNT(ipc.internal_ean) as produtos
            FROM categories c
            JOIN internal_product_categories ipc ON c.categoryid = ipc.category_id
            GROUP BY c.name
            ORDER BY COUNT(ipc.internal_ean) DESC
        """)
        categorias = cur.fetchall()
        
        for cat_name, count in categorias:
            print(f"   📂 {cat_name}: {count} produtos")
        
        # 5. VERIFICAÇÃO DE COMPATIBILIDADE DE COMPRAS
        print("\n🛒 SISTEMA DE COMPRAS:")
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'order_items' AND column_name = 'product_ean'
        """)
        ean_field = cur.fetchone()
        
        print(f"   🔍 Campo product_ean: {'✅ EXISTE' if ean_field else '❌ NÃO EXISTE'}")
        
        if ean_field:
            cur.execute("SELECT COUNT(*) FROM order_items WHERE product_ean LIKE 'INT_%'")
            pedidos_vip = cur.fetchone()[0]
            print(f"   📊 Pedidos VIP existentes: {pedidos_vip}")
        
        # 6. TESTE DE BUSCA
        print("\n🔍 TESTE DE FUNCIONALIDADES:")
        cur.execute("""
            SELECT COUNT(*) FROM unified_product_catalog 
            WHERE LOWER(display_name_pt) LIKE '%espatula%'
            AND source_type = 'internal'
        """)
        busca_espatulas = cur.fetchone()[0]
        print(f"   🔎 Busca 'espatula': {busca_espatulas} produtos VIP encontrados")
        
        # Testar acesso individual
        cur.execute("""
            SELECT product_ean, display_name_pt 
            FROM unified_product_catalog 
            WHERE source_type = 'internal'
            LIMIT 1
        """)
        exemplo = cur.fetchone()
        if exemplo:
            print(f"   ✅ Acesso individual: {exemplo[0]} - {exemplo[1][:40]}...")
        
        # 7. ANÁLISE DE QUALIDADE
        print("\n🔍 ANÁLISE DE QUALIDADE:")
        
        # Produtos sem stock
        cur.execute("""
            SELECT COUNT(*) FROM internal_variants iv
            LEFT JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id
            WHERE ist.internal_variant_id IS NULL
        """)
        variants_sem_stock = cur.fetchone()[0]
        print(f"   📦 Variantes sem stock: {variants_sem_stock}")
        
        # Produtos sem preços
        cur.execute("SELECT COUNT(*) FROM internal_products WHERE base_cost = 0 OR base_cost IS NULL")
        sem_preco = cur.fetchone()[0]
        print(f"   💰 Produtos sem preço: {sem_preco}")
        
        # Integridade referencial
        cur.execute("""
            SELECT COUNT(*) FROM internal_variants iv
            LEFT JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
            WHERE ip.internal_ean IS NULL
        """)
        variantes_orfas = cur.fetchone()[0]
        print(f"   🔗 Variantes órfãs: {variantes_orfas}")
        
        # 8. AVALIAÇÃO FINAL
        print("\n" + "="*60)
        print("🎯 AVALIAÇÃO FINAL DO SISTEMA VIP")
        print("="*60)
        
        # Critérios de sucesso
        criterios = {
            "Produtos VIP visíveis": vip_visivel >= 400,
            "Sistema Geko preservado": geko_preservado >= 8000,
            "Stock implementado": stock_vip_total >= 900,
            "Cobertura de stock": cobertura_stock >= 95,
            "Produtos com preços": produtos_com_precos >= 380,
            "Categorização completa": len(categorias) >= 4,
            "Compras compatíveis": ean_field is not None,
            "Busca funcional": busca_espatulas > 0,
            "Qualidade alta": variants_sem_stock == 0 and variantes_orfas == 0,
        }
        
        sucessos = sum(1 for v in criterios.values() if v)
        total_criterios = len(criterios)
        percentual_sucesso = (sucessos / total_criterios * 100)
        
        print(f"📊 CRITÉRIOS ATENDIDOS: {sucessos}/{total_criterios} ({percentual_sucesso:.1f}%)")
        
        for criterio, atendido in criterios.items():
            status = "✅" if atendido else "❌"
            print(f"   {status} {criterio}")
        
        # Determinar estado final
        if percentual_sucesso >= 90:
            print(f"\n🎉 SISTEMA VIP COMPLETAMENTE OPERACIONAL!")
            print(f"🏆 Sucesso total: {percentual_sucesso:.1f}%")
            print(f"🚀 PRONTO PARA PRODUÇÃO IMEDIATA")
            print(f"💰 Todas as funcionalidades críticas implementadas")
            print(f"🛡️ Sistema Geko preservado")
            print(f"📦 Stock completo: {total_unidades} unidades")
            print(f"🌐 {total_unificado} produtos visíveis aos clientes")
            status_final = "OPERACIONAL"
        elif percentual_sucesso >= 70:
            print(f"\n✅ SISTEMA VIP FUNCIONAL")
            print(f"📊 Sucesso: {percentual_sucesso:.1f}%")
            print(f"🔧 Algumas melhorias recomendadas")
            status_final = "FUNCIONAL"
        else:
            print(f"\n⚠️ SISTEMA VIP PARCIAL")
            print(f"📊 Sucesso: {percentual_sucesso:.1f}%")
            print(f"🔨 Implementação adicional necessária")
            status_final = "PARCIAL"
        
        # Próximos passos
        print(f"\n🎯 PRÓXIMOS PASSOS RECOMENDADOS:")
        
        if status_final == "OPERACIONAL":
            print("   🚀 DEPLOY PARA PRODUÇÃO")
            print("   📊 Monitorizar vendas VIP")
            print("   🖼️ Implementar upload de imagens (opcional)")
            print("   ⚙️ Dashboard admin VIP (melhoria)")
        else:
            lacunas = [k for k, v in criterios.items() if not v]
            print("   🔧 RESOLVER LACUNAS:")
            for lacuna in lacunas:
                print(f"      - {lacuna}")
        
        print("="*60)
        
        return status_final, percentual_sucesso
        
    except Exception as e:
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return "ERRO", 0
        
    finally:
        conn.close()

if __name__ == "__main__":
    status, percentual = main()
    
    if status == "OPERACIONAL":
        print("\n🎊 PARABÉNS! SISTEMA VIP COMPLETAMENTE OPERACIONAL!")
    elif status == "FUNCIONAL":
        print("\n👍 Sistema VIP funcional, pequenos ajustes recomendados")
    else:
        print("\n🔧 Sistema VIP precisa de mais trabalho") 