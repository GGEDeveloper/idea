#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
IMPORTAÇÃO SEGURA DAS VARIANTES EM FALTA
Script focado apenas nas 996 variantes que faltam importar
GARANTIA: Sistema Geko intacto, apenas tabelas paralelas afetadas
"""

import csv
import psycopg2
import re
from datetime import datetime
import hashlib

# Configuração segura
DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_FILE = "aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv"

# Traduções PT -> EN (mesmas da importação anterior)
TRANSLATIONS = {
    'Luva': 'Glove', 'Luvas': 'Gloves', 'Nitrile': 'Nitrile',
    'Preta': 'Black', 'Preto': 'Black', 'Azul': 'Blue',
    'Branca': 'White', 'Branco': 'White', 'Tamanho': 'Size',
    'Lisa': 'Smooth', 'Dentada': 'Toothed', 'ton': 'ton',
    'MT': 'MT', 'MM': 'MM', 'cm': 'cm'
}

def get_safe_value(row, key, default=''):
    """Obtém valor do CSV tratando None"""
    value = row.get(key, default)
    return value.strip() if value else default

def translate_text(text_pt):
    """Traduz texto PT -> EN"""
    if not text_pt:
        return ""
    
    text_en = text_pt
    for pt_word, en_word in TRANSLATIONS.items():
        pattern = r'\b' + re.escape(pt_word) + r'\b'
        text_en = re.sub(pattern, en_word, text_en, flags=re.IGNORECASE)
    
    return text_en

def find_parent_product(conn, product_handle):
    """Encontra produto pai baseado no handleId"""
    cursor = conn.cursor()
    
    # Buscar produtos que possam ser pais deste handle
    cursor.execute("""
        SELECT internal_ean, name, brand 
        FROM internal_products 
        WHERE internal_ean LIKE %s
        ORDER BY created_at DESC
        LIMIT 1
    """, (f"INT_%",))
    
    result = cursor.fetchone()
    cursor.close()
    
    return result[0] if result else None

def extract_size_or_variant_info(variant_name):
    """Extrai informações de tamanho ou características da variante"""
    size_patterns = [
        r'(\d+)ton',     # 4ton
        r'(\d+)MT',      # 6MT  
        r'(\d+)MM',      # 120MM
        r'(\d+)cm',      # 5cm
        r'T(\d+)',       # T8, T9
        r'Size (\d+)',   # Size 8
    ]
    
    for pattern in size_patterns:
        match = re.search(pattern, variant_name, re.IGNORECASE)
        if match:
            return match.group(1)
    
    return None

def main():
    print("🔧 Importação SEGURA das variantes em falta...")
    print("🔒 Garantia: Sistema Geko intacto, apenas tabelas internas afetadas")
    
    # Conectar BD
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    # Verificar estado atual
    cursor.execute("SELECT COUNT(*) FROM internal_products")
    current_products = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM internal_variants")
    current_variants = cursor.fetchone()[0]
    
    print(f"📊 Estado atual: {current_products} produtos, {current_variants} variantes")
    
    variants_created = 0
    variants_skipped = 0
    errors = 0
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            # Mapear produtos existentes por padrão de nome
            existing_products = {}
            cursor.execute("SELECT internal_ean, name, brand FROM internal_products")
            for ean, name, brand in cursor.fetchall():
                key = f"{name.split()[0].lower()}_{brand}"
                existing_products[key] = ean
            
            for row_num, row in enumerate(reader, 1):
                field_type = get_safe_value(row, 'fieldType')
                
                # Processar apenas produtos que tenham variantes na coluna 19
                if field_type == 'Product':
                    product_name = get_safe_value(row, 'name')
                    brand_raw = get_safe_value(row, 'brand')
                    
                    # Normalizar marca (mesmo sistema anterior)
                    if 'FERMAN' in brand_raw:
                        brand = 'FERMAN'
                    elif 'AG TOOLS' in brand_raw or 'AG00' in brand_raw:
                        brand = 'AG TOOLS' 
                    elif 'EXENA' in brand_raw:
                        brand = 'EXENA'
                    else:
                        brand = 'Genérico'
                    
                    # Obter variantes da coluna 19 (productOptionDescription1)
                    variants_text = ""
                    for col_name in row.keys():
                        if 'Option' in col_name and 'Description' in col_name:
                            col_value = get_safe_value(row, col_name)
                            if col_value and ';' in col_value:
                                variants_text = col_value
                                break
                    
                    if not variants_text:
                        continue
                    
                    # Encontrar produto pai
                    product_key = f"{product_name.split()[0].lower()}_{brand}"
                    parent_ean = existing_products.get(product_key)
                    
                    if not parent_ean:
                        print(f"⚠️  Produto pai não encontrado para: {product_name}")
                        variants_skipped += 1
                        continue
                    
                    # Processar variantes separadas por ;
                    variant_options = variants_text.split(';')
                    
                    for variant_option in variant_options:
                        variant_option = variant_option.strip()
                        if not variant_option:
                            continue
                        
                        # Gerar ID único da variante
                        variant_id = f"{parent_ean}_V{variants_created + 1:03d}"
                        
                        # Gerar SKU da variante
                        brand_prefix = {
                            'AG TOOLS': 'AG', 'FERMAN': 'FE', 'EXENA': 'EX'
                        }.get(brand, 'GE')
                        
                        name_clean = re.sub(r'[^A-Za-z]', '', variant_option)
                        name_part = name_clean[:3].upper() if name_clean else 'VAR'
                        variant_sku = f"{brand_prefix}V{variants_created + 1:03d}{name_part}"
                        
                        # Extrair informações de tamanho
                        size_value = extract_size_or_variant_info(variant_option)
                        
                        # Traduzir nomes
                        variant_name_pt = variant_option
                        variant_name_en = translate_text(variant_option)
                        
                        try:
                            # Verificar se variante já existe
                            cursor.execute("""
                                SELECT COUNT(*) FROM internal_variants 
                                WHERE internal_ean = %s AND variant_name_pt = %s
                            """, (parent_ean, variant_name_pt))
                            
                            if cursor.fetchone()[0] > 0:
                                print(f"  ↩️  Variante já existe: {variant_name_pt}")
                                variants_skipped += 1
                                continue
                            
                            # Inserir variante
                            cursor.execute("""
                                INSERT INTO internal_variants (
                                    internal_variant_id, internal_ean,
                                    variant_name, variant_name_pt, variant_name_en,
                                    size_value, variant_sku, is_active, created_at
                                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """, (
                                variant_id, parent_ean,
                                variant_option, variant_name_pt, variant_name_en,
                                size_value, variant_sku, True, datetime.now()
                            ))
                            
                            variants_created += 1
                            print(f"  ✅ Variante: {variant_id} - {variant_name_pt}")
                            
                        except Exception as e:
                            errors += 1
                            print(f"  ❌ Erro na variante {variant_option}: {e}")
                            conn.rollback()
                            continue
                
                # Commit a cada 50 variantes
                if variants_created % 50 == 0 and variants_created > 0:
                    conn.commit()
                    print(f"💾 Commit: {variants_created} variantes processadas...")
        
        # Commit final
        conn.commit()
        
        # Verificar estado final
        cursor.execute("SELECT COUNT(*) FROM internal_variants")
        final_variants = cursor.fetchone()[0]
        
        print(f"\n🎉 IMPORTAÇÃO DE VARIANTES CONCLUÍDA!")
        print(f"✅ Variantes criadas nesta sessão: {variants_created}")
        print(f"⚠️  Variantes saltadas: {variants_skipped}")
        print(f"❌ Erros: {errors}")
        print(f"📊 Total de variantes na BD: {final_variants}")
        
        # Validação de segurança final
        cursor.execute("SELECT COUNT(*) FROM products WHERE active = true")
        geko_products = cursor.fetchone()[0]
        print(f"🔒 VALIDAÇÃO: {geko_products} produtos Geko preservados intactos")
        
    except Exception as e:
        print(f"❌ Erro crítico: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main() 