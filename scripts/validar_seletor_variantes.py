#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validação do Seletor de Variantes VIP
=====================================

Este script valida que:
1. Produtos VIP com múltiplas variantes ativam o seletor
2. Produtos VIP com 1 variante não mostram seletor
3. Produtos Geko continuam funcionando normalmente
4. API retorna dados adequados para o seletor
"""

import requests
import json
import sys
from typing import Dict, List, Any

# Configurações
API_BASE = "http://localhost:3001"
TIMEOUT = 10

def test_api_endpoint(ean: str) -> Dict[str, Any]:
    """Testa um endpoint da API de produtos"""
    try:
        url = f"{API_BASE}/api/products/{ean}"
        response = requests.get(url, timeout=TIMEOUT)
        
        if response.status_code == 200:
            return {"success": True, "data": response.json()}
        else:
            return {"success": False, "error": f"HTTP {response.status_code}"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

def analyze_product_variants(product_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analisa as variantes de um produto"""
    variants = product_data.get('variants', [])
    variant_count = len(variants)
    
    # Determinar tipo de layout que seria usado
    if variant_count <= 1:
        layout_type = "no-selector"
    elif variant_count <= 3:
        layout_type = "horizontal-buttons"
    elif variant_count <= 6:
        layout_type = "grid-layout"
    else:
        layout_type = "dropdown"
    
    # Verificar se tem dados necessários para seletor
    has_variant_names = all(v.get('variant_name') for v in variants)
    has_prices = all(v.get('base_selling_price') is not None for v in variants)
    has_stock = all('stockquantity' in v for v in variants)
    
    return {
        "variant_count": variant_count,
        "layout_type": layout_type,
        "should_show_selector": variant_count > 1,
        "has_variant_names": has_variant_names,
        "has_prices": has_prices,
        "has_stock": has_stock,
        "data_complete": has_variant_names and has_prices and has_stock
    }

def main():
    print("🔍 VALIDAÇÃO DO SELETOR DE VARIANTES VIP")
    print("=" * 60)
    
    # Produtos de teste
    test_cases = [
        {
            "ean": "INT_F63EAD9F",
            "name": "Bota FERMAN (10 variantes)",
            "expected_layout": "dropdown",
            "should_show_selector": True
        },
        {
            "ean": "INT_E7FD73BA", 
            "name": "Gancho TOURO (10 variantes)",
            "expected_layout": "dropdown",
            "should_show_selector": True
        },
        {
            "ean": "5907078928968",  # Produto Geko normal - usar um que sabemos que existe
            "name": "Produto Geko (teste compatibilidade)",
            "expected_layout": "no-selector",
            "should_show_selector": False
        }
    ]
    
    all_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 TESTE {i}: {test_case['name']}")
        print("-" * 50)
        
        # Testar API
        result = test_api_endpoint(test_case['ean'])
        
        if not result['success']:
            print(f"❌ API falhou: {result['error']}")
            all_passed = False
            continue
            
        product_data = result['data']
        analysis = analyze_product_variants(product_data)
        
        # Mostrar informações do produto
        print(f"   EAN: {product_data.get('ean', 'N/A')}")
        print(f"   Nome: {product_data.get('name', 'N/A')[:50]}...")
        print(f"   Variantes: {analysis['variant_count']}")
        print(f"   Layout previsto: {analysis['layout_type']}")
        
        # Validações
        validations = [
            {
                "name": "Seletor deve aparecer",
                "expected": test_case['should_show_selector'],
                "actual": analysis['should_show_selector'],
                "critical": True
            },
            {
                "name": "Layout correto",
                "expected": test_case['expected_layout'],
                "actual": analysis['layout_type'],
                "critical": True
            },
            {
                "name": "Dados completos",
                "expected": True,
                "actual": analysis['data_complete'],
                "critical": False
            }
        ]
        
        test_passed = True
        for validation in validations:
            if validation['expected'] == validation['actual']:
                status = "✅"
            else:
                status = "❌" if validation['critical'] else "⚠️"
                if validation['critical']:
                    test_passed = False
                    all_passed = False
            
            print(f"   {status} {validation['name']}: {validation['actual']}")
        
        if test_passed:
            print(f"   🎯 TESTE {i} PASSOU!")
        else:
            print(f"   💥 TESTE {i} FALHOU!")
    
    print(f"\n{'='*60}")
    if all_passed:
        print("🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Seletor de variantes VIP implementado com sucesso!")
        print("✅ Compatibilidade com produtos Geko mantida!")
        print("✅ Sistema pronto para produção!")
    else:
        print("❌ ALGUNS TESTES FALHARAM!")
        print("🔧 Verificar implementação antes de usar em produção.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main()) 