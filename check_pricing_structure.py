#!/usr/bin/env python3
import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def check_structure():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("🔍 ESTRUTURA DA TABELA internal_pricing")
    print("=" * 50)
    
    cursor.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'internal_pricing' 
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    for col in columns:
        print(f"   • {col['column_name']} ({col['data_type']})")
    
    # Verificar dados de exemplo
    cursor.execute("SELECT * FROM internal_pricing LIMIT 3;")
    sample = cursor.fetchall()
    
    print(f"\n📋 Amostra de dados:")
    for i, row in enumerate(sample, 1):
        print(f"   {i}. {dict(row)}")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    check_structure()
