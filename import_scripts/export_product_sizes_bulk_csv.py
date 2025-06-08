import os
import sys
import csv
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from import_scripts.parse_xml import iterparse_products

REFERENCE_CSV = "ean_key_reference.csv"
OUTPUT_CSV = "product_sizes_bulk.csv"

# 1. Carregar referência EAN → id_products
ean_to_id = {}
with open(REFERENCE_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        ean = str(row['ean']).strip()
        key = str(row['key']).strip()
        if ean and key:
            ean_to_id[ean] = int(key)

# 2. Extrair tamanhos do XML
def extract_sizes():
    for product in iterparse_products("data/xml/geko_full_en_utf8.xml"):
        ean = (product.get("EAN") or product.get("ean") or "").strip()
        product_id = ean_to_id.get(ean)
        if not product_id:
            continue
        sizes_node = product.find("sizes")
        if sizes_node is not None:
            for size in sizes_node.findall('.//size'):
                yield {
                    "product_id_products": product_id,
                    "geko_size_code": size.get("geko_size_code"),
                    "producer_size_code": size.get("producer_size_code"),
                    "name": size.get("name") or ""
                }

with open(OUTPUT_CSV, "w", newline='') as csvfile:
    fieldnames = ["product_id_products", "geko_size_code", "weight", "gross_weight", "product_name", "category"]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    count = 0
    for product in iterparse_products("data/xml/geko_full_en_utf8.xml"):
        ean = (product.get("EAN") or product.get("ean") or "").strip()
        product_id = ean_to_id.get(ean)
        if not product_id:
            continue
        sizes_node = product.find("sizes")
        name = product.get("name") or ""
        category_node = product.find("category")
        category = category_node.get("name") if category_node is not None else ""
        if sizes_node is not None:
            for size in sizes_node.findall('.//size'):
                row = {
                    "product_id_products": product_id,
                    "geko_size_code": size.get("code"),
                    "weight": size.get("weight"),
                    "gross_weight": size.get("grossWeight"),
                    "product_name": name,
                    "category": category
                }
                writer.writerow(row)
                count += 1
print(f"Exportado {count} linhas para {OUTPUT_CSV}")
