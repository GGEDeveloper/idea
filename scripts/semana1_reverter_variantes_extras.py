#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🚨 SCRIPT DE REVERSÃO: VOLTAR AO ESTADO ORIGINAL
Apagar variantes criadas hoje e voltar para 940 variantes originais

OBJETIVO: Reverter erro de hoje - sistema estava perfeito com 940 variantes
"""

import psycopg2
import sys
from datetime import datetime, date

# Configuração da base de dados
DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def conectar_bd():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar à BD: {e}")
        return None

def investigar_variantes_criadas_hoje():
    """Investigar quais variantes foram criadas hoje"""
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        hoje = date.today()
        
        print(f"🔍 INVESTIGANDO VARIANTES CRIADAS EM {hoje}")
        print("="*50)
        
        # Verificar variantes criadas hoje
        cur.execute("""
            SELECT COUNT(*) 
            FROM internal_variants 
            WHERE DATE(created_at) = %s
        """, (hoje,))
        
        variantes_hoje = cur.fetchone()[0]
        print(f"📊 Variantes criadas hoje: {variantes_hoje}")
        
        # Verificar padrão das variantes criadas hoje
        cur.execute("""
            SELECT internal_variant_id, internal_ean, variant_name, created_at
            FROM internal_variants 
            WHERE DATE(created_at) = %s
            ORDER BY created_at
            LIMIT 10
        """, (hoje,))
        
        samples = cur.fetchall()
        print(f"\n🔍 AMOSTRA DAS VARIANTES CRIADAS HOJE:")
        for variant_id, ean, name, created in samples:
            print(f"   {variant_id} | {ean} | {name} | {created}")
        
        # Verificar se são todas _V001 (padrão default que criei)
        cur.execute("""
            SELECT COUNT(*) 
            FROM internal_variants 
            WHERE DATE(created_at) = %s AND internal_variant_id LIKE '%_V001'
        """, (hoje,))
        
        v001_count = cur.fetchone()[0]
        print(f"\n🎯 Variantes com padrão '_V001' criadas hoje: {v001_count}")
        
        return variantes_hoje, v001_count
        
    except Exception as e:
        print(f"❌ Erro na investigação: {e}")
        return 0, 0
    finally:
        conn.close()

def reverter_variantes():
    """Reverter as variantes criadas hoje"""
    conn = conectar_bd()
    if not conn:
        return False
    
    try:
        cur = conn.cursor()
        hoje = date.today()
        
        print(f"\n🚨 INICIANDO REVERSÃO DAS VARIANTES DE {hoje}")
        print("="*50)
        
        # Começar transação
        cur.execute("BEGIN;")
        
        # Apagar variantes criadas hoje (especialmente as _V001)
        cur.execute("""
            DELETE FROM internal_variants 
            WHERE DATE(created_at) = %s AND internal_variant_id LIKE '%_V001'
        """, (hoje,))
        
        variantes_apagadas = cur.rowcount
        print(f"✅ Apagadas {variantes_apagadas} variantes _V001 criadas hoje")
        
        # Verificar estado após reversão
        cur.execute("SELECT COUNT(*) FROM internal_variants")
        total_variantes = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM internal_products")
        total_produtos = cur.fetchone()[0]
        
        print(f"\n📊 ESTADO APÓS REVERSÃO:")
        print(f"   • Produtos base: {total_produtos}")
        print(f"   • Variantes: {total_variantes}")
        
        # Verificar se voltámos ao normal (deve ser ~940)
        if total_variantes == 940:
            print("🎉 PERFEITO! Voltámos ao estado original de 940 variantes!")
            cur.execute("COMMIT;")
            return True
        elif total_variantes < 1000:
            print("✅ Voltámos próximo do estado original. Confirmar?")
            resposta = input("Confirmar commit? (s/N): ").strip().lower()
            if resposta == 's':
                cur.execute("COMMIT;")
                return True
            else:
                cur.execute("ROLLBACK;")
                print("❌ Operação cancelada")
                return False
        else:
            print("⚠️ Ainda há muitas variantes. Algo correu mal.")
            cur.execute("ROLLBACK;")
            return False
            
    except Exception as e:
        print(f"❌ Erro na reversão: {e}")
        try:
            cur.execute("ROLLBACK;")
        except:
            pass
        return False
    finally:
        conn.close()

def verificar_produtos_sem_variantes():
    """Verificar se há produtos sem variantes após reversão"""
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        
        cur.execute("""
            SELECT COUNT(*) 
            FROM internal_products ip
            WHERE NOT EXISTS (
                SELECT 1 FROM internal_variants iv 
                WHERE iv.internal_ean = ip.internal_ean
            )
        """)
        
        produtos_sem_variantes = cur.fetchone()[0]
        
        if produtos_sem_variantes > 0:
            print(f"\n⚠️ ATENÇÃO: {produtos_sem_variantes} produtos ficaram sem variantes")
            
            # Mostrar quais produtos
            cur.execute("""
                SELECT ip.internal_ean, ip.name_pt
                FROM internal_products ip
                WHERE NOT EXISTS (
                    SELECT 1 FROM internal_variants iv 
                    WHERE iv.internal_ean = ip.internal_ean
                )
                LIMIT 5
            """)
            
            produtos = cur.fetchall()
            print("Exemplos:")
            for ean, nome in produtos:
                print(f"   {ean}: {nome}")
        else:
            print("\n✅ PERFEITO: Todos os produtos mantêm suas variantes!")
            
    except Exception as e:
        print(f"❌ Erro na verificação: {e}")
    finally:
        conn.close()

def main():
    print("🚨 SCRIPT DE REVERSÃO - VOLTAR AO ESTADO ORIGINAL")
    print("="*60)
    print("OBJETIVO: Apagar variantes criadas hoje erroneamente")
    print("ESTADO DESEJADO: 410 produtos + 940 variantes")
    print()
    
    # 1. Investigar o dano
    variantes_hoje, v001_count = investigar_variantes_criadas_hoje()
    
    if variantes_hoje == 0:
        print("✅ Não há variantes criadas hoje para reverter")
        return
    
    print(f"\n🎯 PLANO DE REVERSÃO:")
    print(f"   • Apagar {v001_count} variantes '_V001' criadas hoje")
    print(f"   • Manter variantes originais")
    print(f"   • Voltar a ~940 variantes totais")
    
    resposta = input(f"\nConfirmar reversão de {variantes_hoje} variantes? (s/N): ").strip().lower()
    
    if resposta != 's':
        print("❌ Operação cancelada pelo utilizador")
        return
    
    # 2. Executar reversão
    sucesso = reverter_variantes()
    
    if sucesso:
        print("\n✅ REVERSÃO CONCLUÍDA COM SUCESSO!")
        
        # 3. Verificar resultado
        verificar_produtos_sem_variantes()
        
        print("\n🎉 SISTEMA REVERTIDO PARA O ESTADO ORIGINAL!")
        print("📋 O sistema VIP volta a estar perfeito como antes.")
    else:
        print("\n❌ REVERSÃO FALHOU - Sistema mantém estado atual")

if __name__ == "__main__":
    main() 