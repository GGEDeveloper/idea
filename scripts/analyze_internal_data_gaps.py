#!/usr/bin/env python3
"""
Script para analisar lacunas nos dados dos produtos internos
Compara com estrutura Geko e identifica o que está faltando
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def analyze_data_gaps():
    """Analisar lacunas nos dados dos produtos internos"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print("🔍 ANÁLISE DE LACUNAS NOS DADOS INTERNOS")
            print("=" * 80)
            
            # 1. Verificar campos vazios em produtos internos
            print("\n📊 CAMPOS VAZIOS EM PRODUTOS INTERNOS:")
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_produtos,
                    COUNT(internal_sku) as com_sku,
                    COUNT(short_description) as com_desc_curta,
                    COUNT(short_description_pt) as com_desc_pt,
                    COUNT(short_description_en) as com_desc_en,
                    COUNT(base_cost) as com_preco_base,
                    COUNT(markup_percentage) as com_markup,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as ativos,
                    COUNT(CASE WHEN is_featured = true THEN 1 END) as destacados
                FROM internal_products
            """)
            
            data = cursor.fetchone()
            total = data['total_produtos']
            
            print(f"   • Total de produtos: {total}")
            print(f"   • Com SKU: {data['com_sku']} ({(data['com_sku']/total*100):.1f}%)")
            print(f"   • Com descrição curta: {data['com_desc_curta']} ({(data['com_desc_curta']/total*100) if data['com_desc_curta'] else 0:.1f}%)")
            print(f"   • Com descrição PT: {data['com_desc_pt']} ({(data['com_desc_pt']/total*100) if data['com_desc_pt'] else 0:.1f}%)")
            print(f"   • Com descrição EN: {data['com_desc_en']} ({(data['com_desc_en']/total*100) if data['com_desc_en'] else 0:.1f}%)")
            print(f"   • Com preço base: {data['com_preco_base']} ({(data['com_preco_base']/total*100) if data['com_preco_base'] else 0:.1f}%)")
            print(f"   • Com markup: {data['com_markup']} ({(data['com_markup']/total*100) if data['com_markup'] else 0:.1f}%)")
            print(f"   • Ativos: {data['ativos']} ({(data['ativos']/total*100) if data['ativos'] else 0:.1f}%)")
            print(f"   • Destacados: {data['destacados']} ({(data['destacados']/total*100) if data['destacados'] else 0:.1f}%)")
            
            # 2. Verificar como funcionam as imagens no sistema Geko
            print("\n🖼️ SISTEMA DE IMAGENS GEKO (para comparação):")
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_produtos_geko,
                    COUNT(DISTINCT pi.ean) as produtos_com_imagens,
                    COUNT(*) as total_imagens,
                    COUNT(CASE WHEN pi.is_primary = true THEN 1 END) as imagens_primarias
                FROM product_images pi
                WHERE pi.ean IN (SELECT ean FROM products WHERE ean NOT LIKE 'INT_%')
            """)
            
            img_data = cursor.fetchone()
            print(f"   • Produtos Geko com imagens: {img_data['produtos_com_imagens']}")
            print(f"   • Total de imagens Geko: {img_data['total_imagens']}")
            print(f"   • Imagens primárias: {img_data['imagens_primarias']}")
            
            # 3. Verificar exemplo de URLs de imagem Geko
            print("\n🔗 EXEMPLOS DE URLs DE IMAGEM GEKO:")
            cursor.execute("""
                SELECT url, alt, is_primary 
                FROM product_images 
                WHERE ean NOT LIKE 'INT_%'
                LIMIT 3
            """)
            
            examples = cursor.fetchall()
            for i, ex in enumerate(examples, 1):
                primary = "🏆 PRIMÁRIA" if ex['is_primary'] else "📸 Secundária"
                print(f"   {i}. {primary}")
                print(f"      URL: {ex['url']}")
                print(f"      Alt: {ex['alt']}")
            
            # 4. Verificar se existe tabela de imagens para produtos internos
            print("\n📋 VERIFICAÇÃO DE SISTEMA DE IMAGENS INTERNO:")
            cursor.execute("""
                SELECT COUNT(*) as imagens_internas
                FROM product_images 
                WHERE ean LIKE 'INT_%'
            """)
            
            internal_imgs = cursor.fetchone()['imagens_internas']
            print(f"   • Imagens de produtos internos: {internal_imgs}")
            
            if internal_imgs == 0:
                print("   ⚠️ NENHUMA IMAGEM ENCONTRADA PARA PRODUTOS INTERNOS!")
            
            # 5. Verificar outras tabelas relacionadas que podem estar faltando
            print("\n🔗 DADOS RELACIONADOS FALTANTES:")
            
            # Atributos
            cursor.execute("""
                SELECT COUNT(*) as attrs_internos
                FROM product_attributes 
                WHERE product_ean LIKE 'INT_%'
            """)
            attrs = cursor.fetchone()['attrs_internos']
            print(f"   • Atributos de produtos internos: {attrs}")
            
            # Categorias
            cursor.execute("""
                SELECT COUNT(*) as cats_internas
                FROM product_categories 
                WHERE product_ean LIKE 'INT_%'
            """)
            cats = cursor.fetchone()['cats_internas']
            print(f"   • Categorias de produtos internos: {cats}")
            
            # Preços
            cursor.execute("""
                SELECT COUNT(*) as precos_internos
                FROM prices p
                JOIN product_variants pv ON p.variantid = pv.variantid
                WHERE pv.ean LIKE 'INT_%'
            """)
            prices = cursor.fetchone()['precos_internos']
            print(f"   • Preços de produtos internos: {prices}")
            
            # Stock
            cursor.execute("""
                SELECT COUNT(*) as stock_interno
                FROM stock_levels sl
                WHERE sl.geko_variant_stock_id LIKE 'INT_%'
            """)
            stock = cursor.fetchone()['stock_interno']
            print(f"   • Stock de produtos internos: {stock}")
            
            # 6. Resumo das lacunas críticas
            print("\n❌ LACUNAS CRÍTICAS IDENTIFICADAS:")
            lacunas = []
            
            if internal_imgs == 0:
                lacunas.append("🖼️ Sistema de imagens para produtos internos")
            if attrs == 0:
                lacunas.append("🏷️ Atributos de produtos (características técnicas)")
            if cats == 0:
                lacunas.append("🗂️ Categorização de produtos internos")
            if prices == 0:
                lacunas.append("💰 Sistema de preços para clientes")
            if stock == 0:
                lacunas.append("📦 Controlo de stock")
            if data['com_desc_curta'] == 0:
                lacunas.append("📝 Descrições de produtos")
            if data['com_markup'] == 0:
                lacunas.append("💸 Configuração de markup")
            
            for i, lacuna in enumerate(lacunas, 1):
                print(f"   {i}. {lacuna}")
            
            if not lacunas:
                print("   ✅ Nenhuma lacuna crítica encontrada!")
            
            print("\n" + "=" * 80)
            print("🎯 PRIORIDADES PARA COMPLETAR O SISTEMA:")
            print("   1. 🖼️ CRÍTICO: Sistema de imagens locais")
            print("   2. 🗂️ IMPORTANTE: Mapeamento de categorias") 
            print("   3. 💰 IMPORTANTE: Sistema de preços")
            print("   4. 📦 MÉDIO: Controlo de stock")
            print("   5. 📝 BAIXO: Descrições detalhadas")
            
        conn.close()
        
    except Exception as e:
        logger.error(f"Erro na análise: {e}")

if __name__ == "__main__":
    analyze_data_gaps() 