import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_PATH = "product_sizes_bulk.csv"

try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    print("Truncando tabela product_sizes...")
    cur.execute("TRUNCATE TABLE product_sizes RESTART IDENTITY CASCADE;")
    conn.commit()
    print("Tabela limpa.")
    print(f"Importando {CSV_PATH} via COPY...")
    with open(CSV_PATH, "r") as f:
        cur.copy_expert(
            "COPY product_sizes (product_id_products, geko_size_code, producer_size_code, name) FROM STDIN WITH CSV HEADER",
            f
        )
    conn.commit()
    print("Importação concluída!")
    cur.execute("SELECT COUNT(*) FROM product_sizes;")
    total = cur.fetchone()[0]
    print(f"Total de tamanhos na tabela após importação: {total}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"ERRO na importação bulk: {e}")
