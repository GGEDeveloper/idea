#!/usr/bin/env python3
"""
Criar view unified_product_catalog
"""

import psycopg2

def create_unified_view():
    print("🔄 CRIANDO VIEW UNIFIED_PRODUCT_CATALOG")
    print("=" * 50)
    
    # Conectar
    db_url = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    
    try:
        conn = psycopg2.connect(db_url)
        with conn.cursor() as cur:
            # Criar view unificada
            cur.execute("""
                CREATE OR REPLACE VIEW unified_product_catalog AS
                SELECT 
                    -- Identificação
                    p.ean as product_ean,
                    'geko' as source_type,
                    p.productid,
                    NULL as internal_sku,
                    
                    -- Nomes (usa multi-idioma se disponível)
                    COALESCE(p.name_pt, p.name) as display_name_pt,
                    COALESCE(p.name_en, p.name) as display_name_en,
                    p.name as original_name,
                    
                    -- Descrições
                    COALESCE(p.shortdescription_pt, p.shortdescription) as display_shortdesc_pt,
                    COALESCE(p.shortdescription_en, p.shortdescription) as display_shortdesc_en,
                    
                    -- Dados comerciais
                    p.brand,
                    p.is_featured,
                    p.active as is_active,
                    
                    -- Metadados
                    p.created_at,
                    p.updated_at
                    
                FROM products p
                WHERE p.active = true

                UNION ALL

                SELECT 
                    -- Identificação
                    ip.internal_ean as product_ean,
                    'internal' as source_type,
                    NULL as productid,
                    ip.internal_sku,
                    
                    -- Nomes multi-idioma
                    ip.name_pt as display_name_pt,
                    ip.name_en as display_name_en,
                    ip.name as original_name,
                    
                    -- Descrições
                    ip.short_description_pt as display_shortdesc_pt,
                    ip.short_description_en as display_shortdesc_en,
                    
                    -- Dados comerciais
                    ip.brand,
                    ip.is_featured,
                    ip.is_active,
                    
                    -- Metadados
                    ip.created_at,
                    ip.updated_at
                    
                FROM internal_products ip
                WHERE ip.is_active = true;
            """)
            
            print("✅ View unified_product_catalog criada!")
            
        conn.commit()
        conn.close()
        print("🎯 Concluído com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    create_unified_view() 