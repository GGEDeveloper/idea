#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AliTools Image Harvester v2.0 🚜
=================================

Scraper otimizado para baixar TODAS as imagens dos produtos AliTools
com logs em tempo real, identificadores VIP consistentes e classificação de imagens.

Melhorias v2.0:
1. ✅ Logs em tempo real (IRT)
2. ✅ Identificadores consistentes com sistema VIP (INT_XXXXX)
3. ✅ Classificação automática de imagens (main, large, medium, small)
"""

import requests
import os
import re
import json
import time
import sys
import hashlib
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Tuple
from bs4 import BeautifulSoup
from PIL import Image
import io
import psycopg2

# Configurações
ALITOOLS_BASE_URL = "https://www.alimamedetools.com"
OUTPUT_BASE_PATH = "alitools-research/imagens-coletadas-v2"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_DELAY = 1

# Conexão com BD para mapear produtos VIP
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Mapeamento produtos descobertos → possíveis identificadores VIP
PRODUTOS_MAPEADOS = [
    {
        'nome_alitools': 'parka-impermiavel-reflectora',
        'url': 'https://www.alimamedetools.com/product-page/parka-impermi%C3%A1vel-reflectora',
        'palavras_chave': ['parka', 'impermeável', 'reflector', 'chuva'],
        'identificador_vip': None  # Será mapeado automaticamente
    },
    {
        'nome_alitools': 'fato-de-chuva-reflector',
        'url': 'https://www.alimamedetools.com/product-page/fato-de-chuva-reflector',
        'palavras_chave': ['fato', 'chuva', 'reflector'],
        'identificador_vip': None
    },
    {
        'nome_alitools': 'luva-nitrile-preta',
        'url': 'https://www.alimamedetools.com/product-page/luva-nitrile-preta-com-nylon-grossa-prof',
        'palavras_chave': ['luva', 'nitrile', 'preta', 'nylon'],
        'identificador_vip': None
    },
    {
        'nome_alitools': 'talocha-de-grosa',
        'url': 'https://www.alimamedetools.com/product-page/talocha-de-grosa-endurecida-120-x-375mm-a3701',
        'palavras_chave': ['talocha', 'grosa', 'espatula'],
        'identificador_vip': None
    },
    {
        'nome_alitools': 'espatula-em-abs',
        'url': 'https://www.alimamedetools.com/product-page/espatula-em-abs-250-mm',
        'palavras_chave': ['espatula', 'abs', 'talocha'],
        'identificador_vip': None
    },
    {
        'nome_alitools': 'serrote-prof-cortar-ferro',
        'url': 'https://www.alimamedetools.com/product-page/serrote-prof-cortar-ferro-12-300-mm',
        'palavras_chave': ['serrote', 'ferro', 'cortar'],
        'identificador_vip': None
    }
]

def log_realtime(message: str, nivel: str = "INFO"):
    """Log em tempo real com flush"""
    timestamp = time.strftime("%H:%M:%S")
    icon_map = {
        "INFO": "ℹ️",
        "SUCCESS": "✅", 
        "WARNING": "⚠️",
        "ERROR": "❌",
        "PROGRESS": "🔄"
    }
    icon = icon_map.get(nivel, "📝")
    print(f"[{timestamp}] {icon} {message}", flush=True)

class AliToolsImageHarvesterV2:
    def __init__(self):
        log_realtime("Inicializando AliTools Image Harvester v2.0", "INFO")
        
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        })
        
        self.downloaded_count = 0
        self.failed_count = 0
        self.results = []
        
        # Criar pasta base
        os.makedirs(OUTPUT_BASE_PATH, exist_ok=True)
        log_realtime(f"Pasta criada: {OUTPUT_BASE_PATH}", "SUCCESS")
        
        # Mapear produtos VIP
        self.mapear_produtos_vip()
    
    def mapear_produtos_vip(self):
        """Mapear produtos AliTools com produtos VIP existentes"""
        log_realtime("Conectando à base de dados VIP para mapeamento...", "PROGRESS")
        
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            # Obter todos os produtos VIP
            cur.execute("""
                SELECT internal_ean, name_pt, name, brand, short_description_pt
                FROM internal_products 
                WHERE is_active = true
                ORDER BY internal_ean
            """)
            
            produtos_vip = cur.fetchall()
            log_realtime(f"Carregados {len(produtos_vip)} produtos VIP da BD", "SUCCESS")
            
            # Tentar mapear cada produto AliTools
            for produto_alitools in PRODUTOS_MAPEADOS:
                melhor_match = None
                melhor_score = 0
                
                for vip_ean, vip_name_pt, vip_name, vip_brand, vip_desc in produtos_vip:
                    score = self.calcular_score_similaridade(produto_alitools, vip_name_pt, vip_name, vip_desc)
                    
                    if score > melhor_score:
                        melhor_score = score
                        melhor_match = vip_ean
                
                if melhor_match and melhor_score > 0.3:  # Threshold de similaridade
                    produto_alitools['identificador_vip'] = melhor_match
                    log_realtime(f"Mapeado: {produto_alitools['nome_alitools']} → {melhor_match} (score: {melhor_score:.2f})", "SUCCESS")
                else:
                    # Gerar identificador baseado no nome
                    hash_nome = hashlib.md5(produto_alitools['nome_alitools'].encode()).hexdigest()[:6].upper()
                    produto_alitools['identificador_vip'] = f"INT_{hash_nome}"
                    log_realtime(f"Gerado ID: {produto_alitools['nome_alitools']} → {produto_alitools['identificador_vip']}", "WARNING")
            
            conn.close()
            
        except Exception as e:
            log_realtime(f"Erro no mapeamento VIP: {e}", "ERROR")
            # Fallback: gerar IDs baseados nos nomes
            for produto in PRODUTOS_MAPEADOS:
                hash_nome = hashlib.md5(produto['nome_alitools'].encode()).hexdigest()[:6].upper()
                produto['identificador_vip'] = f"INT_{hash_nome}"
    
    def calcular_score_similaridade(self, produto_alitools: Dict, vip_name_pt: str, vip_name: str, vip_desc: str) -> float:
        """Calcular score de similaridade entre produto AliTools e VIP"""
        texto_vip = f"{vip_name_pt} {vip_name} {vip_desc or ''}".lower()
        
        score = 0.0
        total_palavras = len(produto_alitools['palavras_chave'])
        
        for palavra in produto_alitools['palavras_chave']:
            if palavra.lower() in texto_vip:
                score += 1.0 / total_palavras
        
        return score
    
    def classificar_imagem(self, width: int, height: int, index: int, total_images: int) -> str:
        """Classificar tipo de imagem baseado em dimensões e posição"""
        # Calcular área da imagem
        area = width * height
        
        # Primeira imagem é sempre main
        if index == 1:
            return "main"
        
        # Classificar por tamanho
        if area >= 640000:  # 800x800 ou maior
            return "large"
        elif area >= 150000:  # 400x375 ou similar
            return "medium"
        elif area >= 10000:   # 100x100 ou similar
            return "small"
        else:
            return "thumb"
    
    def extract_images_from_page(self, product_url: str) -> List[Dict]:
        """Extrair URLs e metadados de imagens"""
        log_realtime(f"Analisando página: {product_url}", "PROGRESS")
        
        try:
            response = self.session.get(product_url, timeout=15)
            if response.status_code != 200:
                log_realtime(f"Erro HTTP {response.status_code}", "ERROR")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            images_data = []
            
            # Encontrar todas as imagens
            img_elements = soup.find_all('img')
            valid_images = []
            
            for img in img_elements:
                src = img.get('src')
                if src and self.is_product_image(src, img):
                    alt = img.get('alt', '')
                    full_url = urljoin(product_url, src)
                    high_quality_url = self.get_high_quality_url(full_url)
                    
                    valid_images.append({
                        'url': high_quality_url,
                        'alt': alt,
                        'original_url': full_url
                    })
            
            # Remover duplicatas mantendo ordem
            seen_urls = set()
            unique_images = []
            for img in valid_images:
                if img['url'] not in seen_urls:
                    seen_urls.add(img['url'])
                    unique_images.append(img)
            
            log_realtime(f"Encontradas {len(unique_images)} imagens únicas", "SUCCESS")
            return unique_images
            
        except Exception as e:
            log_realtime(f"Erro ao analisar página: {e}", "ERROR")
            return []
    
    def is_product_image(self, src: str, img_element) -> bool:
        """Verificar se é imagem de produto baseado nos padrões descobertos"""
        if not src or 'static.wixstatic.com' not in src or '88efbe_' not in src:
            return False
        
        # Filtrar thumbnails muito pequenos
        if any(size in src for size in ['w_32', 'w_45', 'w_16']):
            return False
        
        # Verificar alt text
        alt = img_element.get('alt', '').lower()
        if any(word in alt for word in ['miniatura:', 'logo', 'icon', 'btn']):
            return False
        
        return True
    
    def get_high_quality_url(self, url: str) -> str:
        """Converter para URL de alta qualidade"""
        if '/v1/fill/' in url:
            base_part = url.split('/v1/fill/')[0]
            file_part = url.split('/v1/fill/')[1].split('/')[-1]
            return f"{base_part}/v1/fill/w_800,h_800,al_c,q_95,usm_0.66_1.00_0.01/{file_part}"
        return url
    
    def download_and_classify_image(self, image_data: Dict, vip_id: str, image_index: int, total_images: int) -> Optional[Dict]:
        """Baixar imagem e classificá-la"""
        image_url = image_data['url']
        
        log_realtime(f"Baixando imagem {image_index}/{total_images} para {vip_id}", "PROGRESS")
        
        try:
            response = self.session.get(image_url, timeout=20)
            if response.status_code != 200:
                log_realtime(f"Erro HTTP {response.status_code}", "ERROR")
                return None
            
            # Verificar imagem
            image = Image.open(io.BytesIO(response.content))
            width, height = image.size
            format_type = image.format
            
            # Classificar imagem
            image_type = self.classificar_imagem(width, height, image_index, total_images)
            
            log_realtime(f"Imagem: {width}x{height} ({format_type}) → Tipo: {image_type}", "INFO")
            
            # Criar pasta do produto VIP
            product_dir = os.path.join(OUTPUT_BASE_PATH, vip_id)
            os.makedirs(product_dir, exist_ok=True)
            
            # Nome do arquivo com classificação
            file_extension = self.get_file_extension(image_url, format_type)
            filename = f"{image_index:02d}_{image_type}_{width}x{height}{file_extension}"
            filepath = os.path.join(product_dir, filename)
            
            # Salvar
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            log_realtime(f"Salvo: {filename}", "SUCCESS")
            self.downloaded_count += 1
            
            return {
                'filename': filename,
                'type': image_type,
                'dimensions': f"{width}x{height}",
                'size_bytes': len(response.content),
                'source_url': image_url,
                'alt_text': image_data.get('alt', '')
            }
            
        except Exception as e:
            log_realtime(f"Erro no download: {e}", "ERROR")
            self.failed_count += 1
            return None
    
    def get_file_extension(self, url: str, image_format: str) -> str:
        """Obter extensão do arquivo"""
        format_map = {
            'JPEG': '.jpg',
            'PNG': '.png',
            'WEBP': '.webp',
            'GIF': '.gif'
        }
        return format_map.get(image_format or 'JPEG', '.jpg')
    
    def process_product(self, produto_info: Dict) -> Dict:
        """Processar um produto completo"""
        nome_alitools = produto_info['nome_alitools']
        vip_id = produto_info['identificador_vip']
        product_url = produto_info['url']
        
        log_realtime(f"INICIANDO: {nome_alitools} → {vip_id}", "INFO")
        
        # Extrair imagens
        images_data = self.extract_images_from_page(product_url)
        
        if not images_data:
            log_realtime(f"Nenhuma imagem encontrada para {nome_alitools}", "WARNING")
            return {
                'vip_id': vip_id,
                'nome_alitools': nome_alitools,
                'url': product_url,
                'imagens_encontradas': 0,
                'imagens_baixadas': 0,
                'status': 'sem_imagens'
            }
        
        # Baixar e classificar todas as imagens
        downloaded_files = []
        total_images = len(images_data)
        
        for i, image_data in enumerate(images_data, 1):
            file_info = self.download_and_classify_image(image_data, vip_id, i, total_images)
            if file_info:
                downloaded_files.append(file_info)
            
            time.sleep(0.5)  # Pausa entre downloads
        
        result = {
            'vip_id': vip_id,
            'nome_alitools': nome_alitools,
            'url': product_url,
            'imagens_encontradas': len(images_data),
            'imagens_baixadas': len(downloaded_files),
            'arquivos': downloaded_files,
            'status': 'sucesso' if downloaded_files else 'falha'
        }
        
        log_realtime(f"CONCLUÍDO: {nome_alitools} → {len(downloaded_files)}/{len(images_data)} imagens", "SUCCESS")
        return result
    
    def harvest_all_images(self):
        """Processar todos os produtos"""
        log_realtime("🚜 INICIANDO HARVESTING DE IMAGENS ALITOOLS", "INFO")
        log_realtime(f"📋 {len(PRODUTOS_MAPEADOS)} produtos para processar", "INFO")
        
        for i, produto_info in enumerate(PRODUTOS_MAPEADOS, 1):
            log_realtime(f"{'='*60}", "INFO")
            log_realtime(f"PRODUTO {i}/{len(PRODUTOS_MAPEADOS)}", "INFO")
            
            result = self.process_product(produto_info)
            self.results.append(result)
            
            time.sleep(REQUEST_DELAY)
        
        self.generate_final_report()
    
    def generate_final_report(self):
        """Gerar relatório final"""
        log_realtime("🎉 HARVESTING CONCLUÍDO!", "SUCCESS")
        log_realtime(f"📊 Total produtos: {len(self.results)}", "INFO")
        log_realtime(f"📊 Total imagens baixadas: {self.downloaded_count}", "INFO")
        log_realtime(f"📊 Total falhas: {self.failed_count}", "INFO")
        
        # Estatísticas por tipo de imagem
        type_stats = {}
        for result in self.results:
            for arquivo in result.get('arquivos', []):
                img_type = arquivo['type']
                type_stats[img_type] = type_stats.get(img_type, 0) + 1
        
        log_realtime("📊 Estatísticas por tipo de imagem:", "INFO")
        for img_type, count in type_stats.items():
            log_realtime(f"   • {img_type}: {count} imagens", "INFO")
        
        # Salvar relatório
        report_file = os.path.join(OUTPUT_BASE_PATH, 'relatorio_coleta_v2.json')
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'versao': '2.0',
                'timestamp': time.time(),
                'total_produtos': len(self.results),
                'total_imagens_baixadas': self.downloaded_count,
                'total_falhas': self.failed_count,
                'estatisticas_tipos': type_stats,
                'produtos': self.results
            }, f, indent=2, ensure_ascii=False)
        
        log_realtime(f"💾 Relatório salvo: {report_file}", "SUCCESS")
        log_realtime(f"📁 Imagens em: {OUTPUT_BASE_PATH}", "SUCCESS")

def main():
    print("🚜 ALITOOLS IMAGE HARVESTER V2.0")
    print("=" * 60)
    print("Melhorias v2.0:")
    print("✅ Logs em tempo real")
    print("✅ Identificadores VIP consistentes") 
    print("✅ Classificação automática de imagens")
    print()
    
    confirm = input("🤔 Deseja continuar? (s/N): ").lower().strip()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada")
        return
    
    harvester = AliToolsImageHarvesterV2()
    harvester.harvest_all_images()

if __name__ == "__main__":
    main() 