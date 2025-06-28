#!/usr/bin/env python3
"""
Verificar e corrigir IDs de categoria
"""

import psycopg2

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def verificar_categorias():
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    print("🔍 CATEGORIAS RELEVANTES:")
    
    # Procurar categorias por palavras-chave
    palavras = ['disc', 'cut', 'glove', 'sponge', 'trowel', 'general', 'tool', 'mechanical']
    
    for palavra in palavras:
        cur.execute("SELECT categoryid, name FROM categories WHERE name ILIKE %s LIMIT 3", (f'%{palavra}%',))
        results = cur.fetchall()
        if results:
            print(f"\n'{palavra.upper()}':")
            for cat_id, name in results:
                print(f"   {cat_id}: {name}")
    
    # Verificar se as categorias que usamos existem
    print(f"\n🔍 VERIFICANDO IDs USADOS:")
    ids_usados = ["112805", "112774", "107748", "110006", "112781"]
    
    for cat_id in ids_usados:
        cur.execute("SELECT name FROM categories WHERE categoryid = %s", (cat_id,))
        result = cur.fetchone()
        if result:
            print(f"   ✅ {cat_id}: {result[0]}")
        else:
            print(f"   ❌ {cat_id}: NÃO EXISTE")
    
    conn.close()

if __name__ == "__main__":
    verificar_categorias() 