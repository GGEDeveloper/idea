import csv
import psycopg2
from os import getenv
from dotenv import load_dotenv
load_dotenv()
db = getenv('DATABASE_URL')
conn = psycopg2.connect(db)
cur = conn.cursor()
cur.execute('SELECT id_units FROM units')
valid_units = {str(r[0]) for r in cur.fetchall()}
cur.close()
conn.close()

required_fields = [
    'ean', 'product_id_geko', 'code_geko', 'name', 'unit_id_units'
]

with open('products_bulk.csv') as inp, open('products_bulk_clean.csv', 'w', newline='') as out:
    r = csv.DictReader(inp)
    w = csv.DictWriter(out, fieldnames=r.fieldnames)
    w.writeheader()
    for row in r:
        try:
            uid = int(row['unit_id_units'])
        except:
            continue
        if not (0 < uid <= 2147483647):
            continue
        if row['unit_id_units'] not in valid_units:
            continue
        if any(not row[f].strip() for f in required_fields):
            continue
        w.writerow(row)
print('products_bulk_clean.csv gerado com unit_id_units válidos, existentes e campos obrigatórios preenchidos.')
