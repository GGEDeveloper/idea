import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_PATH = "product_images_bulk.csv"

try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    print("Truncando tabela product_images...")
    cur.execute("TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;")
    conn.commit()
    print("Tabela limpa.")
    print(f"Importando {CSV_PATH} via COPY...")
    with open(CSV_PATH, "r") as f:
        cur.copy_expert(
            "COPY product_images (product_id_products, url, is_main, sort_order) FROM STDIN WITH CSV HEADER",
            f
        )
    conn.commit()
    print("Importação concluída!")
    cur.execute("SELECT COUNT(*) FROM product_images;")
    total = cur.fetchone()[0]
    print(f"Total de imagens na tabela após importação: {total}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"ERRO na importação bulk: {e}")
