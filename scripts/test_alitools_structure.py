#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Teste - Estrutura AliTools
=====================================

Este script analisa a estrutura da página exemplo da AliTools
para entender como extrair as imagens dos produtos.

URL de Exemplo: https://www.alimamedetools.com/product-page/fato-de-chuva-reflector
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin

# URL de exemplo fornecida
EXAMPLE_URL = "https://www.alimamedetools.com/product-page/fato-de-chuva-reflector"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

def analyze_page_structure():
    """Analisar estrutura da página de exemplo"""
    print("🔍 ANÁLISE DA ESTRUTURA DA PÁGINA ALITOOLS")
    print("=" * 60)
    print(f"📄 URL: {EXAMPLE_URL}")
    print()
    
    try:
        # Fazer request com headers apropriados
        headers = {
            'User-Agent': USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'pt-PT,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
        
        response = requests.get(EXAMPLE_URL, headers=headers, timeout=10)
        print(f"📊 Status HTTP: {response.status_code}")
        print(f"📊 Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"📊 Tamanho da resposta: {len(response.content)} bytes")
        print()
        
        if response.status_code != 200:
            print(f"❌ Erro: Status {response.status_code}")
            return
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Encontrar título da página
        title = soup.find('title')
        if title:
            print(f"📋 Título: {title.get_text().strip()}")
        
        # Analisar diferentes seletores de imagens
        analyze_images(soup)
        
        # Analisar estrutura geral
        analyze_general_structure(soup)
        
        # Procurar dados estruturados
        analyze_structured_data(soup)
        
        # Salvar HTML para análise
        save_html_sample(response.content)
        
    except Exception as e:
        print(f"❌ Erro na análise: {e}")

def analyze_images(soup):
    """Analisar todas as imagens encontradas"""
    print("\n🖼️ ANÁLISE DE IMAGENS")
    print("-" * 40)
    
    # Diferentes seletores para imagens
    selectors = {
        "Todas as imagens": "img",
        "Imagens com data-hook": "img[data-hook]",
        "Imagens de produto": "img[data-hook*='product']",
        "Imagens de galeria": "img[data-hook*='gallery']",
        "Imagens Wix": ".wix-image img",
        "Imagens com src contendo 'product'": "img[src*='product']",
        "Imagens com alt": "img[alt]"
    }
    
    for selector_name, selector in selectors.items():
        images = soup.select(selector)
        print(f"\n📸 {selector_name}: {len(images)} encontradas")
        
        for i, img in enumerate(images[:3], 1):  # Mostrar apenas as 3 primeiras
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            alt = img.get('alt', 'N/A')
            data_hook = img.get('data-hook', 'N/A')
            
            if src:
                # Converter URL relativa para absoluta
                full_url = urljoin(EXAMPLE_URL, src)
                print(f"   {i}. {full_url}")
                print(f"      Alt: {alt}")
                print(f"      Data-hook: {data_hook}")
    
    # Procurar especificamente por padrões Wix
    print(f"\n🎨 PADRÕES WIX ESPECÍFICOS")
    print("-" * 40)
    
    # URLs que contêm static.wixstatic.com
    all_imgs = soup.find_all('img')
    wix_images = []
    
    for img in all_imgs:
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
        if src and ('wixstatic.com' in src or 'wix.com' in src):
            wix_images.append(src)
    
    print(f"📊 Imagens Wix encontradas: {len(wix_images)}")
    for i, url in enumerate(wix_images[:5], 1):
        print(f"   {i}. {url}")

def analyze_general_structure(soup):
    """Analisar estrutura geral da página"""
    print(f"\n🏗️ ESTRUTURA GERAL DA PÁGINA")
    print("-" * 40)
    
    # Procurar elementos comuns de e-commerce
    elements = {
        "Nome do produto": [
            'h1[data-hook="product-title"]',
            '.product-title',
            'h1',
            '[data-hook="product-title"]'
        ],
        "Preço": [
            '[data-hook="formatted-primary-price"]',
            '.price',
            '.product-price',
            '[data-hook*="price"]'
        ],
        "Descrição": [
            '[data-hook="description"]',
            '.product-description',
            '.description'
        ],
        "Botão comprar": [
            '[data-hook="add-to-cart"]',
            '.add-to-cart',
            'button[type="submit"]'
        ]
    }
    
    for element_name, selectors in elements.items():
        found = False
        for selector in selectors:
            elements_found = soup.select(selector)
            if elements_found:
                print(f"✅ {element_name}: {len(elements_found)} elemento(s) encontrado(s)")
                element = elements_found[0]
                text = element.get_text().strip()[:100]
                print(f"   Texto: {text}...")
                print(f"   Seletor: {selector}")
                found = True
                break
        
        if not found:
            print(f"❌ {element_name}: Não encontrado")

def analyze_structured_data(soup):
    """Procurar dados estruturados (JSON-LD, microdata)"""
    print(f"\n📊 DADOS ESTRUTURADOS")
    print("-" * 40)
    
    # JSON-LD
    json_scripts = soup.find_all('script', type='application/ld+json')
    print(f"📋 Scripts JSON-LD encontrados: {len(json_scripts)}")
    
    for i, script in enumerate(json_scripts, 1):
        try:
            data = json.loads(script.string)
            print(f"   {i}. Tipo: {data.get('@type', 'N/A')}")
            if 'name' in data:
                print(f"      Nome: {data.get('name')}")
            if 'image' in data:
                images = data.get('image')
                if isinstance(images, list):
                    print(f"      Imagens: {len(images)} encontradas")
                else:
                    print(f"      Imagem: {images}")
        except:
            print(f"   {i}. Erro ao fazer parse do JSON")
    
    # Microdata
    microdata_items = soup.find_all(attrs={"itemtype": True})
    print(f"📋 Elementos com microdata: {len(microdata_items)}")
    
    for item in microdata_items:
        itemtype = item.get('itemtype')
        print(f"   Tipo: {itemtype}")

def save_html_sample(content):
    """Salvar amostra do HTML para análise manual"""
    filename = "alitools_page_sample.html"
    with open(filename, 'wb') as f:
        f.write(content)
    print(f"\n💾 HTML salvo em: {filename}")
    print("   Pode abrir este arquivo para análise manual")

def test_search_functionality():
    """Testar funcionalidade de busca do site"""
    print(f"\n🔍 TESTE DE FUNCIONALIDADE DE BUSCA")
    print("-" * 40)
    
    # URLs de busca possíveis
    search_urls = [
        "https://www.alimamedetools.com/search-results-page?q=chuva",
        "https://www.alimamedetools.com/produtos",
        "https://www.alimamedetools.com/loja"
    ]
    
    for url in search_urls:
        try:
            response = requests.get(url, timeout=10)
            print(f"📄 {url}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Procurar links de produtos
                product_links = soup.select('a[href*="/product-page/"]')
                print(f"   Links de produtos encontrados: {len(product_links)}")
                
                for i, link in enumerate(product_links[:3], 1):
                    href = link.get('href')
                    text = link.get_text().strip()[:50]
                    print(f"   {i}. {text}... -> {href}")
            
        except Exception as e:
            print(f"❌ Erro ao testar {url}: {e}")

def main():
    """Função principal"""
    print("🎯 TESTE DE ESTRUTURA ALITOOLS - OUTSIDE THE BOX!")
    print("=" * 60)
    print("Este script analisa a página de exemplo para entender")
    print("como extrair imagens e informações dos produtos.")
    print()
    
    try:
        analyze_page_structure()
        test_search_functionality()
        
        print(f"\n🎉 ANÁLISE CONCLUÍDA!")
        print("Use estas informações para ajustar o scraper principal.")
        
    except KeyboardInterrupt:
        print(f"\n⏹️ Análise interrompida pelo utilizador")
    except Exception as e:
        print(f"\n❌ Erro geral: {e}")

if __name__ == "__main__":
    main() 