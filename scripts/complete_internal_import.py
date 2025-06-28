#!/usr/bin/env python3
"""
Script para completar a importação dos produtos internos restantes
Analisa diferenças e importa registros faltantes
"""

import os
import csv
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import hashlib
from datetime import datetime

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# URL da base de dados
DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_PATH = "../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv"

def connect_db():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Erro ao conectar à BD: {e}")
        return None

def generate_ean(name, index):
    """Gerar EAN único para produto interno"""
    hash_input = f"{name}_{index}".encode('utf-8')
    hash_hex = hashlib.md5(hash_input).hexdigest()[:6].upper()
    return f"INT_{hash_hex}"

def get_brand_from_name(name):
    """Extrair marca do nome do produto"""
    name_upper = name.upper()
    if 'AG00' in name or name_upper.startswith('AG '):
        return 'AG TOOLS'
    elif 'FERMAN' in name_upper:
        return 'FERMAN'
    elif 'EXENA' in name_upper:
        return 'EXENA'
    else:
        return 'Genérico'

def generate_sku(brand, ean):
    """Gerar SKU baseado na marca"""
    brand_prefixes = {
        'AG TOOLS': 'AG',
        'FERMAN': 'FE', 
        'EXENA': 'EX',
        'Genérico': 'GE'
    }
    prefix = brand_prefixes.get(brand, 'GE')
    suffix = ean.replace('INT_', '')[:6]
    return f"{prefix}{suffix}"

def translate_to_english(text_pt):
    """Tradução básica PT->EN usando mapeamento predefinido"""
    translations = {
        # Cores
        'Preto': 'Black', 'Branco': 'White', 'Azul': 'Blue', 'Vermelho': 'Red',
        'Verde': 'Green', 'Amarelo': 'Yellow', 'Cinzento': 'Grey', 'Cinza': 'Grey',
        'Inox': 'Stainless Steel', 'Cromado': 'Chrome', 'Latonado': 'Brass',
        
        # Materiais e tipos
        'Aço': 'Steel', 'Ferro': 'Iron', 'Alumínio': 'Aluminum', 'Plástico': 'Plastic',
        'Madeira': 'Wood', 'Vidro': 'Glass', 'Borracha': 'Rubber', 'Têxtil': 'Textile',
        
        # Produtos comuns
        'Abraçadeira': 'Cable Tie', 'Cadeado': 'Padlock', 'Canhão': 'Lock',
        'Esticador': 'Turnbuckle', 'Parafuso': 'Screw', 'Porca': 'Nut',
        'Anilha': 'Washer', 'Rebite': 'Rivet', 'Dobradiça': 'Hinge',
        'Fecho': 'Latch', 'Chave': 'Key', 'Segurança': 'Security',
        'Ramada': 'Awning', 'Computador': 'Computer'
    }
    
    text_en = text_pt
    for pt, en in translations.items():
        text_en = text_en.replace(pt, en)
    return text_en

def analyze_missing_records():
    """Analisar que registros estão faltando"""
    logger.info("🔍 Analisando registros faltantes...")
    
    conn = connect_db()
    if not conn:
        return None, None
        
    try:
        with conn.cursor() as cursor:
            # Obter produtos já importados
            cursor.execute("SELECT name_pt FROM internal_products")
            imported_products = {row[0] for row in cursor.fetchall()}
            
            cursor.execute("SELECT variant_name_pt FROM internal_variants")
            imported_variants = {row[0] for row in cursor.fetchall()}
            
        # Ler CSV e identificar faltantes
        missing_products = []
        missing_variants = []
        
        with open(CSV_PATH, 'r', encoding='utf-8') as file:
            reader = csv.reader(file, delimiter=';')
            headers = next(reader)
            
            for row_idx, row in enumerate(reader, 1):
                if len(row) >= 20:
                    product_name = row[1].strip() if row[1] else ''
                    price = row[7].strip() if len(row) > 7 and row[7] else ''
                    
                    # Pular produtos sem preço
                    if not price or price == '0' or float(price.replace(',', '.')) <= 0:
                        continue
                    
                    # Verificar produto principal
                    if product_name and product_name not in imported_products:
                        missing_products.append((row_idx, row))
                    
                    # Verificar variantes (coluna 19)
                    if len(row) > 19 and row[19]:
                        variants = [v.strip() for v in row[19].split(';') if v.strip()]
                        for variant in variants:
                            if variant not in imported_variants:
                                missing_variants.append((row_idx, row, variant))
        
        logger.info(f"📊 Encontrados {len(missing_products)} produtos faltantes")
        logger.info(f"📊 Encontradas {len(missing_variants)} variantes faltantes")
        
        return missing_products, missing_variants
        
    except Exception as e:
        logger.error(f"Erro ao analisar faltantes: {e}")
        return None, None
    finally:
        conn.close()

def import_missing_products(missing_products):
    """Importar produtos faltantes"""
    if not missing_products:
        logger.info("✅ Nenhum produto faltante encontrado")
        return True
        
    logger.info(f"📥 Importando {len(missing_products)} produtos faltantes...")
    
    conn = connect_db()
    if not conn:
        return False
        
    try:
        with conn.cursor() as cursor:
            for row_idx, row in missing_products:
                name_pt = row[1].strip()
                brand = get_brand_from_name(name_pt)
                ean = generate_ean(name_pt, row_idx)
                sku = generate_sku(brand, ean)
                name_en = translate_to_english(name_pt)
                price = float(row[7].replace(',', '.'))
                
                cursor.execute("""
                    INSERT INTO internal_products (
                        internal_ean, name_pt, name_en, brand, internal_sku,
                        base_cost, supplier_id, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (internal_ean) DO NOTHING
                """, (ean, name_pt, name_en, brand, sku, price, "1", datetime.now()))
                
                if cursor.rowcount > 0:
                    logger.info(f"✅ Produto importado: {name_pt}")
        
        conn.commit()
        logger.info("✅ Produtos faltantes importados com sucesso")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao importar produtos: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def import_missing_variants(missing_variants):
    """Importar variantes faltantes"""
    if not missing_variants:
        logger.info("✅ Nenhuma variante faltante encontrada")
        return True
        
    logger.info(f"📥 Importando {len(missing_variants)} variantes faltantes...")
    
    conn = connect_db()
    if not conn:
        return False
        
    try:
        with conn.cursor() as cursor:
            for row_idx, row, variant_name in missing_variants:
                parent_name = row[1].strip()
                
                # Encontrar produto pai
                cursor.execute("SELECT internal_ean FROM internal_products WHERE name_pt = %s", (parent_name,))
                parent_result = cursor.fetchone()
                
                if not parent_result:
                    logger.warning(f"⚠️ Produto pai não encontrado para variante: {variant_name}")
                    continue
                    
                parent_ean = parent_result[0]
                variant_ean = f"{parent_ean}_V{row_idx}"
                variant_name_en = translate_to_english(variant_name)
                price = float(row[7].replace(',', '.'))
                
                cursor.execute("""
                    INSERT INTO internal_variants (
                        internal_variant_id, internal_ean, variant_name_pt, variant_name_en,
                        created_at
                    ) VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (internal_variant_id) DO NOTHING
                """, (variant_ean, parent_ean, variant_name, variant_name_en, datetime.now()))
                
                if cursor.rowcount > 0:
                    logger.info(f"✅ Variante importada: {variant_name}")
        
        conn.commit()
        logger.info("✅ Variantes faltantes importadas com sucesso")
        return True
        
    except Exception as e:
        logger.error(f"Erro ao importar variantes: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def verify_final_status():
    """Verificar status final da importação"""
    logger.info("🔍 Verificando status final...")
    
    conn = connect_db()
    if not conn:
        return False
        
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM internal_products")
            products_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM internal_variants")
            variants_count = cursor.fetchone()[0]
            
            total_count = products_count + variants_count
            
            logger.info(f"📊 RESULTADO FINAL:")
            logger.info(f"   • Produtos base: {products_count}")
            logger.info(f"   • Variantes: {variants_count}")
            logger.info(f"   • TOTAL: {total_count} registros")
            
            # Calcular percentual de conclusão
            expected_total = 1421  # 425 produtos + 996 variantes
            completion_rate = (total_count / expected_total) * 100
            
            logger.info(f"📈 Taxa de conclusão: {completion_rate:.1f}%")
            
            if completion_rate >= 95:
                logger.info("🎉 IMPORTAÇÃO PRATICAMENTE COMPLETA!")
            else:
                logger.info(f"⚠️ Ainda faltam {expected_total - total_count} registros")
            
            return True
            
    except Exception as e:
        logger.error(f"Erro ao verificar status: {e}")
        return False
    finally:
        conn.close()

def main():
    """Função principal"""
    logger.info("🚀 Iniciando finalização da importação de produtos internos")
    logger.info("=" * 60)
    
    # Analisar registros faltantes
    missing_products, missing_variants = analyze_missing_records()
    
    if missing_products is None:
        logger.error("❌ Falha ao analisar registros faltantes")
        return False
    
    # Importar produtos faltantes
    if not import_missing_products(missing_products):
        logger.error("❌ Falha ao importar produtos faltantes")
        return False
    
    # Importar variantes faltantes
    if not import_missing_variants(missing_variants):
        logger.error("❌ Falha ao importar variantes faltantes")
        return False
    
    # Verificar status final
    if not verify_final_status():
        logger.error("❌ Falha ao verificar status final")
        return False
    
    logger.info("=" * 60)
    logger.info("🎉 IMPORTAÇÃO FINALIZADA COM SUCESSO!")
    logger.info("✅ Sistema VIP isolado está pronto para próxima fase")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1) 