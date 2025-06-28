#!/usr/bin/env python3
"""
Script para implementar sistema de inventário VIP
Popula tabela internal_stock com dados iniciais para todos os produtos VIP
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import random
from datetime import datetime, date

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def get_vip_variants(cursor):
    """Obter todas as variantes VIP que precisam de stock"""
    print("🔍 OBTENDO VARIANTES VIP PARA INVENTÁRIO")
    print("-" * 60)
    
    cursor.execute("""
        SELECT 
            iv.internal_variant_id,
            iv.internal_ean,
            iv.variant_name,
            ip.name_pt,
            ip.brand,
            ip.base_cost
        FROM internal_variants iv
        JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
        WHERE iv.is_active = true AND ip.is_active = true
        ORDER BY ip.brand, ip.name_pt, iv.sort_order;
    """)
    
    variants = cursor.fetchall()
    print(f"✅ {len(variants)} variantes VIP encontradas para inventário")
    
    return variants

def generate_realistic_stock(base_cost, brand):
    """Gerar stock realista baseado no custo e marca"""
    
    if base_cost is None:
        base_cost = 5.0  # Default para produtos sem custo
    
    if base_cost < 2.0:  # Produtos baratos
        min_stock, max_stock = 50, 200
        reorder_point = 15
    elif base_cost < 10.0:  # Produtos médios
        min_stock, max_stock = 20, 100
        reorder_point = 10
    elif base_cost < 30.0:  # Produtos caros
        min_stock, max_stock = 10, 50
        reorder_point = 5
    else:  # Produtos muito caros
        min_stock, max_stock = 5, 25
        reorder_point = 3
    
    # Gerar valores aleatórios dentro das faixas
    current_stock = random.randint(min_stock, max_stock)
    minimum_stock = max(5, int(min_stock * 0.3))
    maximum_stock = int(max_stock * 1.2)
    
    return {
        'quantity': current_stock,
        'minimum_stock': minimum_stock,
        'maximum_stock': maximum_stock,
        'reorder_point': reorder_point,
        'reserved_quantity': 0
    }

def main():
    print("📦 IMPLEMENTAÇÃO DO SISTEMA DE INVENTÁRIO VIP")
    print("=" * 60)
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        variants = get_vip_variants(cursor)
        print(f"✅ {len(variants)} variantes encontradas")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    main()
