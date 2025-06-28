#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para mapear categorias dos produtos CSV para categorias Geko existentes
"""

import csv
import re
import os
from datetime import datetime

# Mapeamento de categorias baseado nas categorias Geko existentes
CATEGORY_MAPPING = {
    # Segurança e EPIs
    'health_safety': {
        'category_id': '110001',  # Health and Safety Articles
        'category_name': 'Health and Safety Articles',
        'category_path': 'Health and Safety Articles',
        'subcategories': {
            'gloves': {
                'category_id': '110002',
                'category_name': 'Work Gloves', 
                'category_path': 'Health and Safety Articles\\Work Gloves'
            },
            'clothing': {
                'category_id': '110003',
                'category_name': 'Protective Clothing',
                'category_path': 'Health and Safety Articles\\Protective Clothing'
            },
            'disposable': {
                'category_id': '110004', 
                'category_name': 'Disposable Equipment',
                'category_path': 'Health and Safety Articles\\Disposable Equipment'
            }
        }
    },
    
    # Construção e Renovação
    'construction': {
        'category_id': '107763',  # Construction and Renovation (ID real do Geko)
        'category_name': 'Construction and Renovation',
        'category_path': 'Construction and Renovation',
        'subcategories': {
            'hand_tools': {
                'category_id': '110005',
                'category_name': 'Hand Tools',
                'category_path': 'Construction and Renovation\\Hand Tools'
            },
            'trowels': {
                'category_id': '110006',
                'category_name': 'Trowels and Spatulas', 
                'category_path': 'Construction and Renovation\\Hand Tools\\Trowels and Spatulas'
            }
        }
    },
    
    # Materiais Abrasivos
    'abrasive': {
        'category_id': '107854',  # Abrasive Materials (ID real do Geko)
        'category_name': 'Abrasive Materials',
        'category_path': 'Abrasive Materials',
        'subcategories': {
            'cutting_discs': {
                'category_id': '110007',
                'category_name': 'Cutting Discs',
                'category_path': 'Abrasive Materials\\Cutting Discs'
            },
            'polishing': {
                'category_id': '110008',
                'category_name': 'Polishing Materials',
                'category_path': 'Abrasive Materials\\Polishing Materials'
            },
            'accessories': {
                'category_id': '110009',
                'category_name': 'Abrasive Accessories',
                'category_path': 'Abrasive Materials\\Accessories'
            }
        }
    },
    
    # Ferramentas para Eletricistas
    'electrical': {
        'category_id': '107712',  # Tools for Electricians (ID real do Geko)
        'category_name': 'Tools for Electricians',
        'category_path': 'Tools for Electricians',
        'subcategories': {
            'cables': {
                'category_id': '110010',
                'category_name': 'Cables and Extensions',
                'category_path': 'Tools for Electricians\\Cables and Extensions'
            }
        }
    },
    
    # Ferramentas de Oficina
    'workshop': {
        'category_id': '107712',  # Tools for The Workshop and Garage (ID real do Geko)
        'category_name': 'Tools for The Workshop and Garage', 
        'category_path': 'Tools for The Workshop and Garage',
        'subcategories': {
            'cutting_tools': {
                'category_id': '110011',
                'category_name': 'Cutting Tools',
                'category_path': 'Tools for The Workshop and Garage\\Cutting Tools'
            },
            'general': {
                'category_id': '110012',
                'category_name': 'General Tools',
                'category_path': 'Tools for The Workshop and Garage\\General Tools'
            }
        }
    }
}

def clean_product_name(name):
    """Limpa e normaliza o nome do produto para análise"""
    if not name or name.strip() == '':
        return ''
    
    # Remove aspas extras e espaços
    cleaned = name.strip().strip('"').strip()
    return cleaned.lower()

def categorize_product(product_name):
    """
    Categoriza um produto baseado no seu nome
    Retorna tupla: (category_id, category_name, category_path)
    """
    if not product_name:
        return ('110000', 'Uncategorized', 'Uncategorized')
    
    name_lower = clean_product_name(product_name)
    
    # Regras de categorização baseadas em palavras-chave
    
    # 1. EPIs e Segurança
    if any(keyword in name_lower for keyword in ['luva', 'glove', 'guante']):
        return (
            CATEGORY_MAPPING['health_safety']['subcategories']['gloves']['category_id'],
            CATEGORY_MAPPING['health_safety']['subcategories']['gloves']['category_name'],
            CATEGORY_MAPPING['health_safety']['subcategories']['gloves']['category_path']
        )
    
    if any(keyword in name_lower for keyword in ['fato', 'parka', 'impermeável', 'reflector', 'descartável']):
        return (
            CATEGORY_MAPPING['health_safety']['subcategories']['clothing']['category_id'],
            CATEGORY_MAPPING['health_safety']['subcategories']['clothing']['category_name'], 
            CATEGORY_MAPPING['health_safety']['subcategories']['clothing']['category_path']
        )
    
    # 2. Construção - Ferramentas manuais
    if any(keyword in name_lower for keyword in ['espatula', 'talocha', 'florentina', 'colher']):
        return (
            CATEGORY_MAPPING['construction']['subcategories']['trowels']['category_id'],
            CATEGORY_MAPPING['construction']['subcategories']['trowels']['category_name'],
            CATEGORY_MAPPING['construction']['subcategories']['trowels']['category_path']
        )
    
    # 3. Abrasivos - Discos e acessórios
    if any(keyword in name_lower for keyword in ['disco', 'disc']):
        return (
            CATEGORY_MAPPING['abrasive']['subcategories']['cutting_discs']['category_id'],
            CATEGORY_MAPPING['abrasive']['subcategories']['cutting_discs']['category_name'],
            CATEGORY_MAPPING['abrasive']['subcategories']['cutting_discs']['category_path']
        )
    
    if any(keyword in name_lower for keyword in ['esponja', 'polimento', 'polishing']):
        return (
            CATEGORY_MAPPING['abrasive']['subcategories']['polishing']['category_id'],
            CATEGORY_MAPPING['abrasive']['subcategories']['polishing']['category_name'],
            CATEGORY_MAPPING['abrasive']['subcategories']['polishing']['category_path']
        )
    
    if any(keyword in name_lower for keyword in ['flange']):
        return (
            CATEGORY_MAPPING['abrasive']['subcategories']['accessories']['category_id'],
            CATEGORY_MAPPING['abrasive']['subcategories']['accessories']['category_name'],
            CATEGORY_MAPPING['abrasive']['subcategories']['accessories']['category_path']
        )
    
    # 4. Elétrico
    if any(keyword in name_lower for keyword in ['extensão', 'extension', 'bobine', 'cabo', 'cable']):
        return (
            CATEGORY_MAPPING['electrical']['subcategories']['cables']['category_id'],
            CATEGORY_MAPPING['electrical']['subcategories']['cables']['category_name'],
            CATEGORY_MAPPING['electrical']['subcategories']['cables']['category_path']
        )
    
    # 5. Ferramentas de corte
    if any(keyword in name_lower for keyword in ['lamina', 'blade', 'xizato', 'knife']):
        return (
            CATEGORY_MAPPING['workshop']['subcategories']['cutting_tools']['category_id'],
            CATEGORY_MAPPING['workshop']['subcategories']['cutting_tools']['category_name'],
            CATEGORY_MAPPING['workshop']['subcategories']['cutting_tools']['category_path']
        )
    
    # Default: Ferramentas gerais
    return (
        CATEGORY_MAPPING['workshop']['subcategories']['general']['category_id'],
        CATEGORY_MAPPING['workshop']['subcategories']['general']['category_name'],
        CATEGORY_MAPPING['workshop']['subcategories']['general']['category_path']
    )

def process_csv(input_file, output_file):
    """
    Processa o CSV original e adiciona categorias mapeadas
    """
    print(f"📂 Processando: {input_file}")
    print(f"📤 Saída: {output_file}")
    
    products_processed = 0
    products_categorized = 0
    category_stats = {}
    
    try:
        with open(input_file, 'r', encoding='utf-8') as infile, \
             open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            
            reader = csv.DictReader(infile)
            
            # Cabeçalhos originais + novos campos de categoria
            fieldnames = reader.fieldnames + [
                'geko_category_id', 
                'geko_category_name', 
                'geko_category_path',
                'mapping_timestamp'
            ]
            
            writer = csv.DictWriter(outfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for row in reader:
                products_processed += 1
                
                # Só processar linhas de Product (não Variant)
                if row.get('fieldType') == 'Product':
                    product_name = row.get('name', '')
                    
                    # Categorizar produto
                    category_id, category_name, category_path = categorize_product(product_name)
                    
                    # Adicionar campos de categoria
                    row['geko_category_id'] = category_id
                    row['geko_category_name'] = category_name
                    row['geko_category_path'] = category_path
                    row['mapping_timestamp'] = datetime.now().isoformat()
                    
                    products_categorized += 1
                    
                    # Estatísticas
                    if category_name not in category_stats:
                        category_stats[category_name] = 0
                    category_stats[category_name] += 1
                    
                    if products_categorized % 50 == 0:
                        print(f"   ✅ {products_categorized} produtos categorizados...")
                
                # Escrever linha (Product ou Variant)
                writer.writerow(row)
        
        print(f"\n🎯 **PROCESSAMENTO COMPLETO**")
        print(f"   📊 Total de linhas processadas: {products_processed}")
        print(f"   🏷️ Produtos categorizados: {products_categorized}")
        
        print(f"\n📈 **ESTATÍSTICAS POR CATEGORIA:**")
        for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {category}: {count} produtos")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar CSV: {e}")
        return False

def main():
    """Função principal"""
    print("🔄 **MAPEAMENTO AUTOMÁTICO DE CATEGORIAS**")
    print("=" * 50)
    
    # Caminhos dos ficheiros
    input_file = "aa-elementos-novos/csv-produtos/catalog_products (1).csv"
    output_file = "aa-elementos-novos/csv-produtos/catalog_products_with_categories.csv"
    
    # Verificar se ficheiro existe
    if not os.path.exists(input_file):
        print(f"❌ Ficheiro não encontrado: {input_file}")
        return False
    
    # Processar CSV
    success = process_csv(input_file, output_file)
    
    if success:
        print(f"\n✅ **MAPEAMENTO CONCLUÍDO COM SUCESSO!**")
        print(f"📁 Ficheiro gerado: {output_file}")
        print(f"\n📋 **PRÓXIMOS PASSOS:**")
        print("   1. Verificar ficheiro gerado")
        print("   2. Ajustar mapeamentos se necessário") 
        print("   3. Importar para sistema de categorias")
    else:
        print(f"\n❌ **ERRO NO MAPEAMENTO**")
    
    return success

if __name__ == "__main__":
    main() 