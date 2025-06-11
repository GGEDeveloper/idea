import logging
import sys
import os
import psycopg2
from import_scripts.parse_xml import iterparse_products
from import_scripts.import_products import get_internal_id

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def extract_categories(xml_path):
    """Extrai categorias únicas dos produtos no XML, com path normalizado."""
    categories = {}
    count = 0
    for product in iterparse_products(xml_path):
        count += 1
        for cat in product.findall("category"):
            cat_id = cat.get("id")
            name = cat.get("name")
            # Normaliza o path para usar '/' e remove a barra final se existir
            path = cat.get("path", "").replace("\\", "/")
            if path.endswith('/'):
                path = path[:-1]

            if cat_id and name:
                categories[cat_id] = {"name": name, "path": path}
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

    # Criar um mapa de path para geko_category_id para encontrar pais facilmente
    path_to_id_map = {data['path']: cat_id for cat_id, data in cats.items()}

    # Determinar o ID do pai para cada categoria
    for cat_id, data in cats.items():
        path = data.get("path", "")
        parent_geko_category_id = None
        if '/' in path:
            parent_path = '/'.join(path.split('/')[:-1])
            if parent_path in path_to_id_map:
                parent_geko_category_id = path_to_id_map[parent_path]
            else:
                logging.warning(f"Parent path '{parent_path}' para a categoria '{path}' não encontrado. A definir parent_id como NULL.")
        
        data['parent_geko_category_id'] = parent_geko_category_id

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        logging.info("A limpar a tabela de categorias antes da importação...")
        cur.execute("TRUNCATE TABLE categories RESTART IDENTITY;")

        insert_sql = """
            INSERT INTO categories (geko_category_id, name, path, parent_geko_category_id)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (geko_category_id) DO UPDATE SET 
                name=EXCLUDED.name, 
                path=EXCLUDED.path,
                parent_geko_category_id=EXCLUDED.parent_geko_category_id
        """
        count = 0
        for cat_id, data in cats.items():
            path = data.get("path", "")
            parent_id = data.get('parent_geko_category_id')
            cur.execute(insert_sql, (cat_id, data["name"], path, parent_id))
            count += 1
            
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Importadas/atualizadas {count} categorias na base de dados com parent_id.")
    except Exception as e:
        logging.error(f"Erro ao importar categorias: {e}")

if __name__ == "__main__":
    xml_path = "data/xml/geko_full_en_utf8.xml"
    db_url = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    import_categories(xml_path, db_url)
