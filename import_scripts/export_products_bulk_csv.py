import os
import sys
import csv
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from import_scripts.parse_xml import iterparse_products

OUTPUT_CSV = "products_bulk.csv"

with open(OUTPUT_CSV, "w", newline='') as csvfile:
    fieldnames = [
        "ean", "product_id_geko", "code_geko", "name", "short_description", "long_description", "card_url", "vat_rate", "price_net", "price_gross", "producer_name", "producer_id_geko", "category_id_categories", "unit_id_units", "geko_size_code", "weight", "gross_weight"
    ]
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    count = 0
    for product in iterparse_products("data/xml/geko_full_en_utf8.xml"):
        ean = product.get("EAN") or product.get("ean")
        product_id_geko = product.get("id")
        code_geko = product.get("code")
        name = product.findtext("description/name") or product.get("name") or ""
        short_description = product.findtext("description/short_desc") or ""
        long_description = product.findtext("description/long_desc") or ""
        card_url = ""
        card_node = product.find("card")
        if card_node is not None:
            card_url = card_node.get("url") or ""
        vat_rate = product.get("vat")
        price_node = product.find("price")
        price_net = price_node.get("net") if price_node is not None else ""
        price_gross = price_node.get("gross") if price_node is not None else ""
        producer_node = product.find("producer")
        producer_name = producer_node.get("name") if producer_node is not None else ""
        producer_id_geko = producer_node.get("id") if producer_node is not None else ""
        category_node = product.find("category")
        category_id_categories = category_node.get("id") if category_node is not None else ""
        unit_node = product.find("unit")
        unit_id_units = unit_node.get("id") if unit_node is not None else ""
        # Extra: pegar info de size
        sizes_node = product.find("sizes")
        geko_size_code = weight = gross_weight = ""
        if sizes_node is not None:
            size = sizes_node.find("size")
            if size is not None:
                geko_size_code = size.get("code") or ""
                weight = size.get("weight") or ""
                gross_weight = size.get("grossWeight") or ""
        writer.writerow({
            "ean": ean,
            "product_id_geko": product_id_geko,
            "code_geko": code_geko,
            "name": name,
            "short_description": short_description,
            "long_description": long_description,
            "card_url": card_url,
            "vat_rate": vat_rate,
            "price_net": price_net,
            "price_gross": price_gross,
            "producer_name": producer_name,
            "producer_id_geko": producer_id_geko,
            "category_id_categories": category_id_categories,
            "unit_id_units": unit_id_units,
            "geko_size_code": geko_size_code,
            "weight": weight,
            "gross_weight": gross_weight
        })
        count += 1
print(f"Exported {count} lines to {OUTPUT_CSV}")
