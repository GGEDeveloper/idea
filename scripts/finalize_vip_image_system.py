#!/usr/bin/env python3
"""
🎯 VIP Image System Finalizer - Hipótese A
Organiza imagens AliTools na estrutura final do projeto VIP
"""

import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import psycopg2
from psycopg2.extras import RealDictCursor

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
        "ERROR": "❌",
        "WARNING": "⚠️",
        "PROGRESS": "🔄"
    }
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{icons.get(level, 'ℹ️')} [{timestamp}] {message}")

def create_directory_structure():
    """Cria estrutura de diretórios para imagens VIP"""
    log_message("Criando estrutura de diretórios VIP...")
    
    base_path = Path("public/images/products/internal")
    directories = [
        base_path,
        base_path / "originals",
        base_path / "thumbnails", 
        base_path / "medium",
        base_path / "large",
        base_path / "temp"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        log_message(f"Diretório criado: {directory}")
    
    return base_path

def load_image_catalog():
    """Carrega catálogo completo de imagens"""
    log_message("Carregando catálogo de imagens...")
    
    catalog_path = "alitools-research/image-catalog/complete_image_catalog.json"
    
    if not os.path.exists(catalog_path):
        log_message(f"Catálogo não encontrado: {catalog_path}", "ERROR")
        return None
    
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    log_message(f"Catálogo carregado: {len(catalog)} produtos", "SUCCESS")
    return catalog

def organize_product_images(catalog: Dict, base_path: Path):
    """Organiza imagens por produto na estrutura final"""
    log_message("Organizando imagens por produto...")
    
    organized_data = []
    temp_source = Path("temp-alitools-images/por-marca")
    
    # Acessar a seção de produtos do catálogo
    products = catalog.get("products", {})
    
    for ean, product_data in products.items():
            
        log_message(f"Processando {ean}...", "PROGRESS")
        
        # Encontrar pasta do produto
        product_name = product_data['vip_info']['name']
        brand = product_data['vip_info']['brand']
        
        # Procurar pasta no temp
        product_folder = None
        brand_folder = temp_source / brand
        
        if brand_folder.exists():
            for folder in brand_folder.iterdir():
                if folder.is_dir() and ean in folder.name:
                    product_folder = folder
                    break
        
        if not product_folder:
            log_message(f"Pasta não encontrada para {ean}", "WARNING")
            continue
        
        # Processar imagens do produto
        product_images = []
        originals_folder = product_folder / "originals"
        
        if originals_folder.exists():
            # Ordenar imagens por nome para manter ordem
            image_files = sorted([f for f in originals_folder.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']])
            
            for idx, image_file in enumerate(image_files, 1):
                # Nome final padronizado
                final_filename = f"{ean}_{idx:03d}.jpg"
                
                # Caminhos de destino
                dest_original = base_path / "originals" / final_filename
                dest_medium = base_path / "medium" / final_filename
                dest_thumbnail = base_path / "thumbnails" / final_filename
                
                # Copiar imagem original
                shutil.copy2(image_file, dest_original)
                
                # Dados para BD
                image_record = {
                    'internal_ean': ean,
                    'filename': final_filename,
                    'original_filename': image_file.name,
                    'file_path': f"/images/products/internal/originals/{final_filename}",
                    'is_primary': idx == 1,  # Primeira imagem é principal
                    'display_order': idx,
                    'mime_type': 'image/jpeg',
                    'alt_text_pt': f"{product_data['vip_info']['name_pt']} - Imagem {idx}",
                    'alt_text_en': f"{product_data['vip_info']['name_en']} - Image {idx}"
                }
                
                product_images.append(image_record)
                
            log_message(f"Organizadas {len(product_images)} imagens para {ean}", "SUCCESS")
            
        organized_data.extend(product_images)
    
    return organized_data

def generate_database_script(image_data: List[Dict]):
    """Gera script SQL para inserir imagens na BD"""
    log_message("Gerando script SQL...")
    
    script_path = "scripts/insert_vip_images.sql"
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write("-- Script para inserir imagens VIP na BD\n")
        f.write("-- Gerado automaticamente\n")
        f.write(f"-- Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("-- Limpar placeholders existentes\n")
        f.write("DELETE FROM internal_product_images WHERE filename LIKE 'placeholder_%';\n\n")
        
        f.write("-- Inserir imagens reais\n")
        
        for image in image_data:
            f.write(f"""INSERT INTO internal_product_images (
    internal_ean, filename, original_filename, file_path,
    is_primary, display_order, mime_type, alt_text_pt, alt_text_en,
    created_at, updated_at
) VALUES (
    '{image['internal_ean']}',
    '{image['filename']}',
    '{image['original_filename']}',
    '{image['file_path']}',
    {image['is_primary']},
    {image['display_order']},
    '{image['mime_type']}',
    '{image['alt_text_pt'].replace("'", "''")}',
    '{image['alt_text_en'].replace("'", "''")}',
    NOW(),
    NOW()
);\n\n""")
    
    log_message(f"Script SQL gerado: {script_path}", "SUCCESS")
    return script_path

def generate_summary_report(image_data: List[Dict]):
    """Gera relatório resumo da operação"""
    log_message("Gerando relatório resumo...")
    
    # Agrupar por produto
    products = {}
    for image in image_data:
        ean = image['internal_ean']
        if ean not in products:
            products[ean] = []
        products[ean].append(image)
    
    report_path = "scripts/vip_images_final_report.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("🎯 RELATÓRIO FINAL - SISTEMA IMAGENS VIP\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total de produtos processados: {len(products)}\n")
        f.write(f"Total de imagens organizadas: {len(image_data)}\n\n")
        
        f.write("DISTRIBUIÇÃO POR PRODUTO:\n")
        f.write("-" * 30 + "\n")
        
        for ean, images in products.items():
            primary_image = next((img for img in images if img['is_primary']), images[0])
            f.write(f"• {ean}: {len(images)} imagens\n")
            f.write(f"  Nome: {primary_image['alt_text_pt'].split(' - Imagem')[0]}\n")
            f.write(f"  Imagem principal: {primary_image['filename']}\n\n")
        
        f.write("\nESTRUTURA FINAL:\n")
        f.write("-" * 20 + "\n")
        f.write("public/images/products/internal/\n")
        f.write("├── originals/     (imagens originais)\n")  
        f.write("├── medium/        (400x400px - futuro)\n")
        f.write("├── thumbnails/    (150x150px - futuro)\n")
        f.write("└── temp/          (uploads temporários)\n\n")
        
        f.write("PRÓXIMOS PASSOS:\n")
        f.write("-" * 15 + "\n")
        f.write("1. ✅ Imagens organizadas\n")
        f.write("2. ⏳ Aprovar execução SQL (scripts/insert_vip_images.sql)\n")
        f.write("3. ⏳ Executar na base de dados\n")
        f.write("4. ⏳ Validar frontend\n")
        f.write("5. ⏳ Deploy e celebrar! 🎉\n")
    
    log_message(f"Relatório gerado: {report_path}", "SUCCESS")

def main():
    """Função principal"""
    log_message("🚀 INICIANDO FINALIZAÇÃO SISTEMA IMAGENS VIP", "INFO")
    
    try:
        # 1. Criar estrutura de diretórios
        base_path = create_directory_structure()
        
        # 2. Carregar catálogo
        catalog = load_image_catalog()
        if not catalog:
            return 1
        
        # 3. Organizar imagens
        image_data = organize_product_images(catalog, base_path)
        
        if not image_data:
            log_message("Nenhuma imagem foi processada!", "ERROR")
            return 1
        
        # 4. Gerar script SQL
        sql_script = generate_database_script(image_data)
        
        # 5. Gerar relatório
        generate_summary_report(image_data)
        
        log_message("🎉 SISTEMA IMAGENS VIP FINALIZADO COM SUCESSO!", "SUCCESS")
        log_message(f"Total de imagens organizadas: {len(image_data)}")
        log_message(f"Total de produtos processados: {len(set(img['internal_ean'] for img in image_data))}")
        log_message("Verifique o relatório: scripts/vip_images_final_report.txt")
        log_message("Script SQL gerado: scripts/insert_vip_images.sql")
        
        return 0
        
    except Exception as e:
        log_message(f"Erro durante execução: {e}", "ERROR")
        return 1

if __name__ == "__main__":
    exit(main()) 
"""
🎯 VIP Image System Finalizer - Hipótese A
Organiza imagens AliTools na estrutura final do projeto VIP
"""

import json
import os
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any
import psycopg2
from psycopg2.extras import RealDictCursor

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
        "ERROR": "❌",
        "WARNING": "⚠️",
        "PROGRESS": "🔄"
    }
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"{icons.get(level, 'ℹ️')} [{timestamp}] {message}")

def create_directory_structure():
    """Cria estrutura de diretórios para imagens VIP"""
    log_message("Criando estrutura de diretórios VIP...")
    
    base_path = Path("public/images/products/internal")
    directories = [
        base_path,
        base_path / "originals",
        base_path / "thumbnails", 
        base_path / "medium",
        base_path / "large",
        base_path / "temp"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        log_message(f"Diretório criado: {directory}")
    
    return base_path

def load_image_catalog():
    """Carrega catálogo completo de imagens"""
    log_message("Carregando catálogo de imagens...")
    
    catalog_path = "alitools-research/image-catalog/complete_image_catalog.json"
    
    if not os.path.exists(catalog_path):
        log_message(f"Catálogo não encontrado: {catalog_path}", "ERROR")
        return None
    
    with open(catalog_path, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    log_message(f"Catálogo carregado: {len(catalog)} produtos", "SUCCESS")
    return catalog

def organize_product_images(catalog: Dict, base_path: Path):
    """Organiza imagens por produto na estrutura final"""
    log_message("Organizando imagens por produto...")
    
    organized_data = []
    temp_source = Path("temp-alitools-images/por-marca")
    
    # Acessar a seção de produtos do catálogo
    products = catalog.get("products", {})
    
    for ean, product_data in products.items():
            
        log_message(f"Processando {ean}...", "PROGRESS")
        
        # Encontrar pasta do produto
        product_name = product_data['vip_info']['name']
        brand = product_data['vip_info']['brand']
        
        # Procurar pasta no temp
        product_folder = None
        brand_folder = temp_source / brand
        
        if brand_folder.exists():
            for folder in brand_folder.iterdir():
                if folder.is_dir() and ean in folder.name:
                    product_folder = folder
                    break
        
        if not product_folder:
            log_message(f"Pasta não encontrada para {ean}", "WARNING")
            continue
        
        # Processar imagens do produto
        product_images = []
        originals_folder = product_folder / "originals"
        
        if originals_folder.exists():
            # Ordenar imagens por nome para manter ordem
            image_files = sorted([f for f in originals_folder.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']])
            
            for idx, image_file in enumerate(image_files, 1):
                # Nome final padronizado
                final_filename = f"{ean}_{idx:03d}.jpg"
                
                # Caminhos de destino
                dest_original = base_path / "originals" / final_filename
                dest_medium = base_path / "medium" / final_filename
                dest_thumbnail = base_path / "thumbnails" / final_filename
                
                # Copiar imagem original
                shutil.copy2(image_file, dest_original)
                
                # Dados para BD
                image_record = {
                    'internal_ean': ean,
                    'filename': final_filename,
                    'original_filename': image_file.name,
                    'file_path': f"/images/products/internal/originals/{final_filename}",
                    'is_primary': idx == 1,  # Primeira imagem é principal
                    'display_order': idx,
                    'mime_type': 'image/jpeg',
                    'alt_text_pt': f"{product_data['vip_info']['name_pt']} - Imagem {idx}",
                    'alt_text_en': f"{product_data['vip_info']['name_en']} - Image {idx}"
                }
                
                product_images.append(image_record)
                
            log_message(f"Organizadas {len(product_images)} imagens para {ean}", "SUCCESS")
            
        organized_data.extend(product_images)
    
    return organized_data

def generate_database_script(image_data: List[Dict]):
    """Gera script SQL para inserir imagens na BD"""
    log_message("Gerando script SQL...")
    
    script_path = "scripts/insert_vip_images.sql"
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write("-- Script para inserir imagens VIP na BD\n")
        f.write("-- Gerado automaticamente\n")
        f.write(f"-- Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write("-- Limpar placeholders existentes\n")
        f.write("DELETE FROM internal_product_images WHERE filename LIKE 'placeholder_%';\n\n")
        
        f.write("-- Inserir imagens reais\n")
        
        for image in image_data:
            f.write(f"""INSERT INTO internal_product_images (
    internal_ean, filename, original_filename, file_path,
    is_primary, display_order, mime_type, alt_text_pt, alt_text_en,
    created_at, updated_at
) VALUES (
    '{image['internal_ean']}',
    '{image['filename']}',
    '{image['original_filename']}',
    '{image['file_path']}',
    {image['is_primary']},
    {image['display_order']},
    '{image['mime_type']}',
    '{image['alt_text_pt'].replace("'", "''")}',
    '{image['alt_text_en'].replace("'", "''")}',
    NOW(),
    NOW()
);\n\n""")
    
    log_message(f"Script SQL gerado: {script_path}", "SUCCESS")
    return script_path

def generate_summary_report(image_data: List[Dict]):
    """Gera relatório resumo da operação"""
    log_message("Gerando relatório resumo...")
    
    # Agrupar por produto
    products = {}
    for image in image_data:
        ean = image['internal_ean']
        if ean not in products:
            products[ean] = []
        products[ean].append(image)
    
    report_path = "scripts/vip_images_final_report.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("🎯 RELATÓRIO FINAL - SISTEMA IMAGENS VIP\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Total de produtos processados: {len(products)}\n")
        f.write(f"Total de imagens organizadas: {len(image_data)}\n\n")
        
        f.write("DISTRIBUIÇÃO POR PRODUTO:\n")
        f.write("-" * 30 + "\n")
        
        for ean, images in products.items():
            primary_image = next((img for img in images if img['is_primary']), images[0])
            f.write(f"• {ean}: {len(images)} imagens\n")
            f.write(f"  Nome: {primary_image['alt_text_pt'].split(' - Imagem')[0]}\n")
            f.write(f"  Imagem principal: {primary_image['filename']}\n\n")
        
        f.write("\nESTRUTURA FINAL:\n")
        f.write("-" * 20 + "\n")
        f.write("public/images/products/internal/\n")
        f.write("├── originals/     (imagens originais)\n")  
        f.write("├── medium/        (400x400px - futuro)\n")
        f.write("├── thumbnails/    (150x150px - futuro)\n")
        f.write("└── temp/          (uploads temporários)\n\n")
        
        f.write("PRÓXIMOS PASSOS:\n")
        f.write("-" * 15 + "\n")
        f.write("1. ✅ Imagens organizadas\n")
        f.write("2. ⏳ Aprovar execução SQL (scripts/insert_vip_images.sql)\n")
        f.write("3. ⏳ Executar na base de dados\n")
        f.write("4. ⏳ Validar frontend\n")
        f.write("5. ⏳ Deploy e celebrar! 🎉\n")
    
    log_message(f"Relatório gerado: {report_path}", "SUCCESS")

def main():
    """Função principal"""
    log_message("🚀 INICIANDO FINALIZAÇÃO SISTEMA IMAGENS VIP", "INFO")
    
    try:
        # 1. Criar estrutura de diretórios
        base_path = create_directory_structure()
        
        # 2. Carregar catálogo
        catalog = load_image_catalog()
        if not catalog:
            return 1
        
        # 3. Organizar imagens
        image_data = organize_product_images(catalog, base_path)
        
        if not image_data:
            log_message("Nenhuma imagem foi processada!", "ERROR")
            return 1
        
        # 4. Gerar script SQL
        sql_script = generate_database_script(image_data)
        
        # 5. Gerar relatório
        generate_summary_report(image_data)
        
        log_message("🎉 SISTEMA IMAGENS VIP FINALIZADO COM SUCESSO!", "SUCCESS")
        log_message(f"Total de imagens organizadas: {len(image_data)}")
        log_message(f"Total de produtos processados: {len(set(img['internal_ean'] for img in image_data))}")
        log_message("Verifique o relatório: scripts/vip_images_final_report.txt")
        log_message("Script SQL gerado: scripts/insert_vip_images.sql")
        
        return 0
        
    except Exception as e:
        log_message(f"Erro durante execução: {e}", "ERROR")
        return 1

if __name__ == "__main__":
    exit(main()) 