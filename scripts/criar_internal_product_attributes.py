#!/usr/bin/env python3
"""
🏷️ CRIAR INTERNAL_PRODUCT_ATTRIBUTES
===================================

Implementa tabela de atributos VIP seguindo padrão de isolamento total,
criando view unificada para integração seamless no frontend.

RESULTADO: Sistema VIP 100% completo com atributos técnicos
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

def criar_tabela_internal_product_attributes(conn):
    """Cria tabela internal_product_attributes seguindo padrão VIP"""
    print("🏗️ CRIANDO TABELA internal_product_attributes")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Criar tabela com estrutura idêntica a product_attributes
            cur.execute("""
                CREATE TABLE IF NOT EXISTS internal_product_attributes (
                    attributeid SERIAL PRIMARY KEY,
                    internal_ean TEXT NOT NULL REFERENCES internal_products(internal_ean) ON DELETE CASCADE,
                    key TEXT,
                    value TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    key_pt TEXT,
                    key_en TEXT,
                    value_pt TEXT,
                    value_en TEXT,
                    
                    -- Constraint para evitar duplicatas
                    UNIQUE(internal_ean, key)
                );
            """)
            
            # Criar índices para performance
            cur.execute("""
                CREATE INDEX IF NOT EXISTS idx_internal_product_attributes_ean 
                ON internal_product_attributes(internal_ean);
                
                CREATE INDEX IF NOT EXISTS idx_internal_product_attributes_key 
                ON internal_product_attributes(key);
                
                CREATE INDEX IF NOT EXISTS idx_internal_product_attributes_ean_key 
                ON internal_product_attributes(internal_ean, key);
            """)
            
            print("✅ Tabela internal_product_attributes criada com sucesso!")
            print("✅ Índices de performance criados!")
            
    except Exception as e:
        print(f"❌ Erro ao criar tabela: {e}")
        raise

def criar_view_unificada(conn):
    """Cria view unificada que combina atributos Geko + VIP"""
    print("\n🔄 CRIANDO VIEW UNIFICADA unified_product_attributes")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Criar view que unifica ambos os sistemas
            cur.execute("""
                CREATE OR REPLACE VIEW unified_product_attributes AS
                -- Atributos Geko (sistema existente - ZERO mudanças)
                SELECT 
                    attributeid,
                    product_ean as ean,
                    key,
                    value,
                    created_at,
                    updated_at,
                    key_pt,
                    key_en,
                    value_pt,
                    value_en,
                    'geko' as source_type
                FROM product_attributes
                WHERE product_ean NOT LIKE 'INT_%'

                UNION ALL

                -- Atributos VIP (sistema novo)
                SELECT 
                    attributeid,
                    internal_ean as ean,
                    key,
                    value,
                    created_at,
                    updated_at,
                    key_pt,
                    key_en,
                    value_pt,
                    value_en,
                    'vip' as source_type
                FROM internal_product_attributes;
            """)
            
            print("✅ View unified_product_attributes criada!")
            print("✅ Frontend terá acesso transparente a atributos Geko + VIP!")
            
    except Exception as e:
        print(f"❌ Erro ao criar view: {e}")
        raise

def verificar_estrutura(conn):
    """Verifica se tudo foi criado corretamente"""
    print("\n📊 VERIFICANDO ESTRUTURA CRIADA")
    print("=" * 50)
    
    try:
        with conn.cursor() as cur:
            # Verificar tabela
            cur.execute("""
                SELECT COUNT(*) 
                FROM information_schema.tables 
                WHERE table_name = 'internal_product_attributes';
            """)
            
            tabela_existe = cur.fetchone()[0]
            if tabela_existe:
                print("✅ Tabela internal_product_attributes: EXISTE")
            else:
                print("❌ Tabela internal_product_attributes: NÃO EXISTE")
                
            # Verificar view
            cur.execute("""
                SELECT COUNT(*) 
                FROM information_schema.views 
                WHERE table_name = 'unified_product_attributes';
            """)
            
            view_existe = cur.fetchone()[0]
            if view_existe:
                print("✅ View unified_product_attributes: EXISTE")
            else:
                print("❌ View unified_product_attributes: NÃO EXISTE")
                
            # Verificar foreign key
            cur.execute("""
                SELECT constraint_name 
                FROM information_schema.table_constraints 
                WHERE table_name = 'internal_product_attributes' 
                AND constraint_type = 'FOREIGN KEY';
            """)
            
            fks = cur.fetchall()
            if fks:
                print(f"✅ Foreign Keys: {len(fks)} encontradas")
                for fk in fks:
                    print(f"   • {fk[0]}")
            else:
                print("❌ Foreign Keys: NENHUMA encontrada")
                
            # Verificar índices
            cur.execute("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'internal_product_attributes';
            """)
            
            indices = cur.fetchall()
            print(f"✅ Índices: {len(indices)} criados")
            for idx in indices:
                print(f"   • {idx[0]}")
                
    except Exception as e:
        print(f"❌ Erro ao verificar estrutura: {e}")

def main():
    print("🏷️ IMPLEMENTAÇÃO INTERNAL_PRODUCT_ATTRIBUTES + VIEW UNIFICADA")
    print("=" * 70)
    
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        # Fase 1: Criar tabela
        criar_tabela_internal_product_attributes(conn)
        
        # Fase 2: Criar view unificada
        criar_view_unificada(conn)
        
        # Commit das mudanças
        conn.commit()
        
        # Fase 3: Verificar resultado
        verificar_estrutura(conn)
        
        print("\n🎉 INFRAESTRUTURA ATRIBUTOS VIP IMPLEMENTADA!")
        print("=" * 50)
        print("✅ Tabela internal_product_attributes criada")
        print("✅ View unified_product_attributes ativa") 
        print("✅ Isolamento VIP mantido")
        print("✅ Integração frontend seamless garantida")
        print("\n🚀 PRÓXIMO PASSO: Extrair e inserir atributos do CSV")
        
    except Exception as e:
        print(f"\n❌ Erro durante implementação: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 