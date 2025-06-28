#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AliTools Image Harvester 🚜
============================

Scraper para baixar TODAS as imagens dos produtos AliTools
e organizá-las numa pasta temporária para validação manual.

Baseado nos padrões descobertos na pesquisa manual.
"""

import requests
import os
import re
import json
import time
from urllib.parse import urljoin, urlparse
from typing import Dict, List, Optional
from bs4 import BeautifulSoup
from PIL import Image
import io

# Configurações baseadas na pesquisa
ALITOOLS_BASE_URL = "https://www.alimamedetools.com"
OUTPUT_BASE_PATH = "alitools-research/imagens-coletadas"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_DELAY = 1  # Segundos entre requests

# URLs dos produtos descobertos manualmente
PRODUTOS_CONHECIDOS = [
    {
        'nome': 'parka-impermiavel-reflectora',
        'url': 'https://www.alimamedetools.com/product-page/parka-impermi%C3%A1vel-reflectora'
    },
    {
        'nome': 'fato-de-chuva-reflector',
        'url': 'https://www.alimamedetools.com/product-page/fato-de-chuva-reflector'
    },
    {
        'nome': 'luva-nitrile-preta',
        'url': 'https://www.alimamedetools.com/product-page/luva-nitrile-preta-com-nylon-grossa-prof'
    },
    {
        'nome': 'talocha-de-grosa',
        'url': 'https://www.alimamedetools.com/product-page/talocha-de-grosa-endurecida-120-x-375mm-a3701'
    },
    {
        'nome': 'espatula-em-abs',
        'url': 'https://www.alimamedetools.com/product-page/espatula-em-abs-250-mm'
    },
    {
        'nome': 'serrote-prof-cortar-ferro',
        'url': 'https://www.alimamedetools.com/product-page/serrote-prof-cortar-ferro-12-300-mm'
    }
]

class AliToolsImageHarvester:
    def __init__(self):
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
        print(f"📁 Pasta criada: {OUTPUT_BASE_PATH}")
    
    def extract_images_from_page(self, product_url: str) -> List[str]:
        """Extrair URLs de imagens de uma página de produto"""
        try:
            print(f"🔍 Analisando: {product_url}")
            
            response = self.session.get(product_url, timeout=15)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return []
            
            soup = BeautifulSoup(response.content, 'html.parser')
            image_urls = set()  # Usar set para evitar duplicatas
            
            # Padrão descoberto: imagens dentro de elementos específicos
            img_elements = soup.find_all('img')
            
            for img in img_elements:
                src = img.get('src')
                if not src:
                    continue
                
                # Filtrar apenas imagens dos produtos (baseado nos padrões descobertos)
                if self.is_product_image(src, img):
                    full_url = urljoin(product_url, src)
                    # Tentar obter versão de maior qualidade
                    high_quality_url = self.get_high_quality_url(full_url)
                    image_urls.add(high_quality_url)
            
            image_list = list(image_urls)
            print(f"🖼️ Encontradas {len(image_list)} imagens únicas")
            
            return image_list
            
        except Exception as e:
            print(f"❌ Erro ao analisar página: {e}")
            return []
    
    def is_product_image(self, src: str, img_element) -> bool:
        """Verificar se é uma imagem de produto baseado nos padrões descobertos"""
        if not src:
            return False
        
        # Deve ser do domínio Wix/static
        if 'static.wixstatic.com' not in src:
            return False
        
        # Deve ter o hash pattern descoberto
        if '88efbe_' not in src:
            return False
        
        # Não deve ser thumbnail muito pequeno
        if 'w_32' in src or 'w_45' in src:
            return False
        
        # Verificar alt text relevante
        alt = img_element.get('alt', '').lower()
        if any(word in alt for word in ['miniatura:', 'logo', 'icon']):
            return False
        
        return True
    
    def get_high_quality_url(self, url: str) -> str:
        """Converter URL para maior qualidade possível"""
        # Padrão descoberto: /v1/fill/w_375,h_375,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/
        # Vamos tentar obter versão maior e melhor qualidade
        
        if '/v1/fill/' in url:
            # Extrair parte base da URL
            base_part = url.split('/v1/fill/')[0]
            file_part = url.split('/v1/fill/')[1].split('/')[-1]
            
            # Criar URL de alta qualidade
            high_quality = f"{base_part}/v1/fill/w_800,h_800,al_c,q_95,usm_0.66_1.00_0.01/{file_part}"
            return high_quality
        
        return url
    
    def download_image(self, image_url: str, product_name: str, image_index: int) -> Optional[str]:
        """Baixar uma imagem e salvá-la na pasta do produto"""
        try:
            print(f"⬇️ Baixando imagem {image_index} de {product_name}")
            
            response = self.session.get(image_url, timeout=20)
            if response.status_code != 200:
                print(f"❌ Erro HTTP {response.status_code}")
                return None
            
            # Verificar se é uma imagem válida
            try:
                image = Image.open(io.BytesIO(response.content))
                width, height = image.size
                format_type = image.format
                print(f"📐 Dimensões: {width}x{height}, Formato: {format_type}")
            except Exception:
                print(f"❌ Arquivo não é uma imagem válida")
                return None
            
            # Criar pasta do produto
            product_dir = os.path.join(OUTPUT_BASE_PATH, product_name)
            os.makedirs(product_dir, exist_ok=True)
            
            # Gerar nome do arquivo
            file_extension = self.get_file_extension(image_url, format_type)
            filename = f"{image_index:02d}_{width}x{height}{file_extension}"
            filepath = os.path.join(product_dir, filename)
            
            # Salvar imagem
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Salvo: {filename}")
            self.downloaded_count += 1
            
            return filename
            
        except Exception as e:
            print(f"❌ Erro no download: {e}")
            self.failed_count += 1
            return None
    
    def get_file_extension(self, url: str, image_format: str) -> str:
        """Obter extensão do arquivo"""
        if image_format:
            format_map = {
                'JPEG': '.jpg',
                'PNG': '.png',
                'WEBP': '.webp',
                'GIF': '.gif'
            }
            return format_map.get(image_format.upper(), '.jpg')
        
        # Fallback baseado na URL
        parsed = urlparse(url)
        if '.png' in parsed.path.lower():
            return '.png'
        elif '.webp' in parsed.path.lower():
            return '.webp'
        else:
            return '.jpg'
    
    def process_product(self, product_info: Dict) -> Dict:
        """Processar um produto individual"""
        product_name = product_info['nome']
        product_url = product_info['url']
        
        print(f"\n🎯 PRODUTO: {product_name}")
        print(f"🔗 URL: {product_url}")
        
        # Extrair URLs de imagens
        image_urls = self.extract_images_from_page(product_url)
        
        if not image_urls:
            print(f"❌ Nenhuma imagem encontrada")
            return {
                'produto': product_name,
                'url': product_url,
                'imagens_encontradas': 0,
                'imagens_baixadas': 0,
                'status': 'sem_imagens'
            }
        
        # Baixar todas as imagens
        downloaded_files = []
        for i, image_url in enumerate(image_urls, 1):
            filename = self.download_image(image_url, product_name, i)
            if filename:
                downloaded_files.append({
                    'filename': filename,
                    'source_url': image_url
                })
            
            time.sleep(0.5)  # Pausa entre downloads
        
        result = {
            'produto': product_name,
            'url': product_url,
            'imagens_encontradas': len(image_urls),
            'imagens_baixadas': len(downloaded_files),
            'arquivos': downloaded_files,
            'status': 'sucesso' if downloaded_files else 'falha'
        }
        
        print(f"✅ {len(downloaded_files)}/{len(image_urls)} imagens baixadas")
        return result
    
    def harvest_all_images(self):
        """Processar todos os produtos conhecidos"""
        print("🚜 ALITOOLS IMAGE HARVESTER - INICIANDO!")
        print("=" * 60)
        print(f"📋 {len(PRODUTOS_CONHECIDOS)} produtos para processar")
        print(f"📁 Pasta de destino: {OUTPUT_BASE_PATH}")
        print()
        
        for i, product_info in enumerate(PRODUTOS_CONHECIDOS, 1):
            print(f"\n{'='*60}")
            print(f"PRODUTO {i}/{len(PRODUTOS_CONHECIDOS)}")
            
            result = self.process_product(product_info)
            self.results.append(result)
            
            time.sleep(REQUEST_DELAY)  # Pausa entre produtos
        
        # Gerar relatório final
        self.generate_final_report()
    
    def generate_final_report(self):
        """Gerar relatório final da coleta"""
        print(f"\n🎉 HARVESTING CONCLUÍDO!")
        print("=" * 60)
        print(f"📊 ESTATÍSTICAS:")
        print(f"   • Total produtos processados: {len(self.results)}")
        print(f"   • Total imagens baixadas: {self.downloaded_count}")
        print(f"   • Total falhas: {self.failed_count}")
        
        # Estatísticas por produto
        print(f"\n📋 RESULTADOS POR PRODUTO:")
        for result in self.results:
            status_icon = "✅" if result['status'] == 'sucesso' else "❌"
            print(f"   {status_icon} {result['produto']}: {result['imagens_baixadas']}/{result['imagens_encontradas']} imagens")
        
        # Salvar relatório JSON
        report_file = os.path.join(OUTPUT_BASE_PATH, 'relatorio_coleta.json')
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump({
                'timestamp': time.time(),
                'total_produtos': len(self.results),
                'total_imagens_baixadas': self.downloaded_count,
                'total_falhas': self.failed_count,
                'produtos': self.results
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Relatório salvo: {report_file}")
        print(f"📁 Imagens organizadas em: {OUTPUT_BASE_PATH}")
        print(f"\n🔍 PRÓXIMO PASSO: Validar manualmente as imagens baixadas!")

def main():
    """Função principal"""
    print("🚜 ALITOOLS IMAGE HARVESTER")
    print("=" * 60)
    print("Este script vai baixar TODAS as imagens dos produtos AliTools")
    print("e organizá-las numa pasta para validação manual.")
    print()
    
    # Confirmar execução
    confirm = input("🤔 Deseja continuar? (s/N): ").lower().strip()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada")
        return
    
    print(f"\n🚀 Iniciando coleta...")
    
    # Executar harvester
    harvester = AliToolsImageHarvester()
    harvester.harvest_all_images()

if __name__ == "__main__":
    main() 