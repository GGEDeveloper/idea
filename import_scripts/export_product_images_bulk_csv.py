import os
import sys
import csv
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from import_scripts.parse_xml import iterparse_products

REFERENCE_CSV = "ean_key_reference.csv"  # já exportado
OUTPUT_CSV = "product_images_bulk.csv"

# 1. Carregar tabela de referência EAN → id_products
ean_to_id = {}
with open(REFERENCE_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        ean = str(row['ean']).strip()
        key = str(row['key']).strip()
        if ean and key:
            ean_to_id[ean] = int(key)

# 2. Extrair imagens do XML e gerar linhas válidas
rows = []
for product in iterparse_products("data/xml/geko_full_en_utf8.xml"):
    ean = (product.get("EAN") or product.get("ean") or "").strip()
    product_id = ean_to_id.get(ean)
    if not product_id:
        continue
    images_node = product.find("images")
    if images_node is not None:
        for idx, image in enumerate(images_node.findall('.//image'), 1):
            url = image.get("url")
            is_main = image.get("type") == "main" or idx == 1
            sort_order = idx
            rows.append({
                "product_id_products": product_id,
                "url": url,
                "is_main": str(is_main).upper(),
                "sort_order": sort_order
            })

# 3. Escrever CSV bulk
with open(OUTPUT_CSV, "w", newline='') as csvfile:
    fieldnames = ["product_id_products", "url", "is_main", "sort_order"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

print(f"Exportado {len(rows)} linhas para {OUTPUT_CSV}")
