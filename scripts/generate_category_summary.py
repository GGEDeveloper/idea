#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gera resumo das categorias mapeadas em formato tabular
"""

import csv
import os
from collections import defaultdict

def generate_category_summary():
    """Gera resumo das categorias mapeadas"""
    
    input_file = "aa-elementos-novos/csv-produtos/catalog_products_with_categories.csv"
    summary_file = "aa-elementos-novos/csv-produtos/category_mapping_summary.csv"
    reference_file = "aa-elementos-novos/csv-produtos/category_reference.csv"
    
    print("📊 **GERANDO RESUMOS DE CATEGORIAS**")
    print("=" * 45)
    
    category_products = defaultdict(list)
    category_info = {}
    
    # Ler ficheiro com categorias mapeadas
    with open(input_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            if row.get('fieldType') == 'Product':
                category_id = row.get('geko_category_id')
                category_name = row.get('geko_category_name')
                category_path = row.get('geko_category_path')
                product_name = row.get('name', '')
                
                if category_id and category_name:
                    category_products[category_name].append(product_name)
                    category_info[category_name] = {
                        'id': category_id,
                        'path': category_path
                    }
    
    # Gerar resumo por categoria
    print("📋 **RESUMO POR CATEGORIA:**")
    with open(summary_file, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            'Categoria', 'ID_Categoria', 'Caminho_Hierarquia', 
            'Quantidade_Produtos', 'Exemplos_Produtos'
        ])
        
        for category_name, products in sorted(category_products.items(), 
                                            key=lambda x: len(x[1]), reverse=True):
            
            category_id = category_info[category_name]['id']
            category_path = category_info[category_name]['path']
            count = len(products)
            examples = '; '.join(products[:5])  # Primeiros 5 exemplos
            
            writer.writerow([
                category_name, category_id, category_path, 
                count, examples
            ])
            
            print(f"   • {category_name}: {count} produtos")
            if count <= 5:
                for product in products:
                    print(f"     - {product}")
            else:
                for product in products[:3]:
                    print(f"     - {product}")
                print(f"     ... e mais {count-3} produtos")
            print()
    
    # Gerar referência de mapeamento
    with open(reference_file, 'w', encoding='utf-8', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            'Geko_Category_ID', 'Geko_Category_Name', 'Geko_Category_Path',
            'Tipo_Produtos', 'Palavras_Chave', 'Compativel_Com_Geko'
        ])
        
        mappings = [
            ('110002', 'Work Gloves', 'Health and Safety Articles\\Work Gloves', 
             'Luvas de proteção, luvas descartáveis', 'luva, glove, guante', 'Sim'),
            ('110003', 'Protective Clothing', 'Health and Safety Articles\\Protective Clothing',
             'Fatos de proteção, roupas impermeáveis', 'fato, parka, impermeável, reflector', 'Sim'),
            ('110006', 'Trowels and Spatulas', 'Construction and Renovation\\Hand Tools\\Trowels and Spatulas',
             'Ferramentas de construção manual', 'espatula, talocha, florentina, colher', 'Sim'),
            ('110007', 'Cutting Discs', 'Abrasive Materials\\Cutting Discs',
             'Discos de corte para várias aplicações', 'disco', 'Sim'),
            ('110008', 'Polishing Materials', 'Abrasive Materials\\Polishing Materials',
             'Materiais para polimento e acabamento', 'esponja, polimento', 'Sim'),
            ('110009', 'Abrasive Accessories', 'Abrasive Materials\\Accessories',
             'Acessórios para ferramentas abrasivas', 'flange', 'Sim'),
            ('110010', 'Cables and Extensions', 'Tools for Electricians\\Cables and Extensions',
             'Cabos elétricos e extensões', 'extensão, bobine, cabo', 'Sim'),
            ('110011', 'Cutting Tools', 'Tools for The Workshop and Garage\\Cutting Tools',
             'Ferramentas de corte manuais', 'lamina, blade, xizato', 'Sim'),
            ('110012', 'General Tools', 'Tools for The Workshop and Garage\\General Tools',
             'Ferramentas gerais de oficina', 'outras ferramentas', 'Sim')
        ]
        
        for mapping in mappings:
            writer.writerow(mapping)
    
    print(f"✅ **FICHEIROS GERADOS:**")
    print(f"   📊 Resumo: {summary_file}")
    print(f"   📋 Referência: {reference_file}")
    print(f"   📁 Original: {input_file}")
    
    return True

if __name__ == "__main__":
    generate_category_summary() 