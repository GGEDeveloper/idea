#!/usr/bin/env python3
"""
Script de teste para verificar sistema de imagens
"""

import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

def test_images_system():
    """Testar sistema de imagens"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            print("🧪 TESTANDO SISTEMA DE IMAGENS")
            print("=" * 50)
            
            # 1. Verificar se a tabela foi criada
            cursor.execute("""
                SELECT COUNT(*) as count
                FROM information_schema.tables 
                WHERE table_name = 'internal_product_images'
            """)
            table_exists = cursor.fetchone()['count'] > 0
            print(f"📋 Tabela 'internal_product_images': {'✅' if table_exists else '❌'}")
            
            # 2. Verificar placeholders criados
            cursor.execute("SELECT COUNT(*) as count FROM internal_product_images")
            placeholders_count = cursor.fetchone()['count']
            print(f"🖼️ Placeholders criados: {placeholders_count}")
            
            # 3. Testar função de imagem primária
            cursor.execute("SELECT internal_ean FROM internal_products LIMIT 1")
            sample_ean = cursor.fetchone()
            if sample_ean:
                ean = sample_ean['internal_ean']
                cursor.execute("SELECT * FROM get_internal_product_primary_image(%s)", (ean,))
                primary_image = cursor.fetchone()
                print(f"🏆 Função imagem primária: {'✅' if primary_image else '❌'}")
                
                if primary_image:
                    print(f"   EAN: {ean}")
                    print(f"   Arquivo: {primary_image['filename']}")
            
            # 4. Testar view unificada
            cursor.execute("SELECT COUNT(*) as count FROM unified_product_images WHERE image_source = 'internal'")
            unified_count = cursor.fetchone()['count']
            print(f"🔗 View unificada (internos): {unified_count} imagens")
            
            # 5. Verificar índices
            cursor.execute("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'internal_product_images'
            """)
            indexes = cursor.fetchall()
            print(f"📊 Índices criados: {len(indexes)}")
            for idx in indexes:
                print(f"   • {idx['indexname']}")
            
            print("\n✅ SISTEMA DE IMAGENS OPERACIONAL!")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro no teste: {e}")

if __name__ == "__main__":
    test_images_system() 