#!/usr/bin/env python3
import psycopg2

DATABASE_URL = 'postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require'

def main():
    print("🔍 DEBUG - ESTRUTURA TABELAS DE ATRIBUTOS")
    print("=" * 60)
    
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    # 1. Verificar product_attributes (Geko)
    print("\n📋 PRODUCT_ATTRIBUTES (Geko):")
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'product_attributes'
        ORDER BY ordinal_position
    """)
    colunas_geko = cur.fetchall()
    
    for col, tipo in colunas_geko:
        print(f"   - {col}: {tipo}")
    
    # 2. Verificar internal_product_attributes (VIP)
    print("\n📋 INTERNAL_PRODUCT_ATTRIBUTES (VIP):")
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'internal_product_attributes'
        ORDER BY ordinal_position
    """)
    colunas_vip = cur.fetchall()
    
    for col, tipo in colunas_vip:
        print(f"   - {col}: {tipo}")
    
    # 3. Verificar amostras de dados
    print("\n📊 AMOSTRAS DE DADOS:")
    
    print("\n   Geko (product_attributes):")
    cur.execute("SELECT * FROM product_attributes LIMIT 2")
    amostras_geko = cur.fetchall()
    for amostra in amostras_geko:
        print(f"      {amostra}")
    
    print("\n   VIP (internal_product_attributes):")
    cur.execute("SELECT * FROM internal_product_attributes LIMIT 2")
    amostras_vip = cur.fetchall()
    for amostra in amostras_vip:
        print(f"      {amostra}")
    
    # 4. Gerar query corrigida
    print("\n🔧 QUERY CORRIGIDA NECESSÁRIA:")
    
    # Identificar nomes corretos das colunas
    geko_id_col = next((col for col, _ in colunas_geko if 'id' in col.lower()), 'attributeid')
    vip_id_col = next((col for col, _ in colunas_vip if 'id' in col.lower()), 'attribute_id')
    
    print(f"   Geko ID column: {geko_id_col}")
    print(f"   VIP ID column: {vip_id_col}")
    
    query_corrigida = f'''
    (SELECT json_agg(attr ORDER BY attr.key) FROM
      (SELECT {geko_id_col} as attributeid, "key", "value" FROM product_attributes WHERE product_ean = p.product_ean
       UNION ALL
       SELECT {vip_id_col} as attributeid, attribute_name as "key", attribute_value as "value" FROM internal_product_attributes WHERE internal_ean = p.product_ean) as attr
    ) as attributes
    '''
    
    print(f"\n✅ Query corrigida:")
    print(query_corrigida)
    
    conn.close()

if __name__ == "__main__":
    main() 