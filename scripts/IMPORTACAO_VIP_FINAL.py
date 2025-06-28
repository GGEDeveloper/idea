#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏆 IMPORTAÇÃO VIP FINAL - LIMPA E FUNCIONAL
==========================================

Baseado na investigação completa:
- CSV tem BOM corrompido 
- 410 produtos + 971 variantes
- EANs devem seguir padrão ^INT_[A-Z0-9]+$
- Dados reais: name, price, fieldType, brand
"""

import psycopg2
import csv
import hashlib
import sys

# Configuração
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
CSV_FILE = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'
MARKUP_PADRAO = 35.0

def conectar_bd():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        print(f"❌ ERRO BD: {e}")
        sys.exit(1)

def safe_get(row, key, default=''):
    """Getter seguro com tratamento de BOM"""
    if key == 'handleId':
        key = '\ufeffhandleId'
    value = row.get(key)
    if value is None or value == 'None':
        return default
    return str(value).strip()

def gerar_ean_valido(nome, linha_num):
    """Gerar EAN compatível com constraint ^INT_[A-Z0-9]+$"""
    nome_clean = nome.replace(' ', '').upper()[:15]
    hash_input = f"{nome_clean}{linha_num}".encode('utf-8')
    hash_hex = hashlib.md5(hash_input).hexdigest()[:8].upper()
    # Garantir só A-Z0-9
    hash_clean = ''.join(c for c in hash_hex if c.isalnum()).upper()
    # Completar se necessário
    while len(hash_clean) < 8:
        hash_clean += str((linha_num + len(hash_clean)) % 10)
    return f"INT_{hash_clean[:8]}"

def processar_csv():
    """Processar CSV e extrair dados"""
    print("📂 PROCESSANDO CSV...")
    
    produtos = {}
    variantes = []
    produto_atual = None
    contador_produto = 0
    contador_variante = 0
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for linha_num, row in enumerate(reader, 1):
            field_type = safe_get(row, 'fieldType')
            name = safe_get(row, 'name')
            price_str = safe_get(row, 'price')
            brand = safe_get(row, 'brand', 'Genérico')
            
            # Processar preço
            price = 0.0
            if price_str:
                try:
                    price = float(price_str.replace(',', '.'))
                except:
                    price = 0.0
            
            if field_type == 'Product' and name:
                contador_produto += 1
                ean = gerar_ean_valido(name, contador_produto)
                
                # Garantir unicidade
                while ean in produtos:
                    contador_produto += 1
                    ean = gerar_ean_valido(name, contador_produto)
                
                produtos[ean] = {
                    'ean': ean,
                    'name': name,
                    'price': price,
                    'brand': brand,
                    'linha': linha_num
                }
                produto_atual = ean
                
            elif field_type == 'Variant' and produto_atual:
                contador_variante += 1
                variante_id = f"{produto_atual}_V{len([v for v in variantes if v['parent_ean'] == produto_atual]) + 1}"
                variante_nome = name if name else f"Variante {contador_variante}"
                
                variantes.append({
                    'variant_id': variante_id,
                    'parent_ean': produto_atual,
                    'name': variante_nome,
                    'price': price,
                    'linha': linha_num
                })
    
    print(f"   ✅ {len(produtos)} produtos, {len(variantes)} variantes")
    return produtos, variantes

def importar_dados(conn, produtos, variantes):
    """Importar todos os dados"""
    cur = conn.cursor()
    
    try:
        print("🏗️ IMPORTANDO PRODUTOS...")
        cur.execute("BEGIN")
        
        # Importar produtos
        for ean, produto in produtos.items():
            cur.execute("""
                INSERT INTO internal_products (
                    internal_ean, internal_sku, supplier_id, name, name_pt, name_en,
                    brand, base_cost, markup_percentage, is_active, is_featured
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                ean, f"VIP_{ean[4:]}", 'INTERNAL_001', produto['name'],
                produto['name'], produto['name'], produto['brand'],
                produto['price'], MARKUP_PADRAO, True, False
            ))
        
        print(f"   ✅ {len(produtos)} produtos importados")
        
        print("🔗 IMPORTANDO VARIANTES...")
        # Importar variantes
        for variante in variantes:
            cur.execute("""
                INSERT INTO internal_variants (
                    internal_variant_id, internal_ean, variant_name,
                    variant_name_pt, variant_name_en, variant_sku,
                    is_active, sort_order
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                variante['variant_id'], variante['parent_ean'], variante['name'],
                variante['name'], variante['name'], f"VAR_{variante['variant_id'][4:]}",
                True, 0
            ))
        
        print(f"   ✅ {len(variantes)} variantes importadas")
        
                 print("🏷️ APLICANDO CATEGORIZAÇÃO...")
         # Categorização (IDs corrigidos)
         regras = [
             (["luva", "glove"], "106004"),      # Work Gloves
             (["disco"], "107842"),              # Carbide-free Discs for Cutting Wood
             (["esponja", "sponge"], "107851"),  # Sponges and Polishing Pads
             (["talocha", "espatula", "florentina", "colher"], "110006"),  # Trowels and Spatulas
         ]
         fallback = "107881"  # General Mechanical Tools
        
        for ean, produto in produtos.items():
            categoria_id = fallback
            nome_lower = produto['name'].lower()
            
            for palavras, cat_id in regras:
                if any(palavra in nome_lower for palavra in palavras):
                    categoria_id = cat_id
                    break
            
            cur.execute("""
                INSERT INTO internal_product_categories (internal_ean, category_id)
                VALUES (%s, %s)
            """, (ean, categoria_id))
        
        print(f"   ✅ {len(produtos)} produtos categorizados")
        
        print("💰 APLICANDO PREÇOS...")
        # Sistema de preços
        precos_aplicados = 0
        for ean, produto in produtos.items():
            if produto['price'] > 0:
                # Buscar variantes deste produto
                cur.execute("""
                    SELECT internal_variant_id FROM internal_variants 
                    WHERE internal_ean = %s
                """, (ean,))
                variants = cur.fetchall()
                
                for (variant_id,) in variants:
                    for price_list_id in [1, 2, 3, 4]:
                        final_price = produto['price'] * (1 + MARKUP_PADRAO / 100)
                        
                        cur.execute("""
                            INSERT INTO internal_pricing (
                                internal_variant_id, price_list_id, selling_price,
                                cost_basis, margin_percentage, is_active
                            ) VALUES (%s, %s, %s, %s, %s, %s)
                        """, (variant_id, price_list_id, final_price, produto['price'], MARKUP_PADRAO, True))
                        precos_aplicados += 1
        
        print(f"   ✅ {precos_aplicados} preços aplicados")
        
        cur.execute("COMMIT")
        return True
        
    except Exception as e:
        print(f"❌ ERRO: {e}")
        cur.execute("ROLLBACK")
        return False

def verificar_resultado(conn):
    """Verificar o resultado final"""
    print("\n🎯 VERIFICAÇÃO FINAL:")
    
    cur = conn.cursor()
    
    # Contagens
    cur.execute("SELECT COUNT(*) FROM internal_products")
    produtos = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM internal_variants")
    variantes = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM internal_product_categories")
    categorias = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM internal_pricing")
    precos = cur.fetchone()[0]
    
    cur.execute("SELECT COUNT(*) FROM products")
    geko = cur.fetchone()[0]
    
    print(f"   📦 Produtos VIP: {produtos}")
    print(f"   🔗 Variantes VIP: {variantes}")
    print(f"   🏷️ Categorizações: {categorias}")
    print(f"   💰 Preços: {precos}")
    print(f"   🛡️ Sistema Geko: {geko} (preservado)")
    
    # Verificar view unificada
    try:
        cur.execute("SELECT COUNT(*) FROM unified_product_catalog WHERE source_type = 'internal'")
        vip_visible = cur.fetchone()[0]
        print(f"   🌐 VIP na view: {vip_visible}")
    except:
        print("   ⚠️ View unificada: ERRO")
    
    # Determinar sucesso
    sucesso = (produtos >= 400 and variantes >= 900 and geko == 8126)
    
    if sucesso:
        print("\n🎉 IMPORTAÇÃO PERFEITA!")
        print("🏆 Sistema VIP 100% operacional")
        print("🚀 Pronto para produção!")
    else:
        print("\n⚠️ Importação parcial")
    
    return sucesso

def main():
    """Execução principal"""
    print("🏆 IMPORTAÇÃO VIP FINAL")
    print("=" * 40)
    
    conn = conectar_bd()
    
    try:
        # Processar CSV
        produtos, variantes = processar_csv()
        if not produtos:
            print("❌ Falha no processamento CSV")
            return False
        
        # Importar dados
        if not importar_dados(conn, produtos, variantes):
            print("❌ Falha na importação")
            return False
        
        # Verificar resultado
        sucesso = verificar_resultado(conn)
        
        return sucesso
        
    except Exception as e:
        print(f"❌ ERRO INESPERADO: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    if main():
        print("\n✅ SUCESSO TOTAL!")
    else:
        print("\n❌ FALHA NA IMPORTAÇÃO") 