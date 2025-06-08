import os
import psycopg2
import logging
from import_scripts.parse_xml import iterparse_products

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("import_stock")

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
XML_PATH = "data/xml/geko_full_en_utf8.xml"

# Mapeia EAN e código de variante para id_product_sizes

def get_product_size_id(conn, ean, code):
    cur = conn.cursor()
    if code:
        cur.execute(
            """
            SELECT ps.id_product_sizes
              FROM product_sizes ps
              JOIN products p ON ps.product_id_products = p.id_products
             WHERE p.ean = %s AND ps.geko_size_code = %s
             LIMIT 1
            """,
            (ean, code)
        )
    else:
        cur.execute(
            """
            SELECT ps.id_product_sizes
              FROM product_sizes ps
              JOIN products p ON ps.product_id_products = p.id_products
             WHERE p.ean = %s
             LIMIT 1
            """,
            (ean,)
        )
    row = cur.fetchone()
    cur.close()
    return row[0] if row else None

# Importa stock

def import_stock(xml_path):
    conn = psycopg2.connect(DB_URL)
    total = 0
    skipped = 0
    for prod in iterparse_products(xml_path):
        ean = prod.get("EAN") or prod.get("ean")
        # Processa todos os elementos de stock (variantes ou produto)
        for stock_elem in prod.findall('.//stock'):
            sid = stock_elem.get('id')
            qty_str = stock_elem.get('quantity') or '0'
            try:
                # trata separador decimal
                qty = int(float(qty_str.replace(',', '.')))
            except Exception:
                logger.error(f"Quantidade inválida para stock_id={sid}: '{qty_str}'")
                skipped += 1
                continue
            # determina variant code pelo parent
            parent = stock_elem.getparent()
            code = parent.get('code') if parent.tag == 'size' else None
            ps_id = get_product_size_id(conn, ean, code)
            if not ps_id:
                logger.warning(f"Stock ignorado EAN={ean} Code={code} StockID={sid}")
                skipped += 1
                continue
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO stock_levels
                        (geko_stock_id, product_size_id_product_sizes, quantity)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (geko_stock_id) DO UPDATE
                      SET quantity = EXCLUDED.quantity
                    """,
                    (sid, ps_id, qty)
                )
            total += 1
    conn.commit()
    conn.close()
    logger.info(f"Stock importado: {total}, ignorados: {skipped}")

if __name__ == "__main__":
    import_stock(XML_PATH)
