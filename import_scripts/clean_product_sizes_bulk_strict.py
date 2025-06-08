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

with open('product_sizes_bulk.csv') as inp, open('product_sizes_bulk_clean.csv', 'w', newline='') as out:
    r = csv.reader(inp)
    header = next(r)
    ncols = len(header)
    w = csv.writer(out)
    w.writerow(header)
    for row in r:
        if len(row) != ncols:
            continue
        # product_id_products é a primeira coluna
        if row[0] not in valid_products:
            continue
        w.writerow(row)
print('product_sizes_bulk_clean.csv gerado com colunas corretas e FKs válidas.')
