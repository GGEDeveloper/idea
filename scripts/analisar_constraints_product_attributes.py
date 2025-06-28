#!/usr/bin/env python3
"""
🔍 ANÁLISE DE CONSTRAINTS - PRODUCT_ATTRIBUTES
=============================================

Analisa as foreign key constraints da tabela product_attributes
para entender como inserir atributos VIP corretamente.
"""

import psycopg2

def conectar_bd():
    """Conecta à BD usando credenciais Neon"""
    try:
        db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
        conn = psycopg2.connect(db_url)
        return conn
    except Exception as e:
        print(f"❌ Erro conexão BD: {e}")
        return None

def analisar_constraints(conn):
    """Analisa as constraints da tabela product_attributes"""
    print("🔍 CONSTRAINTS DA TABELA product_attributes")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Ver constraints
            cur.execute("""
                SELECT 
                    conname as constraint_name,
                    confrelid::regclass as foreign_table,
                    pg_get_constraintdef(oid) as definition
                FROM pg_constraint 
                WHERE conrelid = 'product_attributes'::regclass 
                AND contype = 'f';
            """)
            
            constraints = cur.fetchall()
            
            if constraints:
                print("Foreign Key Constraints encontradas:")
                for constraint in constraints:
                    print(f"  • {constraint[0]}: {constraint[1]}")
                    print(f"    Definição: {constraint[2]}")
                    print()
            else:
                print("❌ Nenhuma foreign key constraint encontrada!")
                
    except Exception as e:
        print(f"❌ Erro ao analisar constraints: {e}")

def verificar_estrutura_tabela(conn):
    """Verifica a estrutura da tabela product_attributes"""
    print("\n📋 ESTRUTURA DA TABELA product_attributes")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    column_name, 
                    data_type, 
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_name = 'product_attributes'
                ORDER BY ordinal_position;
            """)
            
            colunas = cur.fetchall()
            print("Colunas:")
            for col in colunas:
                print(f"  • {col[0]} ({col[1]}) - Null: {col[2]} - Default: {col[3]}")
                
    except Exception as e:
        print(f"❌ Erro ao verificar estrutura: {e}")

def verificar_tabelas_existentes(conn):
    """Verifica que tabelas existem relacionadas a produtos"""
    print("\n🗂️ TABELAS RELACIONADAS A PRODUTOS")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Buscar tabelas que contêm "product" no nome
            cur.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name LIKE '%product%' 
                AND table_schema = 'public'
                ORDER BY table_name;
            """)
            
            tabelas = cur.fetchall()
            print("Tabelas relacionadas a produtos:")
            for tabela in tabelas:
                print(f"  • {tabela[0]}")
                
            # Verificar se internal_products existe
            cur.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = 'internal_products';
            """)
            
            internal_exists = cur.fetchone()[0]
            if internal_exists:
                print(f"\n✅ Tabela 'internal_products' existe")
                
                # Ver alguns exemplos de EANs
                cur.execute("SELECT internal_ean FROM internal_products LIMIT 5;")
                examples = cur.fetchall()
                print("Exemplos de internal_ean:")
                for ex in examples:
                    print(f"  • {ex[0]}")
            else:
                print(f"\n❌ Tabela 'internal_products' NÃO existe!")
                
    except Exception as e:
        print(f"❌ Erro ao verificar tabelas: {e}")

def sugerir_solucoes():
    """Sugere soluções para o problema"""
    print("\n💡 SOLUÇÕES POSSÍVEIS")
    print("=" * 50)
    
    print("""
BASEADO NA ANÁLISE, TEMOS 3 OPÇÕES:

1. 🔧 **CRIAR CONSTRAINT PARA INTERNAL_PRODUCTS**
   - Adicionar FK constraint que aceite internal_ean
   - Permitir product_attributes aceitar produtos VIP
   - Mantém estrutura existente

2. 🔄 **MODIFICAR CONSTRAINT EXISTENTE**
   - Alterar constraint para aceitar ambas as tabelas
   - Usar UNION ou OR condition
   - Mais complexo mas flexível

3. 🏗️ **CRIAR TABELA SEPARADA**
   - internal_product_attributes (espelho da product_attributes)
   - Isolamento total (como outras tabelas VIP)
   - Consistente com arquitetura existente

RECOMENDAÇÃO: Opção 3 - Consistente com estratégia VIP existente
""")

def main():
    print("🔍 ANÁLISE DE CONSTRAINTS - PRODUCT_ATTRIBUTES")
    print("=" * 60)
    
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        analisar_constraints(conn)
        verificar_estrutura_tabela(conn)
        verificar_tabelas_existentes(conn)
        sugerir_solucoes()
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 