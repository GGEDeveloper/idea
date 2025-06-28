#!/usr/bin/env python3
import psycopg2

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def main():
    print("🔍 VERIFICAÇÃO ESTRUTURA INTERNAL_VARIANTS")
    print("=" * 50)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # Verificar estrutura internal_variants
    cur.execute("""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'internal_variants'
        ORDER BY ordinal_position
    """)
    colunas = cur.fetchall()
    
    print("📋 Colunas da tabela internal_variants:")
    for col, tipo, nullable in colunas:
        print(f"   - {col}: {tipo} ({'NULL' if nullable == 'YES' else 'NOT NULL'})")
    
    # Verificar se há coluna sort_order
    sort_order_exists = any(col == 'sort_order' for col, _, _ in colunas)
    print(f"\n🔍 Coluna sort_order: {'✅ EXISTE' if sort_order_exists else '❌ NÃO EXISTE'}")
    
    # Ver amostra dos dados
    cur.execute("SELECT * FROM internal_variants LIMIT 3")
    amostras = cur.fetchall()
    print(f"\n📊 Amostra de dados ({len(amostras)} registos):")
    for amostra in amostras:
        print(f"   {amostra}")
    
    conn.close()

if __name__ == "__main__":
    main() 