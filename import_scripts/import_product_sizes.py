import os
import psycopg2
import logging
from lxml import etree as ET
from import_scripts.parse_xml import iterparse_products

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("import_product_sizes")

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
XML_PATH = "data/xml/geko_full_en_utf8.xml"

UPSERT_SQL = """
INSERT INTO product_sizes (product_id_products, geko_size_code, producer_size_code, name)
VALUES (%s, %s, %s, %s)
ON CONFLICT (product_id_products, geko_size_code) DO UPDATE
SET producer_size_code = EXCLUDED.producer_size_code,
    name = EXCLUDED.name;
"""

def extract_product_sizes(xml_path):
    sizes = []
    for idx, product in enumerate(iterparse_products(xml_path)):
        ean = product.get("EAN") or product.get("ean")
        sizes_node = product.find("sizes")
        if sizes_node is not None:
            for size in sizes_node.findall("size"):
                geko_size_code = size.get("code")
                producer_size_code = size.get("producer_code")
                name = size.get("name") or size.text or None
                sizes.append({
                    "product_ean": ean,
                    "geko_size_code": geko_size_code,
                    "producer_size_code": producer_size_code,
                    "name": name.strip() if name else None
                })
    return sizes

def get_product_id_from_ean(ean, db_url=None):
    if not ean:
        return None
    try:
        conn = psycopg2.connect(db_url or DB_URL)
        cur = conn.cursor()
        cur.execute("SELECT id_products FROM products WHERE ean = %s LIMIT 1", (ean,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row[0] if row else None
    except Exception as e:
        logger.error(f"Erro ao mapear EAN para id_products: {e}")
        return None

def import_product_sizes(xml_path, db_url):
    sizes = extract_product_sizes(xml_path)
    logger.info(f"Total de variantes/tamanhos extraídos: {len(sizes)}")
    if not sizes:
        logger.warning("Nenhum tamanho encontrado no XML.")
        return
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        count = 0
        skipped = 0
        for s in sizes:
            product_id = get_product_id_from_ean(s["product_ean"], db_url)
            if not product_id:
                logger.warning(f"Produto com EAN {s['product_ean']} não encontrado na base de dados. Variante ignorada.")
                skipped += 1
                continue
            cur.execute(UPSERT_SQL, (
                product_id,
                s["geko_size_code"],
                s["producer_size_code"],
                s["name"]
            ))
            count += 1
        conn.commit()
        cur.close()
        conn.close()
        logger.info(f"Importadas/atualizadas {count} variantes/tamanhos. Ignoradas {skipped} por produto não encontrado.")
    except Exception as e:
        logger.error(f"Erro ao importar tamanhos: {e}")

def main():
    xml_path = XML_PATH
    db_url = DB_URL
    import_product_sizes(xml_path, db_url)

if __name__ == "__main__":
    main()
