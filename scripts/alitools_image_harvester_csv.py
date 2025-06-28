#!/usr/bin/env python3
"""
🎯 AliTools Image Harvester - CSV Edition
Extrai URLs de imagens diretamente do CSV catalog_products.csv
"""

import csv
import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Tuple, Any
import psycopg2
from psycopg2.extras import RealDictCursor
import requests
from urllib.parse import urlparse
import re

# Configuração da base de dados
DATABASE_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def log_message(message: str, level: str = "INFO"):
    """Log com timestamp e ícones"""
    icons = {
        "INFO": "ℹ️",
        "SUCCESS": "✅", 
        "WARNING": "⚠️",
        "ERROR": "❌",
        "PROGRESS": "🔄"
    }
    timestamp = datetime.now().strftime("%H:%M:%S")
    icon = icons.get(level, "📝")
    print(f"{icon} [{timestamp}] {message}")

def connect_database():
    """Conecta à base de dados"""
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        log_message("Conexão à base de dados estabelecida", "SUCCESS")
        return conn
    except Exception as e:
        log_message(f"Erro ao conectar à base de dados: {e}", "ERROR")
        return None

def get_vip_products(conn) -> Dict[str, Any]:
    """Busca todos os produtos VIP da base de dados"""
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT internal_ean, name, name_pt, name_en, brand
            FROM internal_products 
            WHERE is_active = true
            ORDER BY internal_ean
        """)
        
        products = {}
        for row in cursor.fetchall():
            products[row['internal_ean']] = {
                'name': row['name'],
                'name_pt': row['name_pt'], 
                'name_en': row['name_en'],
                'brand': row['brand']
            }
        
        log_message(f"Carregados {len(products)} produtos VIP", "SUCCESS")
        return products
        
    except Exception as e:
        log_message(f"Erro ao carregar produtos VIP: {e}", "ERROR")
        return {}

def read_csv_products(csv_file: str) -> List[Dict]:
    """Lê o ficheiro CSV e extrai produtos com imagens"""
    products = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            
            for row in reader:
                # Só produtos principais (não variantes)
                if row.get('fieldType') == 'Product':
                    image_urls = row.get('productImageUrl', '').strip()
                    
                    if image_urls:
                        # Separar múltiplas imagens por ;
                        urls = [url.strip() for url in image_urls.split(';') if url.strip()]
                        
                        products.append({
                            'handle_id': row.get('handleId'),
                            'name': row.get('name'),
                            'description': row.get('description', ''),
                            'brand': row.get('brand', ''),
                            'collection': row.get('collection', ''),
                            'image_urls': urls,
                            'total_images': len(urls)
                        })
        
        log_message(f"Lidos {len(products)} produtos do CSV", "SUCCESS")
        return products
        
    except Exception as e:
        log_message(f"Erro ao ler CSV: {e}", "ERROR")
        return []

def create_image_variations(base_url: str) -> Dict[str, str]:
    """Cria variações de tamanho de uma imagem"""
    # Base URL: 88efbe_hash~mv2.jpg
    # Full URL: https://static.wixstatic.com/media/88efbe_hash~mv2.jpg/v1/fill/w_375,h_375,al_c,q_80...
    
    base_wix_url = f"https://static.wixstatic.com/media/{base_url}"
    
    return {
        'original': f"{base_wix_url}",
        'large': f"{base_wix_url}/v1/fill/w_800,h_800,al_c,q_85,usm_0.66_1.00_0.01,enc_auto,quality_auto/{base_url}",
        'medium': f"{base_wix_url}/v1/fill/w_400,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_auto,quality_auto/{base_url}",
        'small': f"{base_wix_url}/v1/fill/w_150,h_150,al_c,q_75,usm_0.66_1.00_0.01,enc_auto,quality_auto/{base_url}",
        'thumb': f"{base_wix_url}/v1/fill/w_100,h_100,al_c,q_70,usm_0.66_1.00_0.01,enc_auto,quality_auto/{base_url}"
    }

def calculate_similarity(text1: str, text2: str) -> float:
    """Calcula similaridade simples entre dois textos"""
    # Normalizar textos
    t1 = re.sub(r'[^a-zA-Z0-9\s]', '', text1.lower())
    t2 = re.sub(r'[^a-zA-Z0-9\s]', '', text2.lower())
    
    words1 = set(t1.split())
    words2 = set(t2.split())
    
    if not words1 or not words2:
        return 0.0
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    
    return len(intersection) / len(union) if union else 0.0

def map_to_vip_products(csv_products: List[Dict], vip_products: Dict[str, Any]) -> Dict[str, Any]:
    """Mapeia produtos CSV para produtos VIP"""
    mappings = {}
    unmapped = []
    
    for csv_product in csv_products:
        best_match = None
        best_score = 0.0
        best_vip_ean = None
        
        csv_name = csv_product['name']
        
        # Tentar encontrar correspondência
        for vip_ean, vip_data in vip_products.items():
            # Verificar similaridade com diferentes campos
            scores = [
                calculate_similarity(csv_name, vip_data['name']),
                calculate_similarity(csv_name, vip_data['name_pt']),
                calculate_similarity(csv_name, vip_data['name_en'])
            ]
            
            score = max(scores)
            
            if score > best_score:
                best_score = score
                best_match = vip_data
                best_vip_ean = vip_ean
        
        # Se temos uma correspondência razoável
        if best_score >= 0.3:  # Threshold de 30%
            mappings[best_vip_ean] = {
                'vip_product': best_match,
                'csv_product': csv_product,
                'similarity_score': best_score,
                'total_images': csv_product['total_images']
            }
            
            log_message(f"✅ Mapeado: {csv_name} → {best_vip_ean} (score: {best_score:.2f})", "SUCCESS")
        else:
            unmapped.append(csv_product)
    
    log_message(f"Mapeados: {len(mappings)} produtos | Não mapeados: {len(unmapped)}", "INFO")
    return mappings, unmapped

def generate_image_catalog(mappings: Dict, output_dir: str = "alitools-research/image-catalog"):
    """Gera catálogo completo de imagens"""
    os.makedirs(output_dir, exist_ok=True)
    
    # Catálogo principal
    catalog = {
        'generated_at': datetime.now().isoformat(),
        'total_products': len(mappings),
        'total_images': sum(mapping['total_images'] for mapping in mappings.values()),
        'products': {}
    }
    
    # Catálogo de URLs para download
    download_catalog = {
        'generated_at': datetime.now().isoformat(),
        'download_plan': []
    }
    
    for vip_ean, mapping in mappings.items():
        csv_product = mapping['csv_product']
        vip_product = mapping['vip_product']
        
        # Processar cada imagem
        images = []
        for i, image_url in enumerate(csv_product['image_urls']):
            variations = create_image_variations(image_url)
            
            image_data = {
                'index': i + 1,
                'is_primary': i == 0,
                'filename': image_url,
                'variations': variations
            }
            
            images.append(image_data)
            
            # Adicionar ao plano de download
            for size, url in variations.items():
                download_catalog['download_plan'].append({
                    'vip_ean': vip_ean,
                    'image_index': i + 1,
                    'size': size,
                    'url': url,
                    'local_filename': f"{vip_ean}_{i+1}_{size}_{image_url}",
                    'local_path': f"public/images/products/internal/{size}/{vip_ean}_{i+1}_{image_url}"
                })
        
        # Dados do produto no catálogo
        catalog['products'][vip_ean] = {
            'vip_info': vip_product,
            'csv_info': {
                'name': csv_product['name'],
                'brand': csv_product['brand'],
                'collection': csv_product['collection'],
                'handle_id': csv_product['handle_id']
            },
            'mapping_score': mapping['similarity_score'],
            'total_images': len(images),
            'images': images
        }
    
    # Guardar catálogos
    catalog_file = os.path.join(output_dir, 'complete_image_catalog.json')
    download_file = os.path.join(output_dir, 'download_plan.json')
    summary_file = os.path.join(output_dir, 'summary_report.txt')
    
    with open(catalog_file, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    with open(download_file, 'w', encoding='utf-8') as f:
        json.dump(download_catalog, f, indent=2, ensure_ascii=False)
    
    # Relatório resumo
    with open(summary_file, 'w', encoding='utf-8') as f:
        f.write("🎯 ALITOOLS IMAGE HARVEST - RELATÓRIO RESUMO\n")
        f.write("="*50 + "\n\n")
        f.write(f"📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
        f.write(f"📦 Produtos VIP com imagens: {len(mappings)}\n")
        f.write(f"🖼️  Total de imagens: {catalog['total_images']}\n")
        f.write(f"📥 Total de downloads: {len(download_catalog['download_plan'])}\n\n")
        
        f.write("🏆 TOP 10 PRODUTOS COM MAIS IMAGENS:\n")
        f.write("-" * 40 + "\n")
        
        # Ordenar por número de imagens
        top_products = sorted(
            catalog['products'].items(),
            key=lambda x: x[1]['total_images'],
            reverse=True
        )[:10]
        
        for i, (ean, data) in enumerate(top_products, 1):
            f.write(f"{i:2d}. {ean} - {data['csv_info']['name']} ({data['total_images']} imagens)\n")
        
        f.write(f"\n📂 Ficheiros gerados:\n")
        f.write(f"   - {catalog_file}\n")
        f.write(f"   - {download_file}\n")
        f.write(f"   - {summary_file}\n")
    
    log_message(f"Catálogo gerado: {catalog['total_images']} imagens de {len(mappings)} produtos", "SUCCESS")
    log_message(f"Ficheiros salvos em: {output_dir}", "INFO")
    
    return catalog, download_catalog

def main():
    """Função principal"""
    log_message("🚀 Iniciando AliTools Image Harvester - CSV Edition", "INFO")
    
    # Caminhos
    csv_file = "aa-elementos-novos/csv-produtos/catalog_products (1).csv"
    
    # Verificar se o ficheiro existe
    if not os.path.exists(csv_file):
        log_message(f"Ficheiro CSV não encontrado: {csv_file}", "ERROR")
        return
    
    # 1. Conectar à base de dados
    log_message("Conectando à base de dados...", "PROGRESS")
    conn = connect_database()
    if not conn:
        return
    
    # 2. Carregar produtos VIP
    log_message("Carregando produtos VIP...", "PROGRESS")
    vip_products = get_vip_products(conn)
    
    # 3. Ler produtos do CSV
    log_message("Lendo produtos do CSV...", "PROGRESS") 
    csv_products = read_csv_products(csv_file)
    
    # 4. Mapear produtos
    log_message("Mapeando produtos CSV → VIP...", "PROGRESS")
    mappings, unmapped = map_to_vip_products(csv_products, vip_products)
    
    # 5. Gerar catálogo de imagens
    log_message("Gerando catálogo de imagens...", "PROGRESS")
    catalog, download_plan = generate_image_catalog(mappings)
    
    # 6. Relatório final
    log_message("📊 RELATÓRIO FINAL:", "INFO")
    log_message(f"   📦 Produtos VIP mapeados: {len(mappings)}", "INFO")
    log_message(f"   🖼️  Total de imagens: {catalog['total_images']}", "INFO")
    log_message(f"   📥 URLs para download: {len(download_plan['download_plan'])}", "INFO")
    log_message(f"   ❌ Produtos não mapeados: {len(unmapped)}", "WARNING")
    
    if unmapped:
        log_message("Produtos não mapeados:", "WARNING")
        for product in unmapped[:5]:  # Mostrar só os primeiros 5
            log_message(f"   - {product['name']}", "WARNING")
        if len(unmapped) > 5:
            log_message(f"   ... e mais {len(unmapped) - 5} produtos", "WARNING")
    
    conn.close()
    log_message("🎉 Harvesting completo!", "SUCCESS")

if __name__ == "__main__":
    main() 