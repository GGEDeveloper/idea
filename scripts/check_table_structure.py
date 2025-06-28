#!/usr/bin/env python3
"""
Script para verificar estrutura das tabelas internas
"""

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def check_table_structure():
    """Verificar estrutura das tabelas internas"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print("🔍 Verificando estrutura das tabelas internas")
            print("=" * 60)
            
            # Verificar se as tabelas existem
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name LIKE 'internal_%'
                ORDER BY table_name
            """)
            tables = cursor.fetchall()
            
            print("📋 Tabelas internas encontradas:")
            for table in tables:
                print(f"   • {table['table_name']}")
            
            # Verificar estrutura de cada tabela
            for table in tables:
                table_name = table['table_name']
                print(f"\n📊 Estrutura da tabela '{table_name}':")
                
                cursor.execute("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns 
                    WHERE table_name = %s 
                    AND table_schema = 'public'
                    ORDER BY ordinal_position
                """, (table_name,))
                
                columns = cursor.fetchall()
                for col in columns:
                    print(f"   • {col['column_name']} ({col['data_type']}) - Nullable: {col['is_nullable']}")
            
            # Verificar número de registros
            print(f"\n📈 Número de registros:")
            for table in tables:
                table_name = table['table_name']
                cursor.execute(f"SELECT COUNT(*) as count FROM {table_name}")
                count = cursor.fetchone()['count']
                print(f"   • {table_name}: {count} registros")
                
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    check_table_structure() 