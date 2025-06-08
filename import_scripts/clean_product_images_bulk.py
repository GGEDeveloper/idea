import csv
import psycopg2
from os import getenv
from dotenv import load_dotenv
load_dotenv()
db = getenv('DATABASE_URL')
conn = psycopg2.connect(db)
cur = conn.cursor()
cur.execute('SELECT id_products FROM products')
valid_products = {str(r[0]) for r in cur.fetchall()}
cur.close()
conn.close()

with open('product_images_bulk.csv') as inp, open('product_images_bulk_clean.csv', 'w', newline='') as out:
    r = csv.DictReader(inp)
    w = csv.DictWriter(out, fieldnames=r.fieldnames)
    w.writeheader()
    for row in r:
        if row['product_id_products'] in valid_products:
            w.writerow(row)
print('product_images_bulk_clean.csv gerado com FKs válidas.')
