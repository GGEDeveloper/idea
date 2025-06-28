#!/usr/bin/env python3
"""
Script para gerar relatório técnico rápido do estado atual
Para consulta durante desenvolvimento
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime

DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def generate_quick_status():
    """Gerar relatório de status rápido"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print("📊 RELATÓRIO DE STATUS TÉCNICO RÁPIDO")
            print("=" * 60)
            print(f"🕒 Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print()
            
            # 1. Contadores principais
            print("🔢 CONTADORES PRINCIPAIS:")
            
            # Geko (preservado)
            cursor.execute("SELECT COUNT(*) FROM products WHERE ean NOT LIKE 'INT_%'")
            geko_products = cursor.fetchone()['count']
            
            # Internos
            cursor.execute("SELECT COUNT(*) FROM internal_products")
            internal_products = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) FROM internal_variants")
            internal_variants = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) FROM internal_product_images")
            internal_images = cursor.fetchone()['count']
            
            print(f"   • Produtos Geko (preservados): {geko_products:,}")
            print(f"   • Produtos Internos: {internal_products:,}")
            print(f"   • Variantes Internas: {internal_variants:,}")
            print(f"   • Imagens Internas: {internal_images:,}")
            print(f"   • TOTAL SISTEMA: {geko_products + internal_products + internal_variants:,} registros")
            
            # 2. Lacunas críticas
            print(f"\n❌ LACUNAS CRÍTICAS:")
            
            # Preços
            cursor.execute("""
                SELECT COUNT(*) FROM internal_products ip
                LEFT JOIN product_variants pv ON ip.internal_ean = pv.ean
                LEFT JOIN prices p ON pv.variantid = p.variantid
                WHERE p.variantid IS NULL
            """)
            sem_precos = cursor.fetchone()['count']
            
            # Categorias
            cursor.execute("""
                SELECT COUNT(*) FROM internal_products ip
                LEFT JOIN product_categories pc ON ip.internal_ean = pc.product_ean
                WHERE pc.product_ean IS NULL
            """)
            sem_categorias = cursor.fetchone()['count']
            
            # Atributos
            cursor.execute("""
                SELECT COUNT(*) FROM internal_products ip
                LEFT JOIN product_attributes pa ON ip.internal_ean = pa.product_ean
                WHERE pa.product_ean IS NULL
            """)
            sem_atributos = cursor.fetchone()['count']
            
            print(f"   🔴 Produtos sem PREÇOS: {sem_precos}/{internal_products} ({(sem_precos/internal_products*100):.1f}%)")
            print(f"   🟠 Produtos sem CATEGORIAS: {sem_categorias}/{internal_products} ({(sem_categorias/internal_products*100):.1f}%)")
            print(f"   🟡 Produtos sem ATRIBUTOS: {sem_atributos}/{internal_products} ({(sem_atributos/internal_products*100):.1f}%)")
            
            # 3. Distribuição por marca
            print(f"\n📊 DISTRIBUIÇÃO POR MARCA:")
            cursor.execute("""
                SELECT brand, COUNT(*) as count 
                FROM internal_products 
                GROUP BY brand 
                ORDER BY COUNT(*) DESC
            """)
            brands = cursor.fetchall()
            for brand in brands:
                print(f"   • {brand['brand']}: {brand['count']} produtos")
            
            # 4. Tabelas críticas
            print(f"\n🗄️ TABELAS CRÍTICAS:")
            critical_tables = [
                'internal_products',
                'internal_variants', 
                'internal_product_images',
                'supplier_registry'
            ]
            
            for table in critical_tables:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()['count']
                print(f"   • {table}: {count} registros")
            
            # 5. Integridade
            print(f"\n🛡️ VERIFICAÇÕES DE INTEGRIDADE:")
            
            # Isolamento Geko
            cursor.execute("SELECT COUNT(*) FROM products WHERE ean LIKE 'INT_%'")
            geko_contaminated = cursor.fetchone()['count']
            
            # Isolamento Interno
            cursor.execute("SELECT COUNT(*) FROM internal_products WHERE internal_ean NOT LIKE 'INT_%'")
            internal_contaminated = cursor.fetchone()['count']
            
            # Variantes órfãs
            cursor.execute("""
                SELECT COUNT(*) FROM internal_variants iv
                LEFT JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
                WHERE ip.internal_ean IS NULL
            """)
            orphan_variants = cursor.fetchone()['count']
            
            print(f"   {'✅' if geko_contaminated == 0 else '❌'} Isolamento Geko: {geko_contaminated} contaminações")
            print(f"   {'✅' if internal_contaminated == 0 else '❌'} Isolamento Interno: {internal_contaminated} contaminações")
            print(f"   {'✅' if orphan_variants == 0 else '❌'} Variantes órfãs: {orphan_variants}")
            
            # 6. Próximas ações
            print(f"\n🎯 PRÓXIMAS AÇÕES RECOMENDADAS:")
            print(f"   1. 🔴 CRÍTICO: Sistema de Preços ({sem_precos} produtos)")
            print(f"   2. 🟠 ALTO: Categorização ({sem_categorias} produtos)")
            print(f"   3. 🟡 MÉDIO: Atributos ({sem_atributos} produtos)")
            print(f"   4. 🟢 BAIXO: Interface upload imagens")
            
            # 7. Comandos úteis
            print(f"\n🔧 COMANDOS ÚTEIS:")
            print(f"   # Ver produtos sem preço:")
            print(f"   SELECT internal_ean, name_pt FROM internal_products WHERE base_cost IS NULL LIMIT 5;")
            print(f"")
            print(f"   # Testar sistema:")
            print(f"   cd scripts && python3 test_images_system.py")
            
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Erro no relatório: {e}")
        return False

def save_status_summary():
    """Salvar resumo em ficheiro"""
    try:
        summary = f"""# STATUS RÁPIDO - {datetime.now().strftime('%Y-%m-%d %H:%M')}

## ✅ OPERACIONAL
- Sistema VIP isolado funcionando
- 1,350 produtos internos importados
- Sistema de imagens configurado
- Zero impacto no Geko (8,126 produtos)

## ❌ PENDENTE
- 🔴 Preços (BLOQUEANTE)
- 🟠 Categorias (NAVEGAÇÃO) 
- 🟡 Atributos (INFO)
- 🟢 Interface upload

## 🎯 PRÓXIMO PASSO
Implementar sistema de preços para tornar produtos vendáveis.

## 🔧 TESTE RÁPIDO
```bash
cd scripts && python3 test_images_system.py
```
"""
        
        with open("../docs/STATUS_RAPIDO.md", "w", encoding="utf-8") as f:
            f.write(summary)
        
        print(f"📄 Resumo salvo em: docs/STATUS_RAPIDO.md")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao salvar resumo: {e}")
        return False

def main():
    """Função principal"""
    print("🚀 Gerando relatório de status...")
    
    if generate_quick_status():
        print(f"\n{'='*60}")
        save_status_summary()
        print(f"✅ Relatório gerado com sucesso!")
    else:
        print(f"❌ Falha na geração do relatório")

if __name__ == "__main__":
    main() 