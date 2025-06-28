#!/usr/bin/env python3
"""
🎯 AliTools Image Downloader - Organizado para Análise
Downloads imagens do catálogo para pasta temporária organizadas por produto VIP
"""

import json
import os
import requests
import time
from pathlib import Path
from urllib.parse import urlparse
import concurrent.futures
from datetime import datetime

def log_message(message: str, level: str = "INFO"):
    """Log com timestamp e ícones"""
    icons = {
        "INFO": "ℹ️",
        "SUCCESS": "✅", 
        "ERROR": "❌",
        "WARNING": "⚠️",
        "PROGRESS": "🔄"
    }
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{icons.get(level, 'ℹ️')} [{timestamp}] {message}")

def sanitize_filename(name: str) -> str:
    """Remove caracteres inválidos do nome do ficheiro"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        name = name.replace(char, '_')
    return name.strip()

def download_image(url: str, filepath: Path, timeout: int = 30) -> bool:
    """Download de uma imagem individual"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=timeout, stream=True)
        response.raise_for_status()
        
        # Criar directório se não existir
        filepath.parent.mkdir(parents=True, exist_ok=True)
        
        # Escrever ficheiro
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        return True
        
    except Exception as e:
        log_message(f"Erro ao fazer download {url}: {str(e)}", "ERROR")
        return False

def create_product_structure(base_path: Path, product_id: str, product_info: dict) -> Path:
    """Cria estrutura de pastas para o produto"""
    
    # Nome da pasta do produto
    product_name = sanitize_filename(product_info['vip_info']['name_pt'])
    brand = product_info['vip_info']['brand']
    
    # Pasta: EAN_Nome-do-Produto_Marca
    folder_name = f"{product_id}_{product_name}_{brand}"
    product_path = base_path / folder_name
    
    # Criar subpastas
    (product_path / "originals").mkdir(parents=True, exist_ok=True)
    (product_path / "large").mkdir(parents=True, exist_ok=True)
    (product_path / "medium").mkdir(parents=True, exist_ok=True)
    (product_path / "small").mkdir(parents=True, exist_ok=True)
    (product_path / "thumbnails").mkdir(parents=True, exist_ok=True)
    
    # Criar ficheiro de informação do produto
    info_file = product_path / "produto_info.txt"
    with open(info_file, 'w', encoding='utf-8') as f:
        f.write(f"INFORMAÇÃO DO PRODUTO VIP\n")
        f.write(f"=" * 50 + "\n\n")
        f.write(f"EAN: {product_id}\n")
        f.write(f"Nome PT: {product_info['vip_info']['name_pt']}\n")
        f.write(f"Nome EN: {product_info['vip_info']['name_en']}\n")
        f.write(f"Marca: {product_info['vip_info']['brand']}\n")
        f.write(f"Score Mapeamento: {product_info['mapping_score']}\n")
        f.write(f"Total Imagens: {product_info['total_images']}\n\n")
        
        f.write(f"INFORMAÇÃO ORIGINAL CSV\n")
        f.write(f"=" * 30 + "\n")
        f.write(f"Nome: {product_info['csv_info']['name']}\n")
        f.write(f"Marca: {product_info['csv_info']['brand']}\n")
        f.write(f"Coleção: {product_info['csv_info']['collection']}\n\n")
        
        f.write(f"IMAGENS DISPONÍVEIS\n")
        f.write(f"=" * 30 + "\n")
        for img in product_info['images']:
            f.write(f"Imagem {img['index']}: {img['filename']}\n")
            f.write(f"  Principal: {'Sim' if img['is_primary'] else 'Não'}\n")
    
    return product_path

def download_product_images(product_id: str, product_info: dict, base_path: Path) -> dict:
    """Download de todas as imagens de um produto"""
    
    product_path = create_product_structure(base_path, product_id, product_info)
    
    results = {
        'product_id': product_id,
        'product_name': product_info['vip_info']['name_pt'],
        'total_images': len(product_info['images']),
        'downloaded': 0,
        'failed': 0,
        'files': []
    }
    
    for img in product_info['images']:
        img_index = img['index']
        is_primary = img['is_primary']
        filename_base = sanitize_filename(img['filename'].replace('~mv2.jpg', '').replace('~mv2.png', '').replace('~mv2.jpeg', ''))
        
        # Download de cada variação
        for size_name, url in img['variations'].items():
            
            # Determinar extensão
            if url.endswith('.png'):
                ext = '.png'
            elif url.endswith('.jpeg'):
                ext = '.jpeg'
            else:
                ext = '.jpg'
            
            # Nome do ficheiro
            primary_tag = "_PRINCIPAL" if is_primary else ""
            if size_name == "original":
                folder = "originals"
                filename = f"{img_index:02d}_{filename_base}{primary_tag}_original{ext}"
            elif size_name == "large":
                folder = "large"
                filename = f"{img_index:02d}_{filename_base}{primary_tag}_800x800{ext}"
            elif size_name == "medium":
                folder = "medium"
                filename = f"{img_index:02d}_{filename_base}{primary_tag}_400x400{ext}"
            elif size_name == "small":
                folder = "small"
                filename = f"{img_index:02d}_{filename_base}{primary_tag}_150x150{ext}"
            else:  # thumb
                folder = "thumbnails"
                filename = f"{img_index:02d}_{filename_base}{primary_tag}_100x100{ext}"
            
            filepath = product_path / folder / filename
            
            if download_image(url, filepath):
                results['downloaded'] += 1
                results['files'].append(str(filepath.relative_to(base_path)))
            else:
                results['failed'] += 1
    
    return results

def main():
    """Função principal"""
    
    log_message("🎯 Iniciando AliTools Image Downloader Organizado", "INFO")
    
    # Carregar catálogo
    catalog_file = Path("alitools-research/image-catalog/complete_image_catalog.json")
    if not catalog_file.exists():
        log_message(f"Catálogo não encontrado: {catalog_file}", "ERROR")
        return
    
    with open(catalog_file, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    total_products = len(catalog['products'])
    log_message(f"📦 Catálogo carregado: {total_products} produtos", "SUCCESS")
    
    # Criar pasta temporária
    temp_path = Path("temp-alitools-images")
    temp_path.mkdir(exist_ok=True)
    
    # Criar subpastas por marca
    brands_path = temp_path / "por-marca"
    brands_path.mkdir(exist_ok=True)
    
    # Estatísticas
    stats = {
        'total_products': total_products,
        'processed': 0,
        'total_images_downloaded': 0,
        'total_images_failed': 0,
        'by_brand': {}
    }
    
    log_message(f"📁 Pasta temporária criada: {temp_path}", "INFO")
    log_message(f"🔄 Iniciando download de {total_products} produtos...", "PROGRESS")
    
    # Processar cada produto
    for product_id, product_info in catalog['products'].items():
        
        brand = product_info['vip_info']['brand']
        if brand not in stats['by_brand']:
            stats['by_brand'][brand] = {'products': 0, 'images': 0}
        
        # Pasta da marca
        brand_path = brands_path / sanitize_filename(brand)
        brand_path.mkdir(exist_ok=True)
        
        log_message(f"🔄 {product_id}: {product_info['vip_info']['name_pt'][:50]}...", "PROGRESS")
        
        # Download das imagens do produto
        result = download_product_images(product_id, product_info, brand_path)
        
        # Atualizar estatísticas
        stats['processed'] += 1
        stats['total_images_downloaded'] += result['downloaded']
        stats['total_images_failed'] += result['failed']
        stats['by_brand'][brand]['products'] += 1
        stats['by_brand'][brand]['images'] += result['downloaded']
        
        # Log de progresso
        if result['failed'] > 0:
            log_message(f"⚠️  {product_id}: {result['downloaded']} OK, {result['failed']} falharam", "WARNING")
        else:
            log_message(f"✅ {product_id}: {result['downloaded']} imagens descarregadas", "SUCCESS")
        
        # Pequena pausa para não sobrecarregar servidor
        time.sleep(0.5)
    
    # Criar relatório final
    report_file = temp_path / "relatorio_download.txt"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(f"RELATÓRIO DE DOWNLOAD - ALITOOLS IMAGES\n")
        f.write(f"=" * 50 + "\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write(f"RESUMO GERAL\n")
        f.write(f"============\n")
        f.write(f"Total de produtos: {stats['total_products']}\n")
        f.write(f"Produtos processados: {stats['processed']}\n")
        f.write(f"Imagens descarregadas: {stats['total_images_downloaded']}\n")
        f.write(f"Imagens falharam: {stats['total_images_failed']}\n")
        f.write(f"Taxa de sucesso: {(stats['total_images_downloaded'] / (stats['total_images_downloaded'] + stats['total_images_failed']) * 100):.1f}%\n\n")
        
        f.write(f"ESTATÍSTICAS POR MARCA\n")
        f.write(f"======================\n")
        for brand, data in sorted(stats['by_brand'].items()):
            f.write(f"{brand}: {data['products']} produtos, {data['images']} imagens\n")
    
    # Log final
    log_message("🎉 Download completo!", "SUCCESS")
    log_message(f"📊 {stats['total_images_downloaded']} imagens descarregadas", "SUCCESS")
    log_message(f"📁 Imagens organizadas em: {temp_path}", "INFO")
    log_message(f"📄 Relatório disponível: {report_file}", "INFO")
    
    print("\n" + "="*60)
    print("🎯 ESTRUTURA CRIADA:")
    print("📁 temp-alitools-images/")
    print("   📁 por-marca/")
    print("      📁 FERMAN/")
    print("      📁 AG TOOLS/")
    print("      📁 Genérico/")
    print("         📁 EAN_Nome-Produto_Marca/")
    print("            📄 produto_info.txt")
    print("            📁 originals/")
    print("            📁 large/")
    print("            📁 medium/")
    print("            📁 small/")
    print("            📁 thumbnails/")
    print("="*60)

if __name__ == "__main__":
    main() 