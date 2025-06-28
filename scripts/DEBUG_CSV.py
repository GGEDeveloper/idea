#!/usr/bin/env python3
"""
DEBUG DO CSV - Ver exatamente o que está acontecendo
"""

import csv

CSV_FILE = '../aa-elementos-novos/csv-produtos/catalog_products_LIMPO.csv'

def debug_csv():
    """Debug direto do CSV"""
    print("🔍 DEBUG DIRETO DO CSV")
    print("=" * 40)
    
    with open(CSV_FILE, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        print("CAMPOS:", reader.fieldnames[:10])  # Primeiros 10 campos
        
        for i, row in enumerate(reader):
            if i >= 10:  # Só as primeiras 10 linhas
                break
                
            print(f"\nLINHA {i+1}:")
            print(f"  handleId: '{row.get('handleId')}'")
            print(f"  fieldType: '{row.get('fieldType')}'")
            print(f"  name: '{row.get('name')}'")
            print(f"  price: '{row.get('price')}'")
            print(f"  brand: '{row.get('brand')}'")
            
            # Verificar se handleId começa com product_
            handle_id = row.get('handleId', '')
            if handle_id and handle_id.startswith('product_'):
                ean_base = handle_id.replace('product_', '').split('-')[0][:8]
                ean = f"INT_{ean_base.upper()}"
                print(f"  -> EAN gerado: {ean}")
            else:
                print(f"  -> handleId não válido para EAN")

if __name__ == "__main__":
    debug_csv() 