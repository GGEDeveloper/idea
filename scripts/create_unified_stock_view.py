#!/usr/bin/env python3
import psycopg2
from psycopg2.extras import RealDictCursor

DB_CONFIG = {
    'host': 'ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech',
    'database': 'neondb',
    'user': 'neondb_owner',
    'password': 'npg_aMgk1osmjh7X',
    'port': 5432,
    'sslmode': 'require'
}

def create_views():
    conn = psycopg2.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    print("🔗 CRIANDO VIEWS UNIFICADAS DE STOCK")
    print("=" * 60)
    
    # View para stock unificado
    view_sql = """
    CREATE OR REPLACE VIEW unified_stock_view AS
    -- Stock dos produtos VIP (com detalhes completos)
    SELECT 
        'internal' as source_type,
        iv.internal_ean as product_ean,
        ist.internal_variant_id as variant_id,
        iv.variant_name,
        ip.name_pt as product_name,
        ip.brand,
        ist.quantity,
        ist.reserved_quantity,
        ist.minimum_stock,
        ist.maximum_stock,
        ist.reorder_point,
        ist.location,
        CASE 
            WHEN ist.quantity <= ist.reorder_point THEN 'LOW'
            WHEN ist.quantity <= ist.minimum_stock THEN 'CRITICAL'
            ELSE 'OK'
        END as stock_status
    FROM internal_stock ist
    JOIN internal_variants iv ON ist.internal_variant_id = iv.internal_variant_id
    JOIN internal_products ip ON iv.internal_ean = ip.internal_ean
    WHERE ist.quantity >= 0;
    """
    
    try:
        cursor.execute(view_sql)
        print("✅ View unified_stock_view criada")
        
        # Verificar resultado
        cursor.execute("SELECT COUNT(*) FROM unified_stock_view;")
        count = cursor.fetchone()[0]
        print(f"📊 {count} registos de stock VIP disponíveis na view")
        
        # Verificar amostra
        cursor.execute("""
            SELECT source_type, product_name, brand, quantity, stock_status
            FROM unified_stock_view 
            ORDER BY brand, product_name 
            LIMIT 5;
        """)
        
        sample = cursor.fetchall()
        print("\n📋 Amostra de dados:")
        for row in sample:
            print(f"   • {row[1][:30]:<30} ({row[2]:<10}) - {row[3]} unidades - {row[4]}")
        
        conn.commit()
        print("\n✅ Views de stock criadas com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro ao criar views: {e}")
        conn.rollback()
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    create_views()
