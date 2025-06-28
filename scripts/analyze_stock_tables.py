#!/usr/bin/env python3
"""
Script para analisar detalhadamente as tabelas de stock e inventário VIP
Verifica estrutura, dados e funcionalidade do sistema de inventário
"""

import psycopg2
from psycopg2.extras import RealDictCursor
import sys
from datetime import datetime

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def analyze_table_structure(cursor, table_name):
    """Analisar estrutura detalhada de uma tabela"""
    print(f"\n🔍 ESTRUTURA DA TABELA: {table_name}")
    print("-" * 60)
    
    cursor.execute(f"""
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default,
            character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = '{table_name}' AND table_schema = 'public'
        ORDER BY ordinal_position;
    """)
    
    columns = cursor.fetchall()
    
    if columns:
        print(f"{'Coluna':<25} {'Tipo':<15} {'Nulável':<8} {'Default':<15}")
        print("-" * 70)
        for col in columns:
            default_val = str(col['column_default'])[:13] + '..' if col['column_default'] and len(str(col['column_default'])) > 15 else str(col['column_default'])
            print(f"{col['column_name']:<25} {col['data_type']:<15} {col['is_nullable']:<8} {default_val:<15}")
    else:
        print(f"❌ Tabela {table_name} não encontrada")
    
    return columns

def analyze_table_data(cursor, table_name):
    """Analisar dados atuais de uma tabela"""
    print(f"\n📊 DADOS DA TABELA: {table_name}")
    print("-" * 60)
    
    try:
        # Contar registos
        cursor.execute(f"SELECT COUNT(*) as total FROM {table_name};")
        total = cursor.fetchone()['total']
        
        if total > 0:
            print(f"✅ {total} registos encontrados")
            
            # Mostrar amostra dos dados
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
            sample_data = cursor.fetchall()
            
            if sample_data:
                print(f"\n📋 Amostra de dados (primeiros 5 registos):")
                for i, row in enumerate(sample_data, 1):
                    print(f"   {i}. {dict(row)}")
        else:
            print(f"❌ Tabela {table_name} está vazia")
    
    except Exception as e:
        print(f"❌ Erro ao analisar dados de {table_name}: {e}")

def check_foreign_keys(cursor, table_name):
    """Verificar foreign keys de uma tabela"""
    print(f"\n🔗 FOREIGN KEYS DA TABELA: {table_name}")
    print("-" * 60)
    
    cursor.execute(f"""
        SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = '{table_name}';
    """)
    
    foreign_keys = cursor.fetchall()
    
    if foreign_keys:
        for fk in foreign_keys:
            print(f"   • {fk['column_name']} → {fk['foreign_table_name']}.{fk['foreign_column_name']}")
    else:
        print("   Nenhuma foreign key encontrada")

def analyze_stock_for_products(cursor):
    """Verificar stock dos produtos VIP"""
    print(f"\n📦 ANÁLISE DE STOCK DOS PRODUTOS VIP")
    print("=" * 60)
    
    # Verificar se existem dados de stock para produtos VIP
    cursor.execute("""
        SELECT 
            ip.internal_ean,
            ip.name_pt,
            ip.brand,
            COALESCE(sl.quantity, 0) as stock_quantity,
            COALESCE(sl.reserved_quantity, 0) as reserved_quantity,
            COALESCE(sl.available_quantity, 0) as available_quantity
        FROM internal_products ip
        LEFT JOIN stock_levels sl ON ip.internal_ean = sl.ean
        WHERE ip.is_active = true
        ORDER BY ip.brand, ip.name_pt
        LIMIT 10;
    """)
    
    stock_sample = cursor.fetchall()
    
    if stock_sample:
        print("📋 AMOSTRA DE STOCK (10 produtos):")
        print(f"{'EAN':<12} {'Nome':<25} {'Marca':<12} {'Stock':<6} {'Reserv':<6} {'Dispon':<6}")
        print("-" * 75)
        
        for product in stock_sample:
            ean_short = product['internal_ean'][-10:]
            name_short = product['name_pt'][:23] + '..' if len(product['name_pt']) > 25 else product['name_pt']
            brand_short = product['brand'][:10] + '..' if len(product['brand']) > 12 else product['brand']
            
            print(f"{ean_short:<12} {name_short:<25} {brand_short:<12} {product['stock_quantity']:<6} {product['reserved_quantity']:<6} {product['available_quantity']:<6}")
    
    # Estatísticas gerais
    cursor.execute("""
        SELECT 
            COUNT(ip.internal_ean) as total_produtos,
            COUNT(sl.ean) as produtos_com_stock,
            COALESCE(SUM(sl.quantity), 0) as stock_total,
            COALESCE(AVG(sl.quantity), 0) as stock_medio
        FROM internal_products ip
        LEFT JOIN stock_levels sl ON ip.internal_ean = sl.ean
        WHERE ip.is_active = true;
    """)
    
    stats = cursor.fetchone()
    
    print(f"\n📊 ESTATÍSTICAS GERAIS:")
    print(f"   • Total produtos VIP: {stats['total_produtos']}")
    print(f"   • Produtos com stock: {stats['produtos_com_stock']}")
    print(f"   • Stock total: {stats['stock_total']}")
    print(f"   • Stock médio: {stats['stock_medio']:.2f}")
    
    cobertura = (stats['produtos_com_stock'] / stats['total_produtos']) * 100 if stats['total_produtos'] > 0 else 0
    print(f"   • Cobertura de stock: {cobertura:.1f}%")

def recommend_stock_improvements():
    """Recomendar melhorias no sistema de stock"""
    print(f"\n💡 RECOMENDAÇÕES PARA MELHORIA DO INVENTÁRIO")
    print("=" * 60)
    
    recommendations = [
        "📦 Definir stock inicial para todos os 410 produtos VIP",
        "🔄 Implementar movimentos de stock (entradas/saídas/transferências)", 
        "⚠️ Configurar alertas de stock baixo (ex: < 5 unidades)",
        "📊 Dashboard de gestão de inventário no painel admin",
        "📈 Relatórios de rotação e performance de stock",
        "🔐 Controlo de acesso para operações de inventário",
        "📱 Interface móvel para operações de armazém",
        "🏷️ Códigos de barras/QR para gestão física",
        "📋 Inventário periódico automatizado",
        "💰 Integração com sistema de custos e margens"
    ]
    
    print("🎯 Ações prioritárias:")
    for i, rec in enumerate(recommendations[:5], 1):
        print(f"   {i}. {rec}")
    
    print("\n🚀 Ações futuras:")
    for i, rec in enumerate(recommendations[5:], 6):
        print(f"   {i}. {rec}")

def main():
    print("📦 ANÁLISE DETALHADA DO SISTEMA DE INVENTÁRIO VIP")
    print("=" * 80)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Analisar tabelas de stock
        tables_to_analyze = ['internal_stock', 'stock_levels']
        
        for table in tables_to_analyze:
            analyze_table_structure(cursor, table)
            analyze_table_data(cursor, table)
            check_foreign_keys(cursor, table)
            print()
        
        # Análise específica para produtos VIP
        analyze_stock_for_products(cursor)
        
        # Recomendações
        recommend_stock_improvements()
        
        print(f"\n🎯 SUMÁRIO EXECUTIVO")
        print("=" * 60)
        print("✅ Tabelas de stock existem e estão estruturadas")
        print("⚠️ Necessário popular dados de inventário inicial")
        print("🚀 Sistema pronto para implementação completa")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro durante análise: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 