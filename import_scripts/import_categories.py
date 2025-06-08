import logging
import sys
import os
import psycopg2
from import_scripts.parse_xml import iterparse_products
from import_scripts.import_products import get_internal_id

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def extract_categories(xml_path):
    """Extrai categorias únicas dos produtos no XML, com hierarquia."""
    categories = {}
    count = 0
    for product in iterparse_products(xml_path):
        count += 1
        for cat in product.findall("category"):
            cat_id = cat.get("id")
            name = cat.get("name")
            path = cat.get("path")  # opcional
            parent_name = None
            if path:
                parts = path.split("\\")  # Corrigido: separador de barra invertida
                if len(parts) > 1:
                    parent_name = parts[-2].strip()
            if cat_id and name:
                categories[cat_id] = {"name": name, "path": path, "parent_name": parent_name}
        if count % 1000 == 0:
            logging.info(f"{count} produtos processados...")
    logging.info(f"Total de produtos processados: {count}")
    logging.info(f"Total de categorias únicas extraídas: {len(categories)}")
    return categories

def import_categories(xml_path, db_url):
    cats = extract_categories(xml_path)
    if not cats:
        logging.warning("Nenhuma categoria encontrada para importar.")
        return
    # Mapeia nome → id para lookup do pai
    name_to_id = {data["name"]: cat_id for cat_id, data in cats.items()}
    # Ordena por profundidade para garantir pais antes dos filhos
    def path_depth(cat):
        p = cats[cat].get("path")
        return len(p.split("\\")) if p else 1
    ordered = sorted(cats.keys(), key=path_depth)
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        insert_sql = """
            INSERT INTO categories (geko_category_id, name, parent_id_categories)
            VALUES (%s, %s, %s)
            ON CONFLICT (geko_category_id) DO UPDATE SET name=EXCLUDED.name, parent_id_categories=EXCLUDED.parent_id_categories
        """
        count = 0
        for cat_id in ordered:
            data = cats[cat_id]
            parent_id_categories = None
            parent_name = data.get("parent_name")
            if parent_name and parent_name in name_to_id:
                parent_ext = name_to_id[parent_name]
                parent_id_categories = get_internal_id('categories', 'geko_category_id', parent_ext, db_url)
            cur.execute(insert_sql, (cat_id, data["name"], parent_id_categories))
            count += 1
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Importadas/atualizadas {count} categorias na base de dados.")
    except Exception as e:
        logging.error(f"Erro ao importar categorias: {e}")

if __name__ == "__main__":
    xml_path = "data/xml/geko_full_en_utf8.xml"
    db_url = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    import_categories(xml_path, db_url)
