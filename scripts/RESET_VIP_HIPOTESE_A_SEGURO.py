#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🏆 HIPÓTESE A: RESET COMPLETO ÁREA VIP (ULTRA-SEGURO)
====================================================

OBJECTIVO: Reset completo das tabelas internal_* com máxima segurança
GARANTIA: ZERO impacto no sistema Geko
BACKUP: Completo antes de qualquer operação
ROLLBACK: Disponível a qualquer momento

⚠️ IMPORTANTE: Seguir regras do projeto - TUDO aprovado pelo USER
"""

import psycopg2
import sys
import json
import csv
from datetime import datetime
from pathlib import Path

# Configuração da base de dados
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

# Tabelas VIP a serem resetadas (APENAS ESTAS)
TABELAS_VIP = [
    'internal_stock',              # Sem foreign keys - primeira a limpar
    'internal_product_attributes', # FK para internal_products
    'internal_product_images',     # FK para internal_products  
    'internal_pricing',            # FK para internal_variants
    'internal_product_categories', # FK para internal_products
    'internal_variants',           # FK para internal_products
    'internal_products'            # Tabela principal - última a limpar
]

# Tabelas NUNCA TOCAR (sistema partilhado)
TABELAS_PROTEGIDAS = [
    'products', 'product_variants', 'product_categories', 'prices', 
    'product_images', 'geko_products', 'categories', 'price_lists',
    'users', 'roles', 'permissions', 'orders', 'order_items'
]

def conectar_bd():
    """Conectar à base de dados com tratamento de erro"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False  # Transações manuais para máximo controlo
        return conn
    except Exception as e:
        print(f"❌ ERRO CRÍTICO: Não foi possível conectar à BD: {e}")
        sys.exit(1)

def verificar_isolamento_geko(conn):
    """VERIFICAÇÃO CRÍTICA: Garantir que sistema Geko está intocado"""
    print("\n🛡️ VERIFICAÇÃO CRÍTICA: ISOLAMENTO SISTEMA GEKO")
    print("="*60)
    
    cur = conn.cursor()
    
    # 1. Verificar contaminação cruzada
    verificacoes = [
        ("Produtos Geko com EAN INT_", "SELECT COUNT(*) FROM products WHERE ean LIKE 'INT_%'", 0),
        ("Variantes Geko com EAN INT_", "SELECT COUNT(*) FROM product_variants WHERE ean LIKE 'INT_%'", 0),
        ("Total produtos Geko", "SELECT COUNT(*) FROM products", 8126),
        ("Total variantes Geko", "SELECT COUNT(*) FROM product_variants", 8126),
        ("Categorias partilhadas (416 Geko + 1 VIP)", "SELECT COUNT(*) FROM categories", 417),
        ("Price lists partilhadas", "SELECT COUNT(*) FROM price_lists", 4)
    ]
    
    for desc, query, valor_esperado in verificacoes:
        cur.execute(query)
        valor_actual = cur.fetchone()[0]
        
        if valor_actual == valor_esperado:
            print(f"   ✅ {desc}: {valor_actual} (CORRETO)")
        else:
            print(f"   ❌ {desc}: {valor_actual} (ESPERADO: {valor_esperado})")
            print(f"   🚨 ERRO CRÍTICO: Isolamento comprometido!")
            return False
    
    print("   🎯 ISOLAMENTO GEKO CONFIRMADO - SEGURO PROCEDER")
    return True

def criar_backup_completo(conn):
    """Criar backup completo de todas as tabelas VIP"""
    print("\n💾 FASE 1: BACKUP COMPLETO DAS TABELAS VIP")
    print("="*60)
    
    cur = conn.cursor()
    backup_info = {
        'timestamp': datetime.now().isoformat(),
        'tabelas': {}
    }
    
    for tabela in TABELAS_VIP:
        try:
            # Contar registos actuais
            cur.execute(f"SELECT COUNT(*) FROM {tabela}")
            total_registos = cur.fetchone()[0]
            
            # Criar tabela de backup
            backup_table = f"backup_{tabela}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            cur.execute(f"CREATE TABLE {backup_table} AS SELECT * FROM {tabela}")
            
            # Verificar backup
            cur.execute(f"SELECT COUNT(*) FROM {backup_table}")
            backup_registos = cur.fetchone()[0]
            
            if total_registos == backup_registos:
                print(f"   ✅ {tabela}: {total_registos} registos → {backup_table}")
                backup_info['tabelas'][tabela] = {
                    'registos_originais': total_registos,
                    'backup_table': backup_table,
                    'backup_registos': backup_registos,
                    'status': 'SUCCESS'
                }
            else:
                print(f"   ❌ {tabela}: ERRO no backup ({total_registos} ≠ {backup_registos})")
                return None
                
        except Exception as e:
            print(f"   ❌ {tabela}: ERRO - {e}")
            return None
    
    # Salvar informações do backup
    with open('backup_info_vip.json', 'w') as f:
        json.dump(backup_info, f, indent=2)
    
    print("   🎯 BACKUP COMPLETO CRIADO COM SUCESSO")
    return backup_info

def validar_estado_pre_reset(conn):
    """Validação completa do estado antes do reset"""
    print("\n🔍 FASE 2: VALIDAÇÃO ESTADO PRÉ-RESET")
    print("="*60)
    
    cur = conn.cursor()
    
    # Estatísticas actuais
    stats = {}
    for tabela in TABELAS_VIP:
        cur.execute(f"SELECT COUNT(*) FROM {tabela}")
        stats[tabela] = cur.fetchone()[0]
        print(f"   📊 {tabela}: {stats[tabela]} registos")
    
    # Verificações específicas dos problemas conhecidos
    verificacoes_problemas = [
        ("Produtos sem preço", "SELECT COUNT(*) FROM internal_products WHERE base_cost IS NULL OR base_cost = 0"),
        ("Produtos sem variantes", """
            SELECT COUNT(*) FROM internal_products ip
            LEFT JOIN internal_variants iv ON ip.internal_ean = iv.internal_ean
            WHERE iv.internal_ean IS NULL
        """),
        ("Variantes órfãs", """
            SELECT COUNT(*) FROM internal_variants iv
            LEFT JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
            WHERE ip.internal_ean IS NULL
        """)
    ]
    
    print("\n   🔍 PROBLEMAS CONHECIDOS:")
    for desc, query in verificacoes_problemas:
        cur.execute(query)
        count = cur.fetchone()[0]
        print(f"   ⚠️ {desc}: {count}")
    
    return stats

def executar_reset_seguro(conn):
    """Executar reset das tabelas VIP com máxima segurança"""
    print("\n🧹 FASE 3: RESET SEGURO DAS TABELAS VIP")
    print("="*60)
    
    cur = conn.cursor()
    
    # Confirmação final
    print("   ⚠️ ATENÇÃO: Vai proceder ao reset das tabelas VIP")
    print("   📋 Tabelas a limpar:", TABELAS_VIP)
    print("   🛡️ Sistema Geko: PRESERVADO")
    print("   💾 Backup: CRIADO")
    
    resposta = input("\n   🤔 Confirmar reset? (escreve 'RESET' para confirmar): ")
    if resposta != 'RESET':
        print("   🛑 OPERAÇÃO CANCELADA pelo utilizador")
        return False
    
    try:
        # Iniciar transação
        cur.execute("BEGIN")
        
        # Limpar tabelas na ordem correcta (foreign keys)
        for tabela in TABELAS_VIP:
            print(f"   🧹 Limpando {tabela}...")
            cur.execute(f"DELETE FROM {tabela}")
            deleted = cur.rowcount
            print(f"      ✅ {deleted} registos removidos")
        
        # Verificar que tabelas estão vazias
        print("\n   🔍 VERIFICAÇÃO PÓS-LIMPEZA:")
        for tabela in TABELAS_VIP:
            cur.execute(f"SELECT COUNT(*) FROM {tabela}")
            remaining = cur.fetchone()[0]
            if remaining == 0:
                print(f"      ✅ {tabela}: 0 registos (LIMPO)")
            else:
                print(f"      ❌ {tabela}: {remaining} registos (ERRO!)")
                cur.execute("ROLLBACK")
                return False
        
        # Commit apenas se tudo estiver OK
        cur.execute("COMMIT")
        print("   🎯 RESET COMPLETO COM SUCESSO!")
        return True
        
    except Exception as e:
        print(f"   ❌ ERRO durante reset: {e}")
        try:
            cur.execute("ROLLBACK")
            print("   🔄 ROLLBACK executado - estado preservado")
        except:
            print("   🚨 ERRO CRÍTICO no rollback!")
        return False

def verificar_view_unificada(conn):
    """Verificar impacto na view unificada"""
    print("\n🌐 VERIFICAÇÃO: VIEW UNIFICADA")
    print("="*40)
    
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT source_type, COUNT(*) FROM unified_product_catalog GROUP BY source_type")
        stats = cur.fetchall()
        
        for source, count in stats:
            print(f"   📊 {source}: {count} produtos")
            
        # Verificar se Geko continua intacto
        geko_count = next((count for source, count in stats if source == 'geko'), 0)
        if geko_count == 8125:  # Valor esperado
            print("   ✅ Sistema Geko na view: PRESERVADO")
        else:
            print(f"   ⚠️ Sistema Geko na view: {geko_count} (verificar)")
            
    except Exception as e:
        print(f"   ⚠️ Erro ao verificar view: {e}")

def main():
    """Função principal - coordena todo o processo"""
    print("🏆 HIPÓTESE A: RESET COMPLETO ÁREA VIP (ULTRA-SEGURO)")
    print("="*70)
    print("⚠️ APENAS tabelas internal_* serão afectadas")
    print("🛡️ Sistema Geko: TOTALMENTE PRESERVADO")
    print("💾 Backup: OBRIGATÓRIO antes de qualquer operação")
    print("🔄 Rollback: DISPONÍVEL a qualquer momento")
    
    # Conectar à BD
    conn = conectar_bd()
    
    try:
        # ETAPA 1: Verificar isolamento Geko
        if not verificar_isolamento_geko(conn):
            print("\n🚨 ABORTANDO: Isolamento Geko comprometido!")
            return False
        
        # ETAPA 2: Criar backup completo
        backup_info = criar_backup_completo(conn)
        if not backup_info:
            print("\n🚨 ABORTANDO: Falha na criação do backup!")
            return False
        
        # ETAPA 3: Validar estado actual
        stats_pre = validar_estado_pre_reset(conn)
        
        # ETAPA 4: Executar reset seguro
        if not executar_reset_seguro(conn):
            print("\n🚨 RESET FALHADO - Estado preservado")
            return False
        
        # ETAPA 5: Verificar view unificada
        verificar_view_unificada(conn)
        
        print("\n🎉 RESET COMPLETO CONCLUÍDO COM SUCESSO!")
        print("📋 Próximo passo: Executar importação corrigida")
        print("💾 Backup disponível em: backup_info_vip.json")
        
        return True
        
    except Exception as e:
        print(f"\n🚨 ERRO INESPERADO: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    # Confirmação inicial
    print("\n⚠️ ATENÇÃO: Este script vai resetar APENAS as tabelas VIP")
    print("🛡️ O sistema Geko (8,126 produtos) será TOTALMENTE PRESERVADO")
    print("💾 Backup completo será criado antes de qualquer operação")
    
    resposta = input("\n🤔 Proceder com Hipótese A? (s/N): ")
    
    if resposta.lower() == 's':
        if main():
            print("\n✅ HIPÓTESE A EXECUTADA COM SUCESSO!")
            print("🔄 Sistema pronto para importação corrigida")
        else:
            print("\n❌ HIPÓTESE A FALHADA - verificar logs")
    else:
        print("\n🛑 OPERAÇÃO CANCELADA pelo utilizador") 