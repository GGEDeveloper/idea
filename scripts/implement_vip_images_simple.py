#!/usr/bin/env python3
"""
🎯 VIP Images Implementation - SIMPLE & CORRECT
Usa os dados já organizados em temp-alitools-images/
"""

import os
import shutil
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict

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

def create_final_structure():
    """Cria estrutura de destino"""
    log_message("Criando estrutura final...")
    
    base_path = Path("public/images/products/internal")
    base_path.mkdir(parents=True, exist_ok=True)
    
    subdirs = ["originals", "medium", "large", "thumbnails", "temp"]
    for subdir in subdirs:
        (base_path / subdir).mkdir(exist_ok=True)
    
    log_message(f"Estrutura criada em: {base_path}")
    return base_path

def scan_existing_products():
    """Escaneia produtos já organizados"""
    log_message("Escaneando produtos existentes...")
    
    temp_base = Path("temp-alitools-images/por-marca")
    products = []
    
    for brand_folder in temp_base.iterdir():
        if not brand_folder.is_dir():
            continue
            
        log_message(f"Escaneando marca: {brand_folder.name}", "PROGRESS")
        
        for product_folder in brand_folder.iterdir():
            if not product_folder.is_dir():
                continue
                
            # Extrair EAN do nome da pasta
            folder_name = product_folder.name
            ean_match = re.search(r'INT_[A-F0-9]+', folder_name)
            
            if not ean_match:
                log_message(f"EAN não encontrado em: {folder_name}", "WARNING")
                continue
            
            ean = ean_match.group()
            
            # Verificar se tem produto_info.txt
            info_file = product_folder / "produto_info.txt"
            if not info_file.exists():
                log_message(f"produto_info.txt não encontrado para {ean}", "WARNING")
                continue
            
            # Verificar pasta originals
            originals_folder = product_folder / "originals"
            if not originals_folder.exists():
                log_message(f"Pasta originals não encontrada para {ean}", "WARNING")
                continue
            
            # Contar imagens
            image_files = [f for f in originals_folder.iterdir() 
                          if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
            
            if not image_files:
                log_message(f"Nenhuma imagem encontrada para {ean}", "WARNING")
                continue
            
            products.append({
                'ean': ean,
                'folder': product_folder,
                'info_file': info_file,
                'originals_folder': originals_folder,
                'image_count': len(image_files),
                'images': sorted(image_files, key=lambda x: x.name)
            })
    
    log_message(f"Encontrados {len(products)} produtos válidos", "SUCCESS")
    return products

def read_product_info(info_file: Path) -> Dict:
    """Lê informações do produto do ficheiro info"""
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extrair informações básicas
        info = {}
        
        # EAN
        ean_match = re.search(r'EAN: (INT_[A-F0-9]+)', content)
        info['ean'] = ean_match.group(1) if ean_match else None
        
        # Nome PT
        name_pt_match = re.search(r'Nome PT: (.+)', content)
        info['name_pt'] = name_pt_match.group(1).strip() if name_pt_match else None
        
        # Nome EN
        name_en_match = re.search(r'Nome EN: (.+)', content)
        info['name_en'] = name_en_match.group(1).strip() if name_en_match else None
        
        # Marca
        marca_match = re.search(r'Marca: (.+)', content)
        info['brand'] = marca_match.group(1).strip() if marca_match else None
        
        # Total de imagens
        total_match = re.search(r'Total Imagens: (\d+)', content)
        info['total_images'] = int(total_match.group(1)) if total_match else 0
        
        return info
        
    except Exception as e:
        log_message(f"Erro ao ler {info_file}: {e}", "ERROR")
        return {}

def copy_images_and_generate_records(products: List[Dict], dest_base: Path):
    """Copia imagens e gera registos para BD"""
    log_message("Copiando imagens e gerando registos...")
    
    db_records = []
    copied_count = 0
    
    for product in products:
        ean = product['ean']
        log_message(f"Processando {ean}...", "PROGRESS")
        
        # Ler informações do produto
        product_info = read_product_info(product['info_file'])
        
        if not product_info.get('ean'):
            log_message(f"Informações inválidas para {ean}", "WARNING")
            continue
        
        # Processar cada imagem
        for idx, image_file in enumerate(product['images'], 1):
            # Nome padronizado
            extension = image_file.suffix.lower()
            final_filename = f"{ean}_{idx:03d}{extension}"
            
            # Copiar imagem original
            dest_path = dest_base / "originals" / final_filename
            try:
                shutil.copy2(image_file, dest_path)
                copied_count += 1
            except Exception as e:
                log_message(f"Erro ao copiar {image_file}: {e}", "ERROR")
                continue
            
            # Criar registo para BD
            record = {
                'internal_ean': ean,
                'filename': final_filename,
                'original_filename': image_file.name,
                'file_path': f"/images/products/internal/originals/{final_filename}",
                'is_primary': idx == 1,  # Primeira imagem é principal
                'display_order': idx,
                'mime_type': 'image/jpeg' if extension in ['.jpg', '.jpeg'] else f'image/{extension[1:]}',
                'alt_text_pt': f"{product_info.get('name_pt', ean)} - Imagem {idx}",
                'alt_text_en': f"{product_info.get('name_en', ean)} - Image {idx}"
            }
            
            db_records.append(record)
    
    log_message(f"Copiadas {copied_count} imagens", "SUCCESS")
    return db_records

def generate_sql_script(records: List[Dict]):
    """Gera script SQL final"""
    log_message("Gerando script SQL...")
    
    script_path = "scripts/insert_vip_images_final.sql"
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write("-- 🎯 SCRIPT FINAL - IMAGENS VIP\n")
        f.write("-- Gerado automaticamente dos dados temp-alitools-images/\n")
        f.write(f"-- Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Total de registos: {len(records)}\n\n")
        
        f.write("BEGIN;\n\n")
        
        # Limpar placeholders existentes
        f.write("-- Limpar placeholders\n")
        f.write("DELETE FROM internal_product_images WHERE filename LIKE 'placeholder_%';\n\n")
        
        # Inserir imagens reais
        f.write("-- Inserir imagens VIP reais\n")
        
        for record in records:
            alt_text_pt = record['alt_text_pt'].replace("'", "''")
            alt_text_en = record['alt_text_en'].replace("'", "''")
            
            f.write(f"""INSERT INTO internal_product_images (
    internal_ean, filename, original_filename, file_path,
    is_primary, display_order, mime_type, alt_text_pt, alt_text_en,
    created_at, updated_at
) VALUES (
    '{record['internal_ean']}',
    '{record['filename']}',
    '{record['original_filename']}',
    '{record['file_path']}',
    {record['is_primary']},
    {record['display_order']},
    '{record['mime_type']}',
    '{alt_text_pt}',
    '{alt_text_en}',
    NOW(),
    NOW()
);

""")
        
        f.write("COMMIT;\n")
    
    log_message(f"Script SQL gerado: {script_path}", "SUCCESS")
    return script_path

def generate_final_report(records: List[Dict]):
    """Relatório final"""
    log_message("Gerando relatório final...")
    
    # Estatísticas
    total_products = len(set(r['internal_ean'] for r in records))
    total_images = len(records)
    
    # Agrupar por produto
    by_product = {}
    for record in records:
        ean = record['internal_ean']
        if ean not in by_product:
            by_product[ean] = []
        by_product[ean].append(record)
    
    report_path = "scripts/vip_images_implementation_report.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("🎉 IMPLEMENTAÇÃO VIP IMAGES - RELATÓRIO FINAL\n")
        f.write("=" * 55 + "\n\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Fonte: temp-alitools-images/ (dados já organizados)\n\n")
        
        f.write("📊 ESTATÍSTICAS GERAIS\n")
        f.write("-" * 25 + "\n")
        f.write(f"Total de produtos: {total_products}\n")
        f.write(f"Total de imagens: {total_images}\n")
        f.write(f"Média de imagens por produto: {total_images/total_products:.1f}\n\n")
        
        f.write("📁 DISTRIBUIÇÃO POR PRODUTO (amostra)\n")
        f.write("-" * 40 + "\n")
        
        for i, (ean, images) in enumerate(list(by_product.items())[:10]):
            primary = next((img for img in images if img['is_primary']), images[0])
            name = primary['alt_text_pt'].split(' - Imagem')[0]
            f.write(f"• {ean}: {len(images)} imagens\n")
            f.write(f"  {name}\n")
            f.write(f"  Principal: {primary['filename']}\n\n")
        
        if total_products > 10:
            f.write(f"... e mais {total_products - 10} produtos\n\n")
        
        f.write("🚀 IMPLEMENTAÇÃO COMPLETA\n")
        f.write("-" * 30 + "\n")
        f.write("✅ Estrutura de ficheiros criada\n")
        f.write("✅ Imagens copiadas para estrutura final\n")
        f.write("✅ Script SQL gerado\n")
        f.write("⏳ Pronto para execução na BD\n\n")
        
        f.write("📋 PRÓXIMOS PASSOS\n")
        f.write("-" * 20 + "\n")
        f.write("1. Executar: scripts/insert_vip_images_final.sql\n")
        f.write("2. Validar frontend\n")
        f.write("3. Deploy e celebrar! 🎉\n")
    
    log_message(f"Relatório gerado: {report_path}", "SUCCESS")

def main():
    """Implementação principal"""
    log_message("🚀 IMPLEMENTAÇÃO VIP IMAGES - ESTRATÉGIA CORRETA", "INFO")
    
    try:
        # 1. Criar estrutura final
        dest_base = create_final_structure()
        
        # 2. Escanear produtos existentes
        products = scan_existing_products()
        
        if not products:
            log_message("Nenhum produto encontrado!", "ERROR")
            return 1
        
        # 3. Copiar imagens e gerar registos
        records = copy_images_and_generate_records(products, dest_base)
        
        if not records:
            log_message("Nenhuma imagem processada!", "ERROR")
            return 1
        
        # 4. Gerar script SQL
        sql_script = generate_sql_script(records)
        
        # 5. Gerar relatório
        generate_final_report(records)
        
        log_message("🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!", "SUCCESS")
        log_message(f"Produtos processados: {len(set(r['internal_ean'] for r in records))}")
        log_message(f"Imagens organizadas: {len(records)}")
        log_message("Próximo passo: Executar SQL na base de dados")
        
        return 0
        
    except Exception as e:
        log_message(f"Erro durante implementação: {e}", "ERROR")
        return 1

if __name__ == "__main__":
    exit(main()) 
"""
🎯 VIP Images Implementation - SIMPLE & CORRECT
Usa os dados já organizados em temp-alitools-images/
"""

import os
import shutil
import re
from datetime import datetime
from pathlib import Path
from typing import List, Dict

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

def create_final_structure():
    """Cria estrutura de destino"""
    log_message("Criando estrutura final...")
    
    base_path = Path("public/images/products/internal")
    base_path.mkdir(parents=True, exist_ok=True)
    
    subdirs = ["originals", "medium", "large", "thumbnails", "temp"]
    for subdir in subdirs:
        (base_path / subdir).mkdir(exist_ok=True)
    
    log_message(f"Estrutura criada em: {base_path}")
    return base_path

def scan_existing_products():
    """Escaneia produtos já organizados"""
    log_message("Escaneando produtos existentes...")
    
    temp_base = Path("temp-alitools-images/por-marca")
    products = []
    
    for brand_folder in temp_base.iterdir():
        if not brand_folder.is_dir():
            continue
            
        log_message(f"Escaneando marca: {brand_folder.name}", "PROGRESS")
        
        for product_folder in brand_folder.iterdir():
            if not product_folder.is_dir():
                continue
                
            # Extrair EAN do nome da pasta
            folder_name = product_folder.name
            ean_match = re.search(r'INT_[A-F0-9]+', folder_name)
            
            if not ean_match:
                log_message(f"EAN não encontrado em: {folder_name}", "WARNING")
                continue
            
            ean = ean_match.group()
            
            # Verificar se tem produto_info.txt
            info_file = product_folder / "produto_info.txt"
            if not info_file.exists():
                log_message(f"produto_info.txt não encontrado para {ean}", "WARNING")
                continue
            
            # Verificar pasta originals
            originals_folder = product_folder / "originals"
            if not originals_folder.exists():
                log_message(f"Pasta originals não encontrada para {ean}", "WARNING")
                continue
            
            # Contar imagens
            image_files = [f for f in originals_folder.iterdir() 
                          if f.is_file() and f.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp']]
            
            if not image_files:
                log_message(f"Nenhuma imagem encontrada para {ean}", "WARNING")
                continue
            
            products.append({
                'ean': ean,
                'folder': product_folder,
                'info_file': info_file,
                'originals_folder': originals_folder,
                'image_count': len(image_files),
                'images': sorted(image_files, key=lambda x: x.name)
            })
    
    log_message(f"Encontrados {len(products)} produtos válidos", "SUCCESS")
    return products

def read_product_info(info_file: Path) -> Dict:
    """Lê informações do produto do ficheiro info"""
    try:
        with open(info_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extrair informações básicas
        info = {}
        
        # EAN
        ean_match = re.search(r'EAN: (INT_[A-F0-9]+)', content)
        info['ean'] = ean_match.group(1) if ean_match else None
        
        # Nome PT
        name_pt_match = re.search(r'Nome PT: (.+)', content)
        info['name_pt'] = name_pt_match.group(1).strip() if name_pt_match else None
        
        # Nome EN
        name_en_match = re.search(r'Nome EN: (.+)', content)
        info['name_en'] = name_en_match.group(1).strip() if name_en_match else None
        
        # Marca
        marca_match = re.search(r'Marca: (.+)', content)
        info['brand'] = marca_match.group(1).strip() if marca_match else None
        
        # Total de imagens
        total_match = re.search(r'Total Imagens: (\d+)', content)
        info['total_images'] = int(total_match.group(1)) if total_match else 0
        
        return info
        
    except Exception as e:
        log_message(f"Erro ao ler {info_file}: {e}", "ERROR")
        return {}

def copy_images_and_generate_records(products: List[Dict], dest_base: Path):
    """Copia imagens e gera registos para BD"""
    log_message("Copiando imagens e gerando registos...")
    
    db_records = []
    copied_count = 0
    
    for product in products:
        ean = product['ean']
        log_message(f"Processando {ean}...", "PROGRESS")
        
        # Ler informações do produto
        product_info = read_product_info(product['info_file'])
        
        if not product_info.get('ean'):
            log_message(f"Informações inválidas para {ean}", "WARNING")
            continue
        
        # Processar cada imagem
        for idx, image_file in enumerate(product['images'], 1):
            # Nome padronizado
            extension = image_file.suffix.lower()
            final_filename = f"{ean}_{idx:03d}{extension}"
            
            # Copiar imagem original
            dest_path = dest_base / "originals" / final_filename
            try:
                shutil.copy2(image_file, dest_path)
                copied_count += 1
            except Exception as e:
                log_message(f"Erro ao copiar {image_file}: {e}", "ERROR")
                continue
            
            # Criar registo para BD
            record = {
                'internal_ean': ean,
                'filename': final_filename,
                'original_filename': image_file.name,
                'file_path': f"/images/products/internal/originals/{final_filename}",
                'is_primary': idx == 1,  # Primeira imagem é principal
                'display_order': idx,
                'mime_type': 'image/jpeg' if extension in ['.jpg', '.jpeg'] else f'image/{extension[1:]}',
                'alt_text_pt': f"{product_info.get('name_pt', ean)} - Imagem {idx}",
                'alt_text_en': f"{product_info.get('name_en', ean)} - Image {idx}"
            }
            
            db_records.append(record)
    
    log_message(f"Copiadas {copied_count} imagens", "SUCCESS")
    return db_records

def generate_sql_script(records: List[Dict]):
    """Gera script SQL final"""
    log_message("Gerando script SQL...")
    
    script_path = "scripts/insert_vip_images_final.sql"
    
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write("-- 🎯 SCRIPT FINAL - IMAGENS VIP\n")
        f.write("-- Gerado automaticamente dos dados temp-alitools-images/\n")
        f.write(f"-- Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Total de registos: {len(records)}\n\n")
        
        f.write("BEGIN;\n\n")
        
        # Limpar placeholders existentes
        f.write("-- Limpar placeholders\n")
        f.write("DELETE FROM internal_product_images WHERE filename LIKE 'placeholder_%';\n\n")
        
        # Inserir imagens reais
        f.write("-- Inserir imagens VIP reais\n")
        
        for record in records:
            alt_text_pt = record['alt_text_pt'].replace("'", "''")
            alt_text_en = record['alt_text_en'].replace("'", "''")
            
            f.write(f"""INSERT INTO internal_product_images (
    internal_ean, filename, original_filename, file_path,
    is_primary, display_order, mime_type, alt_text_pt, alt_text_en,
    created_at, updated_at
) VALUES (
    '{record['internal_ean']}',
    '{record['filename']}',
    '{record['original_filename']}',
    '{record['file_path']}',
    {record['is_primary']},
    {record['display_order']},
    '{record['mime_type']}',
    '{alt_text_pt}',
    '{alt_text_en}',
    NOW(),
    NOW()
);

""")
        
        f.write("COMMIT;\n")
    
    log_message(f"Script SQL gerado: {script_path}", "SUCCESS")
    return script_path

def generate_final_report(records: List[Dict]):
    """Relatório final"""
    log_message("Gerando relatório final...")
    
    # Estatísticas
    total_products = len(set(r['internal_ean'] for r in records))
    total_images = len(records)
    
    # Agrupar por produto
    by_product = {}
    for record in records:
        ean = record['internal_ean']
        if ean not in by_product:
            by_product[ean] = []
        by_product[ean].append(record)
    
    report_path = "scripts/vip_images_implementation_report.txt"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("🎉 IMPLEMENTAÇÃO VIP IMAGES - RELATÓRIO FINAL\n")
        f.write("=" * 55 + "\n\n")
        f.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Fonte: temp-alitools-images/ (dados já organizados)\n\n")
        
        f.write("📊 ESTATÍSTICAS GERAIS\n")
        f.write("-" * 25 + "\n")
        f.write(f"Total de produtos: {total_products}\n")
        f.write(f"Total de imagens: {total_images}\n")
        f.write(f"Média de imagens por produto: {total_images/total_products:.1f}\n\n")
        
        f.write("📁 DISTRIBUIÇÃO POR PRODUTO (amostra)\n")
        f.write("-" * 40 + "\n")
        
        for i, (ean, images) in enumerate(list(by_product.items())[:10]):
            primary = next((img for img in images if img['is_primary']), images[0])
            name = primary['alt_text_pt'].split(' - Imagem')[0]
            f.write(f"• {ean}: {len(images)} imagens\n")
            f.write(f"  {name}\n")
            f.write(f"  Principal: {primary['filename']}\n\n")
        
        if total_products > 10:
            f.write(f"... e mais {total_products - 10} produtos\n\n")
        
        f.write("🚀 IMPLEMENTAÇÃO COMPLETA\n")
        f.write("-" * 30 + "\n")
        f.write("✅ Estrutura de ficheiros criada\n")
        f.write("✅ Imagens copiadas para estrutura final\n")
        f.write("✅ Script SQL gerado\n")
        f.write("⏳ Pronto para execução na BD\n\n")
        
        f.write("📋 PRÓXIMOS PASSOS\n")
        f.write("-" * 20 + "\n")
        f.write("1. Executar: scripts/insert_vip_images_final.sql\n")
        f.write("2. Validar frontend\n")
        f.write("3. Deploy e celebrar! 🎉\n")
    
    log_message(f"Relatório gerado: {report_path}", "SUCCESS")

def main():
    """Implementação principal"""
    log_message("🚀 IMPLEMENTAÇÃO VIP IMAGES - ESTRATÉGIA CORRETA", "INFO")
    
    try:
        # 1. Criar estrutura final
        dest_base = create_final_structure()
        
        # 2. Escanear produtos existentes
        products = scan_existing_products()
        
        if not products:
            log_message("Nenhum produto encontrado!", "ERROR")
            return 1
        
        # 3. Copiar imagens e gerar registos
        records = copy_images_and_generate_records(products, dest_base)
        
        if not records:
            log_message("Nenhuma imagem processada!", "ERROR")
            return 1
        
        # 4. Gerar script SQL
        sql_script = generate_sql_script(records)
        
        # 5. Gerar relatório
        generate_final_report(records)
        
        log_message("🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!", "SUCCESS")
        log_message(f"Produtos processados: {len(set(r['internal_ean'] for r in records))}")
        log_message(f"Imagens organizadas: {len(records)}")
        log_message("Próximo passo: Executar SQL na base de dados")
        
        return 0
        
    except Exception as e:
        log_message(f"Erro durante implementação: {e}", "ERROR")
        return 1

if __name__ == "__main__":
    exit(main()) 