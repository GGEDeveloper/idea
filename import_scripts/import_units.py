import logging
import os
import psycopg2
from import_scripts.parse_xml import iterparse_products

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def extract_units(xml_path):
    """Extrai unidades únicas dos produtos no XML."""
    units = {}
    count = 0
    for product in iterparse_products(xml_path):
        count += 1
        unit_node = product.find("unit")
        if unit_node is not None:
            unit_id = unit_node.get("id")
            name = unit_node.get("name")
            if unit_id and name:
                units[unit_id] = name
        if count % 1000 == 0:
            logging.info(f"{count} produtos processados...")
    logging.info(f"Total de produtos processados: {count}")
    logging.info(f"Total de unidades únicas extraídas: {len(units)}")
    return units

def import_units(xml_path, db_url):
    units = extract_units(xml_path)
    if not units:
        logging.warning("Nenhuma unidade encontrada para importar.")
        return
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        insert_sql = """
            INSERT INTO units (geko_unit_id, name)
            VALUES (%s, %s)
            ON CONFLICT (geko_unit_id) DO UPDATE SET name=EXCLUDED.name
        """
        count = 0
        for unit_id, name in units.items():
            cur.execute(insert_sql, (unit_id, name))
            count += 1
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Importadas/atualizadas {count} unidades na base de dados.")
    except Exception as e:
        logging.error(f"Erro ao importar unidades: {e}")

if __name__ == "__main__":
    xml_path = "data/xml/geko_full_en_utf8.xml"
    db_url = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    import_units(xml_path, db_url)
