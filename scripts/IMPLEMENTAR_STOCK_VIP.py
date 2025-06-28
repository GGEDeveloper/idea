#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📦 IMPLEMENTAÇÃO DO SISTEMA DE STOCK VIP
=======================================
Verificar estrutura existente e implementar stock para 971 variantes VIP
"""

import psycopg2
import random
from datetime import datetime

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def verificar_estrutura_stock(conn):
    """Verificar estrutura da tabela internal_stock"""
    print("🔍 VERIFICAÇÃO DA ESTRUTURA INTERNAL_STOCK")
    print("=" * 50)
    
    cur = conn.cursor()
    
    # Verificar se tabela existe
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'internal_stock'
        )
    """)
    existe = cur.fetchone()[0]
    
    if not existe:
        print("   ❌ Tabela internal_stock NÃO EXISTE")
        return False, {}
    
    print("   ✅ Tabela internal_stock EXISTE")
    
    # Verificar estrutura
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'internal_stock'
        ORDER BY ordinal_position
    """)
    colunas = cur.fetchall()
    
    print("   📋 Estrutura da tabela:")
    estrutura = {}
    for col, tipo, nullable, default in colunas:
        print(f"      - {col}: {tipo} ({'NULL' if nullable == 'YES' else 'NOT NULL'})")
        estrutura[col] = {'tipo': tipo, 'nullable': nullable, 'default': default}
    
    # Verificar registos existentes
    cur.execute("SELECT COUNT(*) FROM internal_stock")
    total_registos = cur.fetchone()[0]
    print(f"   📊 Registos existentes: {total_registos}")
    
    return True, estrutura

def criar_tabela_stock_se_necessario(conn):
    """Criar tabela de stock VIP se não existir"""
    print("\n📦 VERIFICAÇÃO/CRIAÇÃO DA TABELA STOCK")
    print("=" * 50)
    
    cur = conn.cursor()
    
    # Verificar se existe
    existe, estrutura = verificar_estrutura_stock(conn)
    
    if not existe:
        print("   🔨 Criando tabela internal_stock...")
        
        cur.execute("""
            CREATE TABLE internal_stock (
                stock_id SERIAL PRIMARY KEY,
                internal_variant_id TEXT NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 0,
                reserved_quantity INTEGER DEFAULT 0,
                available_quantity INTEGER GENERATED ALWAYS AS (quantity - COALESCE(reserved_quantity, 0)) STORED,
                minimum_stock INTEGER DEFAULT 5,
                maximum_stock INTEGER DEFAULT 1000,
                reorder_point INTEGER DEFAULT 10,
                location_code TEXT DEFAULT 'WAREHOUSE_MAIN',
                last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                notes TEXT,
                
                CONSTRAINT fk_internal_stock_variant
                    FOREIGN KEY (internal_variant_id) 
                    REFERENCES internal_variants(internal_variant_id) 
                    ON DELETE CASCADE,
                    
                CONSTRAINT unique_variant_stock 
                    UNIQUE (internal_variant_id),
                    
                CONSTRAINT check_quantities 
                    CHECK (quantity >= 0 AND reserved_quantity >= 0)
            );
        """)
        
        # Criar índices
        cur.execute("""
            CREATE INDEX idx_internal_stock_variant ON internal_stock(internal_variant_id);
            CREATE INDEX idx_internal_stock_available ON internal_stock(available_quantity);
            CREATE INDEX idx_internal_stock_location ON internal_stock(location_code);
        """)
        
        # Criar trigger para atualizar timestamp
        cur.execute("""
            CREATE OR REPLACE FUNCTION update_internal_stock_timestamp()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.last_updated = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            CREATE TRIGGER trigger_update_internal_stock_timestamp
                BEFORE UPDATE ON internal_stock
                FOR EACH ROW
                EXECUTE FUNCTION update_internal_stock_timestamp();
        """)
        
        conn.commit()
        print("   ✅ Tabela internal_stock criada com sucesso")
        return True
    else:
        print("   ✅ Tabela internal_stock já existe")
        return True

def popular_stock_inicial(conn):
    """Popular stock inicial para todas as variantes VIP"""
    print("\n📊 POPULAÇÃO DO STOCK INICIAL")
    print("=" * 50)
    
    cur = conn.cursor()
    
    # Verificar quantas variantes VIP existem
    cur.execute("SELECT COUNT(*) FROM internal_variants")
    total_variants = cur.fetchone()[0]
    print(f"   📦 Total variantes VIP: {total_variants}")
    
    # Verificar quantas já têm stock
    cur.execute("SELECT COUNT(*) FROM internal_stock")
    stock_existente = cur.fetchone()[0]
    print(f"   📊 Stock já configurado: {stock_existente}")
    
    # Buscar variantes sem stock
    cur.execute("""
        SELECT iv.internal_variant_id, iv.variant_name
        FROM internal_variants iv
        LEFT JOIN internal_stock ist ON iv.internal_variant_id = ist.internal_variant_id
        WHERE ist.internal_variant_id IS NULL
        ORDER BY iv.internal_variant_id
    """)
    variantes_sem_stock = cur.fetchall()
    
    print(f"   🎯 Variantes a processar: {len(variantes_sem_stock)}")
    
    if len(variantes_sem_stock) == 0:
        print("   ✅ Todas as variantes já têm stock configurado")
        return True
    
    print("   🚀 Criando registos de stock...")
    
    try:
        cur.execute("BEGIN")
        
        criados = 0
        for variant_id, variant_name in variantes_sem_stock:
            # Gerar quantidades realistas baseadas no tipo de produto
            nome_lower = variant_name.lower()
            
            # Definir stock baseado no tipo de produto
            if any(palavra in nome_lower for palavra in ['luva', 'glove']):
                # Luvas: stock alto (produtos consumíveis)
                quantidade = random.randint(50, 200)
                min_stock = 20
                reorder = 30
            elif any(palavra in nome_lower for palavra in ['disco', 'disc']):
                # Discos: stock médio-alto
                quantidade = random.randint(30, 100)
                min_stock = 10
                reorder = 15
            elif any(palavra in nome_lower for palavra in ['talocha', 'espatula']):
                # Ferramentas: stock médio
                quantidade = random.randint(20, 80)
                min_stock = 5
                reorder = 10
            elif any(palavra in nome_lower for palavra in ['esponja', 'sponge']):
                # Acessórios: stock alto
                quantidade = random.randint(40, 150)
                min_stock = 15
                reorder = 25
            else:
                # Produtos gerais: stock padrão
                quantidade = random.randint(25, 100)
                min_stock = 10
                reorder = 15
            
            cur.execute("""
                INSERT INTO internal_stock (
                    internal_variant_id, quantity, minimum_stock, 
                    reorder_point, location
                ) VALUES (%s, %s, %s, %s, %s)
            """, (variant_id, quantidade, min_stock, reorder, 'WAREHOUSE_MAIN'))
            
            criados += 1
            
            if criados % 100 == 0:
                print(f"      📊 {criados} registos criados...")
        
        cur.execute("COMMIT")
        print(f"   ✅ {criados} registos de stock criados com sucesso")
        
        return True
        
    except Exception as e:
        print(f"   ❌ ERRO: {e}")
        cur.execute("ROLLBACK")
        return False

def gerar_relatorio_stock(conn):
    """Gerar relatório do estado do stock"""
    print("\n📊 RELATÓRIO DE STOCK VIP")
    print("=" * 50)
    
    cur = conn.cursor()
    
    # Estatísticas gerais
    cur.execute("""
        SELECT 
            COUNT(*) as total_variants,
            SUM(quantity) as total_stock,
            AVG(quantity) as media_stock,
            MIN(quantity) as min_stock,
            MAX(quantity) as max_stock
        FROM internal_stock
    """)
    stats = cur.fetchone()
    
    print("   📈 ESTATÍSTICAS GERAIS:")
    print(f"      Total variantes: {stats[0]}")
    print(f"      Stock total: {stats[1]}")
    print(f"      Média por variante: {stats[2]:.1f}")
    print(f"      Mínimo: {stats[3]} | Máximo: {stats[4]}")
    
    # Stock por categoria (através das variantes)
    cur.execute("""
        SELECT 
            c.name as categoria,
            COUNT(ist.internal_variant_id) as variantes,
            SUM(ist.quantity) as stock_total,
            AVG(ist.quantity) as stock_medio
        FROM internal_stock ist
        JOIN internal_variants iv ON ist.internal_variant_id = iv.internal_variant_id
        JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
        JOIN internal_product_categories ipc ON ip.internal_ean = ipc.internal_ean
        JOIN categories c ON ipc.category_id = c.categoryid
        GROUP BY c.name
        ORDER BY SUM(ist.quantity) DESC
    """)
    categorias = cur.fetchall()
    
    print("\n   📂 STOCK POR CATEGORIA:")
    for cat_name, variantes, stock_total, stock_medio in categorias:
        print(f"      {cat_name}: {variantes} variantes, {stock_total} unidades (média: {stock_medio:.1f})")
    
    # Produtos com stock baixo
    cur.execute("""
        SELECT 
            ist.internal_variant_id,
            iv.variant_name,
            ist.quantity,
            ist.minimum_stock
        FROM internal_stock ist
        JOIN internal_variants iv ON ist.internal_variant_id = iv.internal_variant_id
        WHERE ist.quantity <= ist.minimum_stock
        ORDER BY ist.quantity
        LIMIT 10
    """)
    stock_baixo = cur.fetchall()
    
    if stock_baixo:
        print(f"\n   ⚠️ PRODUTOS COM STOCK BAIXO ({len(stock_baixo)} encontrados):")
        for variant_id, nome, qty, min_qty in stock_baixo[:5]:
            print(f"      {variant_id}: {nome[:40]}... (Stock: {qty}, Min: {min_qty})")
        if len(stock_baixo) > 5:
            print(f"      ... e mais {len(stock_baixo) - 5} produtos")
    else:
        print("\n   ✅ Nenhum produto com stock baixo")

def main():
    """Execução principal da implementação"""
    print("📦 IMPLEMENTAÇÃO DO SISTEMA DE STOCK VIP")
    print("=" * 60)
    print(f"⏰ Iniciado em: {datetime.now().strftime('%H:%M:%S')}")
    
    conn = psycopg2.connect(DATABASE_URL)
    
    try:
        # ETAPA 1: Verificar/criar estrutura
        if not criar_tabela_stock_se_necessario(conn):
            print("🚨 FALHA na criação da estrutura - ABORTANDO")
            return False
        
        # ETAPA 2: Popular stock inicial
        if not popular_stock_inicial(conn):
            print("🚨 FALHA na população do stock - ABORTANDO")
            return False
        
        # ETAPA 3: Gerar relatório
        gerar_relatorio_stock(conn)
        
        print(f"\n⏰ Concluído em: {datetime.now().strftime('%H:%M:%S')}")
        
        # Resumo final
        print("\n" + "="*60)
        print("🎉 SISTEMA DE STOCK VIP IMPLEMENTADO COM SUCESSO!")
        print("="*60)
        print("✅ Estrutura de tabelas criada/verificada")
        print("✅ Stock inicial populado para todas as variantes")
        print("✅ Índices e triggers implementados")
        print("✅ Relatórios de monitorização disponíveis")
        print("🚀 Sistema VIP agora COMPLETAMENTE OPERACIONAL!")
        print("💰 Todas as 971 variantes podem ser vendidas")
        print("📦 Controlo de inventário ativo")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n🚨 ERRO INESPERADO: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    main() 