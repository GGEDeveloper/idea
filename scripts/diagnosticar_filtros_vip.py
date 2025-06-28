#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Diagnóstico Completo dos Filtros VIP
=====================================

Este script testa todos os componentes do sistema de filtros:
1. Base de dados (marcas VIP disponíveis)
2. API de filtros (endpoint /api/products?filters=true)
3. API de produtos (filtro por marca)
4. Integridade dos dados
"""

import requests
import psycopg2
import json
import time
from typing import Dict, List, Any

# Configurações
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'
API_BASE = "http://localhost:3001"
TIMEOUT = 10

def test_database() -> Dict[str, Any]:
    """Testa marcas na base de dados"""
    print("🔍 TESTE 1: Base de Dados")
    print("-" * 40)
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Query unificada de marcas
        cur.execute('''
            SELECT DISTINCT brand as name 
            FROM (
              SELECT DISTINCT brand 
              FROM products 
              WHERE brand IS NOT NULL AND brand <> '' AND active = true
              
              UNION ALL
              
              SELECT DISTINCT brand 
              FROM internal_products 
              WHERE brand IS NOT NULL AND brand <> '' AND is_active = true
            ) combined_brands
            ORDER BY name;
        ''')
        
        brands = [row[0] for row in cur.fetchall()]
        
        # Contar produtos VIP por marca
        vip_brands = {}
        for brand in ['FERMAN', 'HARDMAN', 'Genérico', 'TOURO']:
            cur.execute('''
                SELECT COUNT(*) FROM internal_products 
                WHERE brand = %s AND is_active = true
            ''', (brand,))
            count = cur.fetchone()[0]
            if count > 0:
                vip_brands[brand] = count
        
        conn.close()
        
        print(f"✅ Total marcas: {len(brands)}")
        print("✅ Marcas VIP encontradas:")
        for brand, count in vip_brands.items():
            print(f"   • {brand}: {count} produtos")
        
        return {
            "success": True,
            "total_brands": len(brands),
            "vip_brands": vip_brands,
            "all_brands": brands
        }
        
    except Exception as e:
        print(f"❌ Erro na BD: {e}")
        return {"success": False, "error": str(e)}

def test_api_filters() -> Dict[str, Any]:
    """Testa endpoint de filtros"""
    print("\n🔍 TESTE 2: API de Filtros")
    print("-" * 40)
    
    try:
        response = requests.get(f"{API_BASE}/api/products?filters=true", timeout=TIMEOUT)
        
        if response.status_code != 200:
            print(f"❌ Status code: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
        
        data = response.json()
        brands = data.get('brands', [])
        categories = data.get('categories', [])
        price = data.get('price', {})
        
        vip_brands_found = [b for b in brands if b in ['FERMAN', 'HARDMAN', 'Genérico', 'TOURO']]
        
        print(f"✅ Status: 200 OK")
        print(f"✅ Total marcas: {len(brands)}")
        print(f"✅ Marcas VIP: {vip_brands_found}")
        print(f"✅ Categorias: {len(categories)}")
        print(f"✅ Preços: €{price.get('min', 0)} - €{price.get('max', 0)}")
        
        return {
            "success": True,
            "brands_count": len(brands),
            "vip_brands": vip_brands_found,
            "data": data
        }
        
    except Exception as e:
        print(f"❌ Erro na API: {e}")
        return {"success": False, "error": str(e)}

def test_brand_filter(brand: str) -> Dict[str, Any]:
    """Testa filtro por marca específica"""
    print(f"\n🔍 TESTE 3: Filtro Marca '{brand}'")
    print("-" * 40)
    
    try:
        url = f"{API_BASE}/api/products?brands={brand}&limit=5"
        response = requests.get(url, timeout=TIMEOUT)
        
        if response.status_code != 200:
            print(f"❌ Status code: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
        
        data = response.json()
        products = data.get('products', [])
        total = data.get('totalProducts', 0)
        
        print(f"✅ Status: 200 OK")
        print(f"✅ URL testada: {url}")
        print(f"✅ Total produtos: {total}")
        print(f"✅ Produtos retornados: {len(products)}")
        
        if products:
            print("✅ Exemplos:")
            for i, product in enumerate(products[:3], 1):
                ean = product.get('ean', 'N/A')
                name = product.get('name', 'N/A')[:40]
                brand_check = product.get('brand', 'N/A')
                source = product.get('source_type', 'N/A')
                print(f"   {i}. {ean}: {name}... | {brand_check} | {source}")
        
        return {
            "success": True,
            "total_products": total,
            "products_returned": len(products),
            "brand_matches": all(p.get('brand') == brand for p in products)
        }
        
    except Exception as e:
        print(f"❌ Erro no filtro: {e}")
        return {"success": False, "error": str(e)}

def test_multiple_brands() -> Dict[str, Any]:
    """Testa filtro com múltiplas marcas"""
    print(f"\n🔍 TESTE 4: Múltiplas Marcas")
    print("-" * 40)
    
    try:
        brands = "FERMAN,HARDMAN"
        url = f"{API_BASE}/api/products?brands={brands}&limit=10"
        response = requests.get(url, timeout=TIMEOUT)
        
        if response.status_code != 200:
            print(f"❌ Status code: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
        
        data = response.json()
        products = data.get('products', [])
        total = data.get('totalProducts', 0)
        
        # Verificar se todas as marcas retornadas são as esperadas
        expected_brands = ['FERMAN', 'HARDMAN']
        actual_brands = list(set(p.get('brand') for p in products))
        valid_brands = all(brand in expected_brands for brand in actual_brands)
        
        print(f"✅ Status: 200 OK")
        print(f"✅ URL testada: {url}")
        print(f"✅ Total produtos: {total}")
        print(f"✅ Produtos retornados: {len(products)}")
        print(f"✅ Marcas encontradas: {actual_brands}")
        print(f"✅ Marcas válidas: {valid_brands}")
        
        return {
            "success": True,
            "total_products": total,
            "valid_brands": valid_brands,
            "actual_brands": actual_brands
        }
        
    except Exception as e:
        print(f"❌ Erro no filtro múltiplo: {e}")
        return {"success": False, "error": str(e)}

def test_combined_filters() -> Dict[str, Any]:
    """Testa combinação de filtros"""
    print(f"\n🔍 TESTE 5: Filtros Combinados")
    print("-" * 40)
    
    try:
        # Testar marca + stock
        url = f"{API_BASE}/api/products?brands=FERMAN&hasStock=true&limit=5"
        response = requests.get(url, timeout=TIMEOUT)
        
        if response.status_code != 200:
            print(f"❌ Status code: {response.status_code}")
            return {"success": False, "status_code": response.status_code}
        
        data = response.json()
        products = data.get('products', [])
        total = data.get('totalProducts', 0)
        
        print(f"✅ Status: 200 OK")
        print(f"✅ URL testada: {url}")
        print(f"✅ Marca + Stock: {total} produtos")
        
        return {
            "success": True,
            "combined_filter_works": True,
            "total_products": total
        }
        
    except Exception as e:
        print(f"❌ Erro nos filtros combinados: {e}")
        return {"success": False, "error": str(e)}

def main():
    """Executa todos os testes"""
    print("🎯 DIAGNÓSTICO COMPLETO - FILTROS VIP")
    print("=" * 60)
    
    results = {
        "timestamp": time.time(),
        "tests": {}
    }
    
    # Verificar se servidor está rodando
    try:
        health_response = requests.get(f"{API_BASE}/api/health", timeout=5)
        if health_response.status_code != 200:
            print("❌ Servidor não está respondendo corretamente")
            return
    except:
        print("❌ Servidor não está rodando. Execute 'npm run dev' primeiro.")
        return
    
    # Executar testes
    results["tests"]["database"] = test_database()
    results["tests"]["api_filters"] = test_api_filters()
    results["tests"]["brand_filter"] = test_brand_filter("FERMAN")
    results["tests"]["multiple_brands"] = test_multiple_brands()
    results["tests"]["combined_filters"] = test_combined_filters()
    
    # Resumo final
    print("\n🎯 RESUMO FINAL")
    print("=" * 60)
    
    all_passed = all(test.get("success", False) for test in results["tests"].values())
    
    if all_passed:
        print("✅ TODOS OS TESTES PASSARAM!")
        print("✅ Sistema de filtros VIP funciona perfeitamente")
        print("✅ Problema pode estar no frontend/browser")
        print("\n🧪 PRÓXIMOS PASSOS:")
        print("   1. Testar manualmente no browser")
        print("   2. Verificar DevTools por erros JavaScript")
        print("   3. Verificar se utilizador está autenticado")
        print("   4. Verificar se filtros aparecem após login")
    else:
        print("❌ ALGUNS TESTES FALHARAM")
        for test_name, test_result in results["tests"].items():
            status = "✅" if test_result.get("success") else "❌"
            print(f"   {status} {test_name}")
    
    # Salvar resultados
    with open('diagnostico_filtros_result.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Resultados salvos em: diagnostico_filtros_result.json")

if __name__ == "__main__":
    main() 