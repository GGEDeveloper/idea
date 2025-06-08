import os
import psycopg2

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
CSV_PATH = "products_bulk.csv"

try:
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    print("Truncating table products...")
    cur.execute("TRUNCATE TABLE products RESTART IDENTITY CASCADE;")
    conn.commit()
    print("Table cleaned.")
    print(f"Importing {CSV_PATH} via COPY...")
    with open(CSV_PATH, "r") as f:
        cur.copy_expert(
            "COPY products (ean, product_id_geko, code_geko, name, short_description, long_description, card_url, vat_rate, price_net, price_gross, producer_name, producer_id_geko, category_id_categories, unit_id_units, geko_size_code, weight, gross_weight) FROM STDIN WITH CSV HEADER",
            f
        )
    conn.commit()
    print("Import completed!")
    cur.execute("SELECT COUNT(*) FROM products;")
    total = cur.fetchone()[0]
    print(f"Total products in table after import: {total}")
    cur.close()
    conn.close()
except Exception as e:
    print(f"ERROR in bulk import: {e}")
