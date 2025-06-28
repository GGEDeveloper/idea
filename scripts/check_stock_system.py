#!/usr/bin/env python3
"""
Script para verificar o sistema de stock/inventário dos produtos VIP
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys

# Configuração da base de dados Neon
DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def main():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        print("🔍 VERIFICANDO SISTEMA DE STOCK DOS PRODUTOS VIP")
        print("=" * 60)
        
        # Verificar tabelas relacionadas com stock
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND (table_name LIKE '%stock%' OR table_name LIKE '%internal%')
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print("📋 Tabelas encontradas:")
        for table in tables:
            print(f"   • {table['table_name']}")
        
        # Verificar se internal_products tem coluna de stock
        cursor.execute("""
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'internal_products'
            AND (column_name LIKE '%stock%' OR column_name LIKE '%quantity%')
            ORDER BY column_name;
        """)
        
        stock_columns = cursor.fetchall()
        if stock_columns:
            print("\n✅ Colunas de stock em internal_products:")
            for col in stock_columns:
                print(f"   • {col['column_name']} ({col['data_type']})")
        else:
            print("\n❌ Nenhuma coluna de stock encontrada em internal_products")
        
        # Verificar produtos VIP atuais
        cursor.execute("""
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
            FROM internal_products;
        """)
        
        product_stats = cursor.fetchone()
        print(f"\n📊 Produtos VIP: {product_stats['ativos']}/{product_stats['total']} ativos")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 