#!/usr/bin/env python3
import psycopg2
from psycopg2.extras import RealDictCursor
import random
from datetime import date

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def populate_stock():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    print("📦 POPULANDO INVENTÁRIO VIP - 940 VARIANTES")
    print("=" * 60)
    
    # Obter variantes
    cursor.execute("""
        SELECT iv.internal_variant_id, ip.base_cost, ip.brand
        FROM internal_variants iv
        JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
        WHERE iv.is_active = true AND ip.is_active = true;
    """)
    
    variants = cursor.fetchall()
    total = len(variants)
    print(f"✅ {total} variantes para processar")
    
    # Popular stock
    inserted = 0
    for i, variant in enumerate(variants, 1):
        try:
            base_cost = variant['base_cost'] or 5.0
            
            # Stock baseado no custo
            if base_cost < 2.0:
                quantity = random.randint(50, 200)
                min_stock = 15
                reorder = 10
            elif base_cost < 10.0:
                quantity = random.randint(20, 100)
                min_stock = 10
                reorder = 8
            else:
                quantity = random.randint(10, 50)
                min_stock = 5
                reorder = 5
            
            cursor.execute("""
                INSERT INTO internal_stock (
                    internal_variant_id, quantity, reserved_quantity,
                    minimum_stock, maximum_stock, reorder_point,
                    location, last_count_date
                ) VALUES (%s, %s, 0, %s, %s, %s, 'Armazém Principal', %s);
            """, (
                variant['internal_variant_id'],
                quantity,
                min_stock,
                quantity + 50,  # max_stock
                reorder,
                date.today()
            ))
            
            inserted += 1
            
            if i % 100 == 0:
                print(f"   ✅ {i}/{total} processadas")
                
        except Exception as e:
            print(f"   ❌ Erro na variante {variant['internal_variant_id']}: {e}")
    
    conn.commit()
    print(f"\n🎉 SUCESSO: {inserted}/{total} variantes com stock implementado")
    
    # Verificar resultado
    cursor.execute("SELECT COUNT(*), SUM(quantity) FROM internal_stock;")
    result = cursor.fetchone()
    print(f"📊 {result[0]} registos, {result[1]} unidades totais em stock")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    populate_stock()
