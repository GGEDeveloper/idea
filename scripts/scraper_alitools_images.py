#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AliTools Image Scraper - OUTSIDE THE BOX! 🎯
=============================================

Este script faz scraping das imagens dos produtos diretamente do site da AliTools
e organiza-as para uso no sistema VIP.

Funcionalidades:
1. Scraping de páginas de produtos da AliTools
2. Download de imagens em alta qualidade
3. Redimensionamento automático (thumbnails, medium, large)
4. Mapeamento com produtos VIP existentes
5. Organização no sistema de ficheiros do projeto
"""

import requests
import os
import re
import json
import time
import hashlib
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Tuple
import psycopg2
from bs4 import BeautifulSoup
from PIL import Image
import io

# Configurações
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
ALITOOLS_BASE_URL = "https://www.alimamedetools.com"
IMAGE_BASE_PATH = "public/images/products/internal"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_DELAY = 2  # Segundos entre requests (ser respeitoso)

class AliToolsImageScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        self.downloaded_images = []
        self.failed_downloads = []
        
        # Criar diretórios se não existirem
        self.create_directories()
    
    def create_directories(self):
        """Criar estrutura de diretórios para imagens"""
        directories = [
            f"{IMAGE_BASE_PATH}/originals",
            f"{IMAGE_BASE_PATH}/thumbnails", 
            f"{IMAGE_BASE_PATH}/medium",
            f"{IMAGE_BASE_PATH}/large",
            f"{IMAGE_BASE_PATH}/temp"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            print(f"📁 Diretório criado/verificado: {directory}")
    
    def get_vip_products(self) -> List[Dict]:
        """Obter lista de produtos VIP da base de dados"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            cur.execute('''
                SELECT internal_ean, name_pt, name, brand, short_description_pt
                FROM internal_products 
                WHERE is_active = true
                ORDER BY brand, name_pt
            ''')
            
            products = []
            for row in cur.fetchall():
                products.append({
                    'ean': row[0],
                    'name_pt': row[1], 
                    'name_original': row[2],
                    'brand': row[3],
                    'description': row[4]
                })
            
            conn.close()
            print(f"📋 {len(products)} produtos VIP carregados da BD")
            return products
            
        except Exception as e:
            print(f"❌ Erro ao carregar produtos VIP: {e}")
            return []
    
    def search_product_on_alitools(self, product_name: str, brand: str) -> Optional[str]:
        """Procurar produto no site da AliTools"""
        try:
            # Limpar nome do produto para busca
            search_terms = self.clean_search_terms(product_name, brand)
            
            print(f"🔍 Procurando: {search_terms}")
            
            # Tentar diferentes estratégias de busca
            search_urls = [
                f"{ALITOOLS_BASE_URL}/search-results-page?q={search_terms}",
                f"{ALITOOLS_BASE_URL}/produtos"  # Página de produtos geral
            ]
            
            for search_url in search_urls:
                try:
                    response = self.session.get(search_url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Procurar links de produtos
                        product_links = self.extract_product_links(soup, search_terms)
                        if product_links:
                            return product_links[0]  # Retornar primeiro match
                            
                except Exception as e:
                    print(f"⚠️ Erro na busca {search_url}: {e}")
                    continue
                
                time.sleep(REQUEST_DELAY)
            
            return None
            
        except Exception as e:
            print(f"❌ Erro na busca do produto: {e}")
            return None
    
    def clean_search_terms(self, product_name: str, brand: str) -> str:
        """Limpar e otimizar termos de busca"""
        # Remover caracteres especiais e normalizar
        terms = re.sub(r'[^\w\s]', ' ', product_name.lower())
        terms = re.sub(r'\s+', ' ', terms).strip()
        
        # Palavras-chave importantes para manter
        keywords = ['proteção', 'segurança', 'trabalho', 'profissional', 'resistente']
        
        # Extrair palavras relevantes
        words = terms.split()
        relevant_words = [w for w in words if len(w) > 3 or w in keywords]
        
        # Adicionar marca se for relevante
        if brand and brand.lower() not in ['genérico', 'alitools']:
            relevant_words.insert(0, brand.lower())
        
        return '+'.join(relevant_words[:5])  # Máximo 5 termos
    
    def extract_product_links(self, soup: BeautifulSoup, search_terms: str) -> List[str]:
        """Extrair links de produtos da página"""
        links = []
        
        # Diferentes seletores para links de produtos
        selectors = [
            'a[href*="/product-page/"]',
            'a[href*="/produto/"]', 
            'a[href*="/p/"]',
            '.product-item a',
            '.product-link',
            '[data-hook="product-link"]'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                href = element.get('href')
                if href:
                    full_url = urljoin(ALITOOLS_BASE_URL, href)
                    if full_url not in links:
                        links.append(full_url)
        
        # Filtrar por relevância se necessário
        if search_terms:
            relevant_links = []
            terms = search_terms.replace('+', ' ').split()
            
            for link in links:
                link_text = link.lower()
                if any(term in link_text for term in terms):
                    relevant_links.append(link)
            
            return relevant_links if relevant_links else links[:3]
        
        return links[:5]  # Máximo 5 links
    
    def scrape_product_images(self, product_url: str) -> List[str]:
        """Fazer scraping das imagens de uma página de produto"""
        try:
            print(f"🔍 Analisando página: {product_url}")
            
            response = self.session.get(product_url, timeout=10)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            image_urls = []
            
            # Múltiplos seletores para encontrar imagens de produtos
            image_selectors = [
                'img[data-hook="product-image"]',
                '.product-image img',
                '.gallery-image img',
                '.main-image img',
                'img[src*="product"]',
                'img[alt*="produto"]',
                'img[alt*="product"]',
                '.wix-image img',
                '[data-hook="gallery"] img'
            ]
            
            for selector in image_selectors:
                images = soup.select(selector)
                for img in images:
                    src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                    if src:
                        # Resolver URL relativa
                        full_url = urljoin(product_url, src)
                        
                        # Filtrar URLs de imagem válidas
                        if self.is_valid_image_url(full_url):
                            if full_url not in image_urls:
                                image_urls.append(full_url)
            
            print(f"🖼️ Encontradas {len(image_urls)} imagens")
            for i, url in enumerate(image_urls, 1):
                print(f"   {i}. {url}")
            
            return image_urls
            
        except Exception as e:
            print(f"❌ Erro no scraping da página: {e}")
            return []
    
    def is_valid_image_url(self, url: str) -> bool:
        """Verificar se URL é uma imagem válida"""
        if not url:
            return False
        
        # Extensões de imagem válidas
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        
        # Verificar extensão
        url_lower = url.lower()
        if any(ext in url_lower for ext in valid_extensions):
            return True
        
        # URLs Wix específicas (formato especial)
        if 'static.wixstatic.com' in url or 'wix.com' in url:
            return True
            
        # Excluir URLs obviamente inválidas
        invalid_patterns = ['logo', 'icon', 'banner', 'background', 'btn']
        if any(pattern in url_lower for pattern in invalid_patterns):
            return False
            
        return True
    
    def download_image(self, image_url: str, product_ean: str, image_index: int) -> Optional[str]:
        """Baixar e processar uma imagem"""
        try:
            print(f"⬇️ Baixando imagem {image_index} para {product_ean}")
            
            response = self.session.get(image_url, timeout=15)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return None
            
            # Verificar se é uma imagem válida
            try:
                image = Image.open(io.BytesIO(response.content))
                image.verify()  # Verificar integridade
            except Exception:
                print(f"❌ Arquivo não é uma imagem válida")
                return None
            
            # Reabrir imagem para processamento
            image = Image.open(io.BytesIO(response.content))
            
            # Gerar nome do arquivo
            extension = self.get_image_extension(image_url, image.format)
            filename = f"{product_ean}_{image_index:02d}{extension}"
            
            # Salvar imagem original
            original_path = f"{IMAGE_BASE_PATH}/originals/{filename}"
            image.save(original_path, format=image.format, quality=95)
            
            # Criar redimensionamentos
            self.create_resized_versions(image, filename)
            
            print(f"✅ Imagem salva: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ Erro no download da imagem: {e}")
            return None
    
    def get_image_extension(self, url: str, image_format: str) -> str:
        """Obter extensão correta da imagem"""
        if image_format:
            format_map = {
                'JPEG': '.jpg',
                'PNG': '.png', 
                'WEBP': '.webp',
                'GIF': '.gif'
            }
            return format_map.get(image_format.upper(), '.jpg')
        
        # Fallback baseado na URL
        if '.png' in url.lower():
            return '.png'
        elif '.webp' in url.lower():
            return '.webp'
        elif '.gif' in url.lower():
            return '.gif'
        else:
            return '.jpg'
    
    def create_resized_versions(self, image: Image.Image, filename: str):
        """Criar versões redimensionadas da imagem"""
        try:
            # Converter para RGB se necessário
            if image.mode in ['RGBA', 'P']:
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = rgb_image
            
            # Tamanhos alvo
            sizes = {
                'thumbnails': (150, 150),
                'medium': (400, 400),
                'large': (800, 800)
            }
            
            for size_name, (width, height) in sizes.items():
                # Redimensionar mantendo aspecto
                resized = image.copy()
                resized.thumbnail((width, height), Image.Resampling.LANCZOS)
                
                # Criar canvas quadrado com fundo branco
                canvas = Image.new('RGB', (width, height), (255, 255, 255))
                
                # Centralizar imagem no canvas
                x = (width - resized.width) // 2
                y = (height - resized.height) // 2
                canvas.paste(resized, (x, y))
                
                # Salvar
                size_path = f"{IMAGE_BASE_PATH}/{size_name}/{filename}"
                canvas.save(size_path, format='JPEG', quality=85)
                
        except Exception as e:
            print(f"⚠️ Erro ao criar redimensionamentos: {e}")
    
    def update_database(self, product_ean: str, image_filename: str, is_primary: bool = False):
        """Atualizar base de dados com informações da imagem"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            # Inserir registo da imagem
            cur.execute('''
                INSERT INTO internal_product_images 
                (internal_ean, filename, original_filename, file_path, mime_type, is_primary, display_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (internal_ean, filename) DO NOTHING
            ''', (
                product_ean,
                image_filename,
                image_filename,
                f"/images/products/internal/originals/{image_filename}",
                "image/jpeg",
                is_primary,
                0 if is_primary else 999
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"⚠️ Erro ao atualizar BD: {e}")
    
    def process_products(self, limit: int = 10):
        """Processar produtos VIP e baixar imagens"""
        print(f"🚀 Iniciando scraping de imagens AliTools - OUTSIDE THE BOX!")
        print("=" * 60)
        
        # Obter produtos VIP
        vip_products = self.get_vip_products()
        if not vip_products:
            print("❌ Nenhum produto VIP encontrado")
            return
        
        # Processar produtos (limitado)
        processed = 0
        for product in vip_products[:limit]:
            if processed >= limit:
                break
                
            print(f"\n🎯 Processando produto {processed + 1}/{min(limit, len(vip_products))}")
            print(f"   EAN: {product['ean']}")
            print(f"   Nome: {product['name_pt']}")
            print(f"   Marca: {product['brand']}")
            
            # Verificar se já tem imagens
            if self.has_existing_images(product['ean']):
                print(f"⏭️ Produto já tem imagens, pulando...")
                processed += 1
                continue
            
            # Procurar produto no site
            product_url = self.search_product_on_alitools(
                product['name_pt'], 
                product['brand']
            )
            
            if not product_url:
                print(f"❌ Produto não encontrado no site")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Produto não encontrado no site'
                })
                processed += 1
                continue
            
            # Fazer scraping das imagens
            image_urls = self.scrape_product_images(product_url)
            if not image_urls:
                print(f"❌ Nenhuma imagem encontrada")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Nenhuma imagem encontrada'
                })
                processed += 1
                continue
            
            # Baixar imagens
            downloaded_count = 0
            for i, image_url in enumerate(image_urls[:3], 1):  # Máximo 3 imagens
                filename = self.download_image(image_url, product['ean'], i)
                if filename:
                    self.update_database(product['ean'], filename, is_primary=(i == 1))
                    downloaded_count += 1
                    self.downloaded_images.append({
                        'ean': product['ean'],
                        'filename': filename,
                        'source_url': image_url
                    })
                
                time.sleep(1)  # Pausa entre downloads
            
            if downloaded_count > 0:
                print(f"✅ {downloaded_count} imagens baixadas com sucesso")
            else:
                print(f"❌ Falha no download das imagens")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Falha no download'
                })
            
            processed += 1
            time.sleep(REQUEST_DELAY)  # Pausa entre produtos
        
        # Relatório final
        self.generate_report()
    
    def has_existing_images(self, product_ean: str) -> bool:
        """Verificar se produto já tem imagens"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            cur.execute('''
                SELECT COUNT(*) FROM internal_product_images 
                WHERE internal_ean = %s
            ''', (product_ean,))
            
            count = cur.fetchone()[0]
            conn.close()
            
            return count > 0
            
        except Exception:
            return False
    
    def generate_report(self):
        """Gerar relatório final da operação"""
        print(f"\n🎉 RELATÓRIO FINAL - SCRAPING ALITOOLS")
        print("=" * 60)
        print(f"✅ Imagens baixadas com sucesso: {len(self.downloaded_images)}")
        print(f"❌ Produtos com falha: {len(self.failed_downloads)}")
        
        if self.downloaded_images:
            print(f"\n✅ SUCESSOS:")
            for img in self.downloaded_images:
                print(f"   • {img['ean']}: {img['filename']}")
        
        if self.failed_downloads:
            print(f"\n❌ FALHAS:")
            for fail in self.failed_downloads:
                print(f"   • {fail['ean']}: {fail['reason']}")
        
        # Salvar relatório JSON
        report = {
            'timestamp': time.time(),
            'downloaded_images': self.downloaded_images,
            'failed_downloads': self.failed_downloads,
            'total_success': len(self.downloaded_images),
            'total_failures': len(self.failed_downloads)
        }
        
        with open('alitools_scraping_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Relatório salvo em: alitools_scraping_report.json")

def main():
    """Função principal"""
    print("🎯 ALITOOLS IMAGE SCRAPER - OUTSIDE THE BOX!")
    print("=" * 60)
    print("Este script vai fazer scraping das imagens dos produtos")
    print("diretamente do site da AliTools e organizá-las para o sistema VIP.")
    print()
    
    # Confirmar operação
    confirm = input("🤔 Deseja continuar? (s/N): ").lower().strip()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada pelo utilizador")
        return
    
    # Número de produtos a processar
    try:
        limit = int(input("📊 Quantos produtos processar? (padrão: 10): ") or "10")
    except ValueError:
        limit = 10
    
    print(f"\n🚀 Iniciando scraping de {limit} produtos...")
    
    # Executar scraper
    scraper = AliToolsImageScraper()
    scraper.process_products(limit=limit)
    
    print(f"\n🎉 Scraping concluído!")

if __name__ == "__main__":
    main()
# -*- coding: utf-8 -*-
"""
AliTools Image Scraper - OUTSIDE THE BOX! 🎯
=============================================

Este script faz scraping das imagens dos produtos diretamente do site da AliTools
e organiza-as para uso no sistema VIP.

Funcionalidades:
1. Scraping de páginas de produtos da AliTools
2. Download de imagens em alta qualidade
3. Redimensionamento automático (thumbnails, medium, large)
4. Mapeamento com produtos VIP existentes
5. Organização no sistema de ficheiros do projeto
"""

import requests
import os
import re
import json
import time
import hashlib
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional, Tuple
import psycopg2
from bs4 import BeautifulSoup
from PIL import Image
import io

# Configurações
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
ALITOOLS_BASE_URL = "https://www.alimamedetools.com"
IMAGE_BASE_PATH = "public/images/products/internal"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_DELAY = 2  # Segundos entre requests (ser respeitoso)

class AliToolsImageScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        })
        self.downloaded_images = []
        self.failed_downloads = []
        
        # Criar diretórios se não existirem
        self.create_directories()
    
    def create_directories(self):
        """Criar estrutura de diretórios para imagens"""
        directories = [
            f"{IMAGE_BASE_PATH}/originals",
            f"{IMAGE_BASE_PATH}/thumbnails", 
            f"{IMAGE_BASE_PATH}/medium",
            f"{IMAGE_BASE_PATH}/large",
            f"{IMAGE_BASE_PATH}/temp"
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            print(f"📁 Diretório criado/verificado: {directory}")
    
    def get_vip_products(self) -> List[Dict]:
        """Obter lista de produtos VIP da base de dados"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            cur.execute('''
                SELECT internal_ean, name_pt, name, brand, short_description_pt
                FROM internal_products 
                WHERE is_active = true
                ORDER BY brand, name_pt
            ''')
            
            products = []
            for row in cur.fetchall():
                products.append({
                    'ean': row[0],
                    'name_pt': row[1], 
                    'name_original': row[2],
                    'brand': row[3],
                    'description': row[4]
                })
            
            conn.close()
            print(f"📋 {len(products)} produtos VIP carregados da BD")
            return products
            
        except Exception as e:
            print(f"❌ Erro ao carregar produtos VIP: {e}")
            return []
    
    def search_product_on_alitools(self, product_name: str, brand: str) -> Optional[str]:
        """Procurar produto no site da AliTools"""
        try:
            # Limpar nome do produto para busca
            search_terms = self.clean_search_terms(product_name, brand)
            
            print(f"🔍 Procurando: {search_terms}")
            
            # Tentar diferentes estratégias de busca
            search_urls = [
                f"{ALITOOLS_BASE_URL}/search-results-page?q={search_terms}",
                f"{ALITOOLS_BASE_URL}/produtos"  # Página de produtos geral
            ]
            
            for search_url in search_urls:
                try:
                    response = self.session.get(search_url, timeout=10)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        
                        # Procurar links de produtos
                        product_links = self.extract_product_links(soup, search_terms)
                        if product_links:
                            return product_links[0]  # Retornar primeiro match
                            
                except Exception as e:
                    print(f"⚠️ Erro na busca {search_url}: {e}")
                    continue
                
                time.sleep(REQUEST_DELAY)
            
            return None
            
        except Exception as e:
            print(f"❌ Erro na busca do produto: {e}")
            return None
    
    def clean_search_terms(self, product_name: str, brand: str) -> str:
        """Limpar e otimizar termos de busca"""
        # Remover caracteres especiais e normalizar
        terms = re.sub(r'[^\w\s]', ' ', product_name.lower())
        terms = re.sub(r'\s+', ' ', terms).strip()
        
        # Palavras-chave importantes para manter
        keywords = ['proteção', 'segurança', 'trabalho', 'profissional', 'resistente']
        
        # Extrair palavras relevantes
        words = terms.split()
        relevant_words = [w for w in words if len(w) > 3 or w in keywords]
        
        # Adicionar marca se for relevante
        if brand and brand.lower() not in ['genérico', 'alitools']:
            relevant_words.insert(0, brand.lower())
        
        return '+'.join(relevant_words[:5])  # Máximo 5 termos
    
    def extract_product_links(self, soup: BeautifulSoup, search_terms: str) -> List[str]:
        """Extrair links de produtos da página"""
        links = []
        
        # Diferentes seletores para links de produtos
        selectors = [
            'a[href*="/product-page/"]',
            'a[href*="/produto/"]', 
            'a[href*="/p/"]',
            '.product-item a',
            '.product-link',
            '[data-hook="product-link"]'
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            for element in elements:
                href = element.get('href')
                if href:
                    full_url = urljoin(ALITOOLS_BASE_URL, href)
                    if full_url not in links:
                        links.append(full_url)
        
        # Filtrar por relevância se necessário
        if search_terms:
            relevant_links = []
            terms = search_terms.replace('+', ' ').split()
            
            for link in links:
                link_text = link.lower()
                if any(term in link_text for term in terms):
                    relevant_links.append(link)
            
            return relevant_links if relevant_links else links[:3]
        
        return links[:5]  # Máximo 5 links
    
    def scrape_product_images(self, product_url: str) -> List[str]:
        """Fazer scraping das imagens de uma página de produto"""
        try:
            print(f"🔍 Analisando página: {product_url}")
            
            response = self.session.get(product_url, timeout=10)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            image_urls = []
            
            # Múltiplos seletores para encontrar imagens de produtos
            image_selectors = [
                'img[data-hook="product-image"]',
                '.product-image img',
                '.gallery-image img',
                '.main-image img',
                'img[src*="product"]',
                'img[alt*="produto"]',
                'img[alt*="product"]',
                '.wix-image img',
                '[data-hook="gallery"] img'
            ]
            
            for selector in image_selectors:
                images = soup.select(selector)
                for img in images:
                    src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                    if src:
                        # Resolver URL relativa
                        full_url = urljoin(product_url, src)
                        
                        # Filtrar URLs de imagem válidas
                        if self.is_valid_image_url(full_url):
                            if full_url not in image_urls:
                                image_urls.append(full_url)
            
            print(f"🖼️ Encontradas {len(image_urls)} imagens")
            for i, url in enumerate(image_urls, 1):
                print(f"   {i}. {url}")
            
            return image_urls
            
        except Exception as e:
            print(f"❌ Erro no scraping da página: {e}")
            return []
    
    def is_valid_image_url(self, url: str) -> bool:
        """Verificar se URL é uma imagem válida"""
        if not url:
            return False
        
        # Extensões de imagem válidas
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
        
        # Verificar extensão
        url_lower = url.lower()
        if any(ext in url_lower for ext in valid_extensions):
            return True
        
        # URLs Wix específicas (formato especial)
        if 'static.wixstatic.com' in url or 'wix.com' in url:
            return True
            
        # Excluir URLs obviamente inválidas
        invalid_patterns = ['logo', 'icon', 'banner', 'background', 'btn']
        if any(pattern in url_lower for pattern in invalid_patterns):
            return False
            
        return True
    
    def download_image(self, image_url: str, product_ean: str, image_index: int) -> Optional[str]:
        """Baixar e processar uma imagem"""
        try:
            print(f"⬇️ Baixando imagem {image_index} para {product_ean}")
            
            response = self.session.get(image_url, timeout=15)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return None
            
            # Verificar se é uma imagem válida
            try:
                image = Image.open(io.BytesIO(response.content))
                image.verify()  # Verificar integridade
            except Exception:
                print(f"❌ Arquivo não é uma imagem válida")
                return None
            
            # Reabrir imagem para processamento
            image = Image.open(io.BytesIO(response.content))
            
            # Gerar nome do arquivo
            extension = self.get_image_extension(image_url, image.format)
            filename = f"{product_ean}_{image_index:02d}{extension}"
            
            # Salvar imagem original
            original_path = f"{IMAGE_BASE_PATH}/originals/{filename}"
            image.save(original_path, format=image.format, quality=95)
            
            # Criar redimensionamentos
            self.create_resized_versions(image, filename)
            
            print(f"✅ Imagem salva: {filename}")
            return filename
            
        except Exception as e:
            print(f"❌ Erro no download da imagem: {e}")
            return None
    
    def get_image_extension(self, url: str, image_format: str) -> str:
        """Obter extensão correta da imagem"""
        if image_format:
            format_map = {
                'JPEG': '.jpg',
                'PNG': '.png', 
                'WEBP': '.webp',
                'GIF': '.gif'
            }
            return format_map.get(image_format.upper(), '.jpg')
        
        # Fallback baseado na URL
        if '.png' in url.lower():
            return '.png'
        elif '.webp' in url.lower():
            return '.webp'
        elif '.gif' in url.lower():
            return '.gif'
        else:
            return '.jpg'
    
    def create_resized_versions(self, image: Image.Image, filename: str):
        """Criar versões redimensionadas da imagem"""
        try:
            # Converter para RGB se necessário
            if image.mode in ['RGBA', 'P']:
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = rgb_image
            
            # Tamanhos alvo
            sizes = {
                'thumbnails': (150, 150),
                'medium': (400, 400),
                'large': (800, 800)
            }
            
            for size_name, (width, height) in sizes.items():
                # Redimensionar mantendo aspecto
                resized = image.copy()
                resized.thumbnail((width, height), Image.Resampling.LANCZOS)
                
                # Criar canvas quadrado com fundo branco
                canvas = Image.new('RGB', (width, height), (255, 255, 255))
                
                # Centralizar imagem no canvas
                x = (width - resized.width) // 2
                y = (height - resized.height) // 2
                canvas.paste(resized, (x, y))
                
                # Salvar
                size_path = f"{IMAGE_BASE_PATH}/{size_name}/{filename}"
                canvas.save(size_path, format='JPEG', quality=85)
                
        except Exception as e:
            print(f"⚠️ Erro ao criar redimensionamentos: {e}")
    
    def update_database(self, product_ean: str, image_filename: str, is_primary: bool = False):
        """Atualizar base de dados com informações da imagem"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            # Inserir registo da imagem
            cur.execute('''
                INSERT INTO internal_product_images 
                (internal_ean, filename, original_filename, file_path, mime_type, is_primary, display_order)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (internal_ean, filename) DO NOTHING
            ''', (
                product_ean,
                image_filename,
                image_filename,
                f"/images/products/internal/originals/{image_filename}",
                "image/jpeg",
                is_primary,
                0 if is_primary else 999
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"⚠️ Erro ao atualizar BD: {e}")
    
    def process_products(self, limit: int = 10):
        """Processar produtos VIP e baixar imagens"""
        print(f"🚀 Iniciando scraping de imagens AliTools - OUTSIDE THE BOX!")
        print("=" * 60)
        
        # Obter produtos VIP
        vip_products = self.get_vip_products()
        if not vip_products:
            print("❌ Nenhum produto VIP encontrado")
            return
        
        # Processar produtos (limitado)
        processed = 0
        for product in vip_products[:limit]:
            if processed >= limit:
                break
                
            print(f"\n🎯 Processando produto {processed + 1}/{min(limit, len(vip_products))}")
            print(f"   EAN: {product['ean']}")
            print(f"   Nome: {product['name_pt']}")
            print(f"   Marca: {product['brand']}")
            
            # Verificar se já tem imagens
            if self.has_existing_images(product['ean']):
                print(f"⏭️ Produto já tem imagens, pulando...")
                processed += 1
                continue
            
            # Procurar produto no site
            product_url = self.search_product_on_alitools(
                product['name_pt'], 
                product['brand']
            )
            
            if not product_url:
                print(f"❌ Produto não encontrado no site")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Produto não encontrado no site'
                })
                processed += 1
                continue
            
            # Fazer scraping das imagens
            image_urls = self.scrape_product_images(product_url)
            if not image_urls:
                print(f"❌ Nenhuma imagem encontrada")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Nenhuma imagem encontrada'
                })
                processed += 1
                continue
            
            # Baixar imagens
            downloaded_count = 0
            for i, image_url in enumerate(image_urls[:3], 1):  # Máximo 3 imagens
                filename = self.download_image(image_url, product['ean'], i)
                if filename:
                    self.update_database(product['ean'], filename, is_primary=(i == 1))
                    downloaded_count += 1
                    self.downloaded_images.append({
                        'ean': product['ean'],
                        'filename': filename,
                        'source_url': image_url
                    })
                
                time.sleep(1)  # Pausa entre downloads
            
            if downloaded_count > 0:
                print(f"✅ {downloaded_count} imagens baixadas com sucesso")
            else:
                print(f"❌ Falha no download das imagens")
                self.failed_downloads.append({
                    'ean': product['ean'],
                    'reason': 'Falha no download'
                })
            
            processed += 1
            time.sleep(REQUEST_DELAY)  # Pausa entre produtos
        
        # Relatório final
        self.generate_report()
    
    def has_existing_images(self, product_ean: str) -> bool:
        """Verificar se produto já tem imagens"""
        try:
            conn = psycopg2.connect(DATABASE_URL)
            cur = conn.cursor()
            
            cur.execute('''
                SELECT COUNT(*) FROM internal_product_images 
                WHERE internal_ean = %s
            ''', (product_ean,))
            
            count = cur.fetchone()[0]
            conn.close()
            
            return count > 0
            
        except Exception:
            return False
    
    def generate_report(self):
        """Gerar relatório final da operação"""
        print(f"\n🎉 RELATÓRIO FINAL - SCRAPING ALITOOLS")
        print("=" * 60)
        print(f"✅ Imagens baixadas com sucesso: {len(self.downloaded_images)}")
        print(f"❌ Produtos com falha: {len(self.failed_downloads)}")
        
        if self.downloaded_images:
            print(f"\n✅ SUCESSOS:")
            for img in self.downloaded_images:
                print(f"   • {img['ean']}: {img['filename']}")
        
        if self.failed_downloads:
            print(f"\n❌ FALHAS:")
            for fail in self.failed_downloads:
                print(f"   • {fail['ean']}: {fail['reason']}")
        
        # Salvar relatório JSON
        report = {
            'timestamp': time.time(),
            'downloaded_images': self.downloaded_images,
            'failed_downloads': self.failed_downloads,
            'total_success': len(self.downloaded_images),
            'total_failures': len(self.failed_downloads)
        }
        
        with open('alitools_scraping_report.json', 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Relatório salvo em: alitools_scraping_report.json")

def main():
    """Função principal"""
    print("🎯 ALITOOLS IMAGE SCRAPER - OUTSIDE THE BOX!")
    print("=" * 60)
    print("Este script vai fazer scraping das imagens dos produtos")
    print("diretamente do site da AliTools e organizá-las para o sistema VIP.")
    print()
    
    # Confirmar operação
    confirm = input("🤔 Deseja continuar? (s/N): ").lower().strip()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada pelo utilizador")
        return
    
    # Número de produtos a processar
    try:
        limit = int(input("📊 Quantos produtos processar? (padrão: 10): ") or "10")
    except ValueError:
        limit = 10
    
    print(f"\n🚀 Iniciando scraping de {limit} produtos...")
    
    # Executar scraper
    scraper = AliToolsImageScraper()
    scraper.process_products(limit=limit)
    
    print(f"\n🎉 Scraping concluído!")

if __name__ == "__main__":
    main()