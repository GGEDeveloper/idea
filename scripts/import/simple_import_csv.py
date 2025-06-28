#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
IMPORTAÇÃO SIMPLES DOS PRODUTOS INTERNOS VIP
Versão simplificada para importar rapidamente os dados CSV
"""

import csv
import psycopg2
import re
from datetime import datetime
import hashlib

# Configuração
DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_FILE = "aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv"

# Traduções básicas PT -> EN
TRANSLATIONS = {
    'Luva': 'Glove', 'Luvas': 'Gloves', 'Nitrile': 'Nitrile',
    'Preta': 'Black', 'Preto': 'Black', 'Azul': 'Blue',
    'Branca': 'White', 'Branco': 'White', 'Tamanho': 'Size',
    'Extensão': 'Extension', 'Cabo': 'Cable', 'Eléctrico': 'Electric',
    'Disco': 'Disc', 'Corte': 'Cutting', 'Espátula': 'Spatula',
    'Parka': 'Parka', 'Impermiável': 'Waterproof', 'Reflectora': 'Reflective',
    'Proteção': 'Protection', 'Segurança': 'Safety', 'T8': 'Size 8', 'T9': 'Size 9'
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

def generate_internal_ean(product_name, brand, counter):
    """Gera EAN interno único"""
    content = f"{product_name}_{brand}_{counter}".encode('utf-8')
    hash_hex = hashlib.md5(content).hexdigest()[:6].upper()
    return f"INT_{hash_hex}"

def generate_sku(brand, product_name, counter):
    """Gera SKU automático"""
    brand_prefix = {
        'AG TOOLS': 'AG', 'FERMAN': 'FE', 'EXENA': 'EX'
    }.get(brand, 'GE')
    
    name_clean = re.sub(r'[^A-Za-z]', '', product_name)
    name_part = name_clean[:3].upper() if name_clean else 'PRD'
    
    return f"{brand_prefix}{counter:03d}{name_part}"

def normalize_brand(brand_value):
    """Normaliza marca"""
    if not brand_value or brand_value.strip() == '':
        return 'Genérico'
    
    brand_clean = brand_value.strip()
    if 'FERMAN' in brand_clean:
        return 'FERMAN'
    elif 'AG TOOLS' in brand_clean or 'AG00' in brand_clean:
        return 'AG TOOLS'
    elif 'EXENA' in brand_clean:
        return 'EXENA'
    else:
        return 'Genérico'

def main():
    print("🚀 Importação simples dos produtos internos VIP...")
    
    # Conectar BD
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    
    products_created = {}
    variants_created = 0
    counter = 1
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row in reader:
                # Usar nomes corretos das colunas do CSV
                field_type = get_safe_value(row, 'fieldType')
                name = get_safe_value(row, 'name')
                brand_raw = get_safe_value(row, 'brand')
                description = get_safe_value(row, 'description')
                
                if not name or not field_type:
                    continue
                
                brand = normalize_brand(brand_raw)
                
                if field_type == 'Product':
                    # PRODUTO
                    internal_ean = generate_internal_ean(name, brand, counter)
                    internal_sku = generate_sku(brand, name, counter)
                    
                    name_pt = name
                    name_en = translate_text(name)
                    
                    desc_pt = description[:500] if description else ""
                    desc_en = translate_text(desc_pt)[:500] if desc_pt else ""
                    
                    cursor.execute("""
                        INSERT INTO internal_products (
                            internal_ean, internal_sku, supplier_id,
                            name, name_pt, name_en,
                            short_description, short_description_pt, short_description_en,
                            brand, is_active, created_at
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        internal_ean, internal_sku, 'internal',
                        name, name_pt, name_en,
                        desc_pt, desc_pt, desc_en,
                        brand, True, datetime.now()
                    ))
                    
                    products_created[internal_ean] = {
                        'name': name, 'brand': brand
                    }
                    
                    print(f"✅ Produto: {internal_ean} - {name_pt}")
                    
                elif field_type == 'Variant':
                    # VARIANTE
                    parent_ean = None
                    for ean, prod_data in reversed(list(products_created.items())):
                        if prod_data['brand'] == brand:
                            base_name = name.split()[0] if name else ""
                            if base_name and base_name.lower() in prod_data['name'].lower():
                                parent_ean = ean
                                break
                    
                    if parent_ean:
                        variant_id = f"{parent_ean}_V{variants_created + 1:03d}"
                        variant_sku = generate_sku(brand, name, counter + 10000)
                        
                        # Extrair tamanho
                        size_value = None
                        size_match = re.search(r'T(\d+)', name)
                        if size_match:
                            size_value = size_match.group(1)
                        
                        variant_name_pt = name
                        variant_name_en = translate_text(name)
                        
                        cursor.execute("""
                            INSERT INTO internal_variants (
                                internal_variant_id, internal_ean,
                                variant_name, variant_name_pt, variant_name_en,
                                size_value, variant_sku, is_active, created_at
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            variant_id, parent_ean,
                            name, variant_name_pt, variant_name_en,
                            size_value, variant_sku, True, datetime.now()
                        ))
                        
                        variants_created += 1
                        print(f"  └── Variante: {variant_id} - {variant_name_pt}")
                
                counter += 1
                
                # Commit a cada 50
                if counter % 50 == 0:
                    conn.commit()
                    print(f"📊 Processados: {counter} registos...")
        
        # Commit final
        conn.commit()
        
        print(f"\n🎉 IMPORTAÇÃO CONCLUÍDA!")
        print(f"✅ Produtos: {len(products_created)}")
        print(f"✅ Variantes: {variants_created}")
        print(f"✅ Total: {counter}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    main() 