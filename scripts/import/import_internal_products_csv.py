#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
============================================
SCRIPT: IMPORTAÇÃO DOS PRODUTOS INTERNOS VIP
============================================
Importa 1421 registos (425 produtos + 996 variantes) 
do catalog_products_LIMPO.csv para o sistema de isolamento
"""

import csv
import psycopg2
import json
import re
from datetime import datetime
import hashlib
import uuid

# Configuração da base de dados
DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# Configurações de importação
CSV_FILE = "aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv"
SUPPLIER_ID = "internal"

# Mapeamento de marcas (baseado na análise anterior)
BRAND_MAPPING = {
    'FERMAN': 'FERMAN',
    'AG TOOLS': 'AG TOOLS', 
    'EXENA': 'EXENA',
    '': 'Genérico',
    None: 'Genérico'
}

# Traduções básicas PT -> EN
TRANSLATIONS = {
    # Nomes de produtos
    'Luva': 'Glove',
    'Luvas': 'Gloves', 
    'Nitrile': 'Nitrile',
    'Preta': 'Black',
    'Preto': 'Black',
    'Azul': 'Blue',
    'Branca': 'White',
    'Branco': 'White',
    'Vermelha': 'Red',
    'Vermelho': 'Red',
    'Tamanho': 'Size',
    'Tam': 'Size',
    'Grande': 'Large',
    'Médio': 'Medium',
    'Pequeno': 'Small',
    'Extensão': 'Extension',
    'Cabo': 'Cable',
    'Eléctrico': 'Electric',
    'Elétrico': 'Electric',
    'Disco': 'Disc',
    'Corte': 'Cutting',
    'Espátula': 'Spatula',
    'Parka': 'Parka',
    'Impermiável': 'Waterproof',
    'Reflectora': 'Reflective',
    'Proteção': 'Protection',
    'Segurança': 'Safety',
    'Trabalho': 'Work',
    'Industrial': 'Industrial',
    'Profissional': 'Professional',
    'Calçado': 'Footwear',
    'Sapato': 'Shoe',
    'Bota': 'Boot',
    'T6': 'Size 6',
    'T7': 'Size 7', 
    'T8': 'Size 8',
    'T9': 'Size 9',
    'T10': 'Size 10',
    'T11': 'Size 11',
    'T12': 'Size 12'
}

def translate_text(text_pt):
    """Traduz texto português para inglês usando mapeamento básico"""
    if not text_pt:
        return ""
    
    text_en = text_pt
    
    # Aplicar traduções palavra por palavra
    for pt_word, en_word in TRANSLATIONS.items():
        # Substituir palavras completas (case insensitive)
        pattern = r'\b' + re.escape(pt_word) + r'\b'
        text_en = re.sub(pattern, en_word, text_en, flags=re.IGNORECASE)
    
    return text_en

def generate_internal_ean(product_name, brand, counter):
    """Gera EAN interno único no formato INT_XXXXXX"""
    # Usar hash do nome + marca + contador para garantir unicidade
    content = f"{product_name}_{brand}_{counter}".encode('utf-8')
    hash_hex = hashlib.md5(content).hexdigest()[:6].upper()
    return f"INT_{hash_hex}"

def generate_sku(brand, product_name, counter):
    """Gera SKU automático baseado na marca e produto"""
    brand_prefix = {
        'AG TOOLS': 'AG',
        'FERMAN': 'FE', 
        'EXENA': 'EX',
        'Genérico': 'GE'
    }.get(brand, 'GE')
    
    # Extrair primeiras 3 letras do nome do produto (apenas letras)
    name_clean = re.sub(r'[^A-Za-z]', '', product_name)
    name_part = name_clean[:3].upper() if name_clean else 'PRD'
    
    return f"{brand_prefix}{counter:03d}{name_part}"

def extract_size_from_name(name):
    """Extrai tamanho do nome do produto"""
    size_patterns = [
        r'T(\d+)',      # T8, T9, etc.
        r'Size (\d+)',  # Size 8, Size 9
        r'(\d+)mm',     # 250mm, etc.
        r'(\d+)MM',     # 250MM, etc.
    ]
    
    for pattern in size_patterns:
        match = re.search(pattern, name)
        if match:
            return match.group(1)
    
    return None

def normalize_brand(brand_value):
    """Normaliza valor da marca usando mapeamento"""
    if not brand_value or brand_value.strip() == '':
        return 'Genérico'
    
    brand_clean = brand_value.strip()
    return BRAND_MAPPING.get(brand_clean, 'Genérico')

def connect_db():
    """Conecta à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Erro de conexão à BD: {e}")
        raise

def log_import_start(conn, file_path, total_rows):
    """Inicia log de importação"""
    cursor = conn.cursor()
    
    import_id = str(uuid.uuid4())
    
    cursor.execute("""
        INSERT INTO csv_import_logs (
            import_id, supplier_id, import_type, file_name, 
            total_rows, status, imported_by, started_at
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING import_id
    """, (
        import_id, 'internal', 'products', file_path, 
        total_rows, 'processing', 
        '00000000-0000-0000-0000-000000000001',  # System user
        datetime.now()
    ))
    
    conn.commit()
    return import_id

def log_import_end(conn, import_id, success_count, error_count, errors):
    """Finaliza log de importação"""
    cursor = conn.cursor()
    
    status = 'completed' if error_count == 0 else 'partial'
    
    cursor.execute("""
        UPDATE csv_import_logs SET
            processed_rows = %s,
            success_rows = %s, 
            error_rows = %s,
            error_details = %s,
            status = %s,
            completed_at = %s
        WHERE import_id = %s
    """, (
        success_count + error_count, success_count, error_count,
        json.dumps(errors) if errors else None,
        status, datetime.now(), import_id
    ))
    
    conn.commit()

def import_products():
    """Função principal de importação"""
    print("🚀 Iniciando importação dos produtos internos VIP...")
    
    # Conectar à BD
    conn = connect_db()
    cursor = conn.cursor()
    
    # Contar total de linhas no CSV
    with open(CSV_FILE, 'r', encoding='utf-8') as f:
        total_rows = sum(1 for line in f) - 1  # -1 para header
    
    print(f"📊 Total de registos a processar: {total_rows}")
    
    # Iniciar log de importação
    import_id = log_import_start(conn, CSV_FILE, total_rows)
    print(f"📝 Log de importação iniciado: {import_id}")
    
    success_count = 0
    error_count = 0
    errors = []
    products_created = {}  # EAN -> product data
    variants_created = 0
    
    try:
        with open(CSV_FILE, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            
            for row_num, row in enumerate(reader, 1):
                try:
                    # Extrair dados do CSV
                    field_type = row.get('fieldType', '').strip()
                    name = row.get('title', '').strip()
                    brand_raw = row.get('brand', '').strip()
                    description = row.get('bodyHtml', '').strip()
                    category_id = row.get('geko_category_id', '').strip()
                    
                    # Pular se dados insuficientes
                    if not name or not field_type:
                        continue
                    
                    # Normalizar marca
                    brand = normalize_brand(brand_raw)
                    
                    # Processar baseado no tipo
                    if field_type == 'Product':
                        # PRODUTO BASE
                        
                        # Gerar identificadores únicos
                        internal_ean = generate_internal_ean(name, brand, row_num)
                        internal_sku = generate_sku(brand, name, row_num)
                        
                        # Traduzir nomes
                        name_pt = name
                        name_en = translate_text(name)
                        
                        # Traduzir descrição
                        desc_pt = description[:500] if description else ""
                        desc_en = translate_text(desc_pt)[:500] if desc_pt else ""
                        
                        # Inserir produto
                        cursor.execute("""
                            INSERT INTO internal_products (
                                internal_ean, internal_sku, supplier_id,
                                name, name_pt, name_en,
                                short_description, short_description_pt, short_description_en,
                                brand, is_active, created_at
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            internal_ean, internal_sku, SUPPLIER_ID,
                            name, name_pt, name_en,
                            desc_pt, desc_pt, desc_en,
                            brand, True, datetime.now()
                        ))
                        
                        products_created[internal_ean] = {
                            'name': name,
                            'brand': brand,
                            'category_id': category_id
                        }
                        
                        print(f"  ✅ Produto criado: {internal_ean} - {name_pt}")
                        
                    elif field_type == 'Variant':
                        # VARIANTE
                        
                        # Encontrar produto pai (último produto criado da mesma marca/família)
                        parent_ean = None
                        for ean, prod_data in reversed(list(products_created.items())):
                            if prod_data['brand'] == brand:
                                # Verificar se nomes são similares (mesmo produto base)
                                base_name = name.split()[0] if name else ""
                                prod_base_name = prod_data['name'].split()[0] if prod_data['name'] else ""
                                
                                if base_name and base_name.lower() in prod_data['name'].lower():
                                    parent_ean = ean
                                    break
                        
                        if not parent_ean:
                            # Se não encontrar pai, pular esta variante
                            print(f"  ⚠️  Variante órfã ignorada: {name}")
                            continue
                        
                        # Gerar ID da variante
                        variant_id = f"{parent_ean}_V{variants_created + 1:03d}"
                        variant_sku = generate_sku(brand, name, row_num + 10000)
                        
                        # Extrair tamanho/atributos
                        size_value = extract_size_from_name(name)
                        
                        # Traduzir nomes da variante
                        variant_name_pt = name
                        variant_name_en = translate_text(name)
                        
                        # Inserir variante
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
                        print(f"    └── Variante: {variant_id} - {variant_name_pt}")
                    
                    success_count += 1
                    
                    # Commit a cada 50 registos
                    if success_count % 50 == 0:
                        conn.commit()
                        print(f"📊 Processados: {success_count} registos...")
                        
                except Exception as e:
                    error_count += 1
                    error_msg = f"Linha {row_num}: {str(e)}"
                    errors.append(error_msg)
                    print(f"  ❌ Erro na linha {row_num}: {e}")
                    
                    # Rollback só esta transação
                    conn.rollback()
        
        # Commit final
        conn.commit()
        
        # Log final
        log_import_end(conn, import_id, success_count, error_count, errors)
        
        print(f"\n🎉 IMPORTAÇÃO CONCLUÍDA!")
        print(f"✅ Produtos criados: {len(products_created)}")
        print(f"✅ Variantes criadas: {variants_created}")
        print(f"✅ Total sucessos: {success_count}")
        print(f"❌ Total erros: {error_count}")
        
        if errors:
            print(f"\n⚠️  Primeiros 5 erros:")
            for error in errors[:5]:
                print(f"  - {error}")
        
    except Exception as e:
        print(f"❌ Erro crítico na importação: {e}")
        log_import_end(conn, import_id, success_count, error_count, [str(e)])
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    import_products() 