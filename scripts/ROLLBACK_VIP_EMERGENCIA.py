#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🔄 SCRIPT DE ROLLBACK DE EMERGÊNCIA - SISTEMA VIP
=================================================

OBJECTIVO: Restaurar rapidamente todas as tabelas VIP do backup
TEMPO: ~2 minutos para rollback completo
USO: Em caso de problemas durante a importação

⚠️ ESTE SCRIPT RESTAURA O ESTADO ANTERIOR COMPLETO
"""

import psycopg2
import json
import sys
from datetime import datetime

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def conectar_bd():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        conn.autocommit = False
        return conn
    except Exception as e:
        print(f"❌ ERRO: Não foi possível conectar à BD: {e}")
        sys.exit(1)

def carregar_info_backup():
    """Carregar informações do backup"""
    try:
        with open('backup_info_vip.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ ERRO: Ficheiro backup_info_vip.json não encontrado!")
        return None
    except Exception as e:
        print(f"❌ ERRO ao carregar backup info: {e}")
        return None

def verificar_backups_existem(conn, backup_info):
    """Verificar se todas as tabelas de backup existem"""
    print("🔍 VERIFICANDO BACKUPS DISPONÍVEIS...")
    
    cur = conn.cursor()
    
    for tabela, info in backup_info['tabelas'].items():
        backup_table = info['backup_table']
        try:
            cur.execute(f"SELECT COUNT(*) FROM {backup_table}")
            count = cur.fetchone()[0]
            registos_esperados = info['backup_registos']
            
            if count == registos_esperados:
                print(f"   ✅ {backup_table}: {count} registos (OK)")
            else:
                print(f"   ❌ {backup_table}: {count} ≠ {registos_esperados} (ERRO)")
                return False
        except Exception as e:
            print(f"   ❌ {backup_table}: Não existe ou erro - {e}")
            return False
    
    return True

def executar_rollback(conn, backup_info):
    """Executar rollback completo"""
    print("\n🔄 EXECUTANDO ROLLBACK COMPLETO...")
    
    cur = conn.cursor()
    
    # Ordem para restaurar (inversa da criação)
    ORDEM_ROLLBACK = [
        'internal_stock',
        'internal_product_attributes', 
        'internal_product_images',
        'internal_pricing',
        'internal_product_categories',
        'internal_variants',
        'internal_products'
    ]
    
    try:
        cur.execute("BEGIN")
        
        # Limpar tabelas actuais primeiro
        print("   🧹 Limpando tabelas actuais...")
        for tabela in ORDEM_ROLLBACK:
            cur.execute(f"DELETE FROM {tabela}")
            print(f"      ✅ {tabela} limpo")
        
        # Restaurar de backup
        print("   📥 Restaurando de backup...")
        for tabela in reversed(ORDEM_ROLLBACK):  # Ordem inversa para restaurar
            if tabela in backup_info['tabelas']:
                backup_table = backup_info['tabelas'][tabela]['backup_table']
                
                # Inserir dados do backup
                cur.execute(f"INSERT INTO {tabela} SELECT * FROM {backup_table}")
                restored = cur.rowcount
                
                # Verificar
                cur.execute(f"SELECT COUNT(*) FROM {tabela}")
                final_count = cur.fetchone()[0]
                
                if restored == final_count:
                    print(f"      ✅ {tabela}: {restored} registos restaurados")
                else:
                    print(f"      ❌ {tabela}: Erro na restauração")
                    cur.execute("ROLLBACK")
                    return False
        
        # Commit se tudo OK
        cur.execute("COMMIT")
        print("   🎯 ROLLBACK COMPLETO COM SUCESSO!")
        return True
        
    except Exception as e:
        print(f"   ❌ ERRO durante rollback: {e}")
        try:
            cur.execute("ROLLBACK")
        except:
            pass
        return False

def verificar_estado_pos_rollback(conn, backup_info):
    """Verificar estado após rollback"""
    print("\n✅ VERIFICAÇÃO PÓS-ROLLBACK:")
    
    cur = conn.cursor()
    
    for tabela, info in backup_info['tabelas'].items():
        cur.execute(f"SELECT COUNT(*) FROM {tabela}")
        count_actual = cur.fetchone()[0]
        count_esperado = info['registos_originais']
        
        if count_actual == count_esperado:
            print(f"   ✅ {tabela}: {count_actual} registos (RESTAURADO)")
        else:
            print(f"   ⚠️ {tabela}: {count_actual} ≠ {count_esperado} (VERIFICAR)")

def main():
    """Função principal de rollback"""
    print("🔄 ROLLBACK DE EMERGÊNCIA - SISTEMA VIP")
    print("="*50)
    print("⚠️ Este script restaura o estado anterior completo")
    print("💾 Usa backup criado durante reset")
    print("⏱️ Tempo estimado: ~2 minutos")
    
    # Carregar info do backup
    backup_info = carregar_info_backup()
    if not backup_info:
        return False
    
    print(f"\n📅 Backup criado em: {backup_info['timestamp']}")
    
    # Conectar à BD
    conn = conectar_bd()
    
    try:
        # Verificar se backups existem
        if not verificar_backups_existem(conn, backup_info):
            print("\n❌ ABORTANDO: Backups não disponíveis")
            return False
        
        # Confirmação
        print(f"\n⚠️ ATENÇÃO: Vai restaurar {len(backup_info['tabelas'])} tabelas VIP")
        resposta = input("🤔 Confirmar rollback? (escreve 'ROLLBACK' para confirmar): ")
        
        if resposta != 'ROLLBACK':
            print("🛑 ROLLBACK CANCELADO")
            return False
        
        # Executar rollback
        if not executar_rollback(conn, backup_info):
            print("\n❌ ROLLBACK FALHADO")
            return False
        
        # Verificar estado final
        verificar_estado_pos_rollback(conn, backup_info)
        
        print("\n🎉 ROLLBACK CONCLUÍDO COM SUCESSO!")
        print("📋 Sistema VIP restaurado ao estado anterior")
        
        return True
        
    except Exception as e:
        print(f"\n🚨 ERRO INESPERADO: {e}")
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    if main():
        print("\n✅ ROLLBACK EXECUTADO COM SUCESSO!")
    else:
        print("\n❌ ROLLBACK FALHADO - verificar logs") 