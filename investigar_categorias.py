#!/usr/bin/env python3
"""
Script para investigar categorias e identificar a nova categoria criada para VIP
"""

import psycopg2
import os
from datetime import datetime

def conectar_bd():
    """Conectar à base de dados"""
    try:
        conn = psycopg2.connect(
            host="ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech",
            database="neondb",
            user="neondb_owner",
            password="npg_aMgk1osmjh7X",
            sslmode="require"
        )
        return conn
    except Exception as e:
        print(f"❌ ERRO de conexão: {e}")
        return None

def investigar_categorias():
    """Investigar as categorias atuais"""
    conn = conectar_bd()
    if not conn:
        return
    
    try:
        cur = conn.cursor()
        
        print("🔍 INVESTIGAÇÃO DAS CATEGORIAS")
        print("=" * 50)
        
        # 1. Contagem total
        cur.execute("SELECT COUNT(*) FROM categories;")
        total = cur.fetchone()[0]
        print(f"📊 Total de categorias: {total}")
        
        # 2. Procurar categorias relacionadas com spatulas/talochas
        print("\n🔍 Procurando categorias de spatulas/talochas:")
        cur.execute("""
            SELECT categoryid, name, created_at 
            FROM categories 
            WHERE name ILIKE '%trowel%' 
               OR name ILIKE '%spatula%' 
               OR name ILIKE '%espatula%' 
               OR name ILIKE '%talocha%'
            ORDER BY created_at DESC;
        """)
        
        categorias_spatulas = cur.fetchall()
        if categorias_spatulas:
            for cat in categorias_spatulas:
                print(f"  ✅ ID: {cat[0]}")
                print(f"     Nome: {cat[1]}")
                print(f"     Criada: {cat[2]}")
                print()
        else:
            print("  ❌ Nenhuma categoria encontrada com esses termos")
        
        # 3. Últimas categorias criadas 
        print("\n🕒 Últimas 10 categorias criadas:")
        cur.execute("""
            SELECT categoryid, name, created_at 
            FROM categories 
            WHERE created_at IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT 10;
        """)
        
        ultimas = cur.fetchall()
        for cat in ultimas:
            print(f"  📅 {cat[2]} - {cat[1]} (ID: {cat[0]})")
        
        # 4. Verificar produtos VIP categorizados
        print("\n🏷️ Produtos VIP por categoria:")
        cur.execute("""
            SELECT c.name, COUNT(ipc.internal_ean) as produtos
            FROM categories c
            LEFT JOIN internal_product_categories ipc ON c.categoryid = ipc.category_id
            WHERE ipc.internal_ean IS NOT NULL
            GROUP BY c.name
            ORDER BY COUNT(ipc.internal_ean) DESC;
        """)
        
        vip_cats = cur.fetchall()
        if vip_cats:
            for cat in vip_cats:
                print(f"  🏷️ {cat[0]}: {cat[1]} produtos VIP")
        else:
            print("  ❌ Nenhum produto VIP categorizado encontrado")
        
        # 5. Verificar se há categorias com criação recente
        print("\n📅 Categorias criadas nas últimas 30 dias:")
        cur.execute("""
            SELECT categoryid, name, created_at 
            FROM categories 
            WHERE created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at DESC;
        """)
        
        recentes = cur.fetchall()
        if recentes:
            for cat in recentes:
                print(f"  🆕 {cat[2]} - {cat[1]} (ID: {cat[0]})")
        else:
            print("  ✅ Nenhuma categoria criada recentemente")
            
    except Exception as e:
        print(f"❌ ERRO na investigação: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print(f"🔍 INVESTIGAÇÃO DE CATEGORIAS - {datetime.now()}")
    investigar_categorias() 