#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera versão limpa e focada do mapeamento de produtos
"""

import csv
import os

def create_clean_mapping():
    """Cria versão simplificada do mapeamento para revisão"""
    
    input_file = "aa-elementos-novos/csv-produtos/catalog_products_with_categories.csv"
    clean_file = "aa-elementos-novos/csv-produtos/products_clean_mapping.csv"
    
    print("🧹 **CRIANDO VERSÃO LIMPA DO MAPEAMENTO**")
    print("=" * 50)
    
    products_data = []
    
    # Ler e processar dados
    with open(input_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            if row.get('fieldType') == 'Product':
                # Extrair dados essenciais
                product_data = {
                    'handle_id': row.get('handleId', ''),
                    'product_name': row.get('name', ''),
                    'sku': row.get('sku', ''),
                    'price': row.get('price', ''),
                    'category_id': row.get('geko_category_id', ''),
                    'category_name': row.get('geko_category_name', ''),
                    'category_path': row.get('geko_category_path', ''),
                    'has_variants': 'Sim' if any(r.get('handleId') == row.get('handleId') 
                                               and r.get('fieldType') == 'Variant' 
                                               for r in csv.DictReader(open(input_file, 'r', encoding='utf-8'))) else 'Não'
                }
                
                products_data.append(product_data)
    
    # Criar ficheiro limpo
    with open(clean_file, 'w', encoding='utf-8', newline='') as file:
        fieldnames = [
            'handle_id', 'product_name', 'sku', 'price', 
            'category_id', 'category_name', 'category_path', 
            'has_variants', 'notes'  # Campo notes vazio para ajustes manuais
        ]
        
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        
        for product in sorted(products_data, key=lambda x: x['category_name']):
            product['notes'] = ''  # Campo vazio para notas manuais
            writer.writerow(product)
    
    print(f"✅ **FICHEIRO LIMPO CRIADO:**")
    print(f"   📁 {clean_file}")
    print(f"   📊 {len(products_data)} produtos processados")
    print(f"\n📋 **COLUNAS INCLUÍDAS:**")
    print("   • handle_id: ID único do produto")
    print("   • product_name: Nome do produto")
    print("   • sku: Código do produto")  
    print("   • price: Preço")
    print("   • category_id: ID da categoria Geko")
    print("   • category_name: Nome da categoria")
    print("   • category_path: Caminho hierárquico")
    print("   • has_variants: Tem variantes (Sim/Não)")
    print("   • notes: Campo vazio para anotações manuais")
    
    # Estatísticas por categoria
    category_count = {}
    for product in products_data:
        cat = product['category_name']
        category_count[cat] = category_count.get(cat, 0) + 1
    
    print(f"\n📈 **DISTRIBUIÇÃO POR CATEGORIA:**")
    for cat, count in sorted(category_count.items(), key=lambda x: x[1], reverse=True):
        print(f"   • {cat}: {count} produtos")
    
    return True

if __name__ == "__main__":
    create_clean_mapping() 