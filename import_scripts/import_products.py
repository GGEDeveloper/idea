import logging
import os
import psycopg2
from import_scripts.parse_xml import iterparse_products

# Função utilitária para mapear ID externo para interno
# Exemplo: get_internal_id('categories', 'geko_category_id', 'ABC123')
def get_internal_id(table, external_column, external_value, db_url=None):
    if not external_value:
        return None
    import os
    db_url = db_url or os.getenv("DATABASE_URL")
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        query = f"SELECT id_{table} FROM {table} WHERE {external_column} = %s LIMIT 1"
        cur.execute(query, (external_value,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        if row:
            return row[0]
        else:
            logger.warning(f"ID externo '{external_value}' não encontrado em {table}.{external_column}.")
            return None
    except Exception as e:
        logger.error(f"Erro ao mapear ID externo para interno: {e}")
        return None

# Garantir logger
logger = logging.getLogger("import_products")
if not logger.hasHandlers():
    logging.basicConfig(level=logging.INFO)

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

def extract_products(xml_path):
    """Extrai campos principais dos produtos do XML."""
    products = []
    for idx, product in enumerate(iterparse_products(xml_path)):
        ean = product.get("EAN") or product.get("ean")
        product_id_geko = product.get("id")
        code_geko = product.get("code")
        card_node = product.find("card")
        desc_node = product.find("description")
        sizes_node = product.find("sizes")
        name = None
        short_description = None
        long_description = None
        card_url = None
        geko_size_code = None
        weight = None
        gross_weight = None
        # Nome do produto (fallbacks)
        if card_node is not None:
            card_url = card_node.get("url")
            name_elem = card_node.find("name")
            if name_elem is not None and name_elem.text:
                name = name_elem.text.strip()
        if not name and desc_node is not None:
            name_elem = desc_node.find("name")
            if name_elem is not None and name_elem.text:
                name = name_elem.text.strip()
        if not name:
            name = product.get("code_on_card")
        if not name:
            name = product.get("code")
        # Descrições prioritárias (fallbacks)
        if desc_node is not None:
            short_desc_elem = desc_node.find("short_desc")
            if short_desc_elem is not None and short_desc_elem.text and short_desc_elem.text.strip():
                short_description = short_desc_elem.text.strip()
            long_desc_elem = desc_node.find("long_desc")
            if long_desc_elem is not None and long_desc_elem.text and long_desc_elem.text.strip():
                long_description = long_desc_elem.text.strip()
            # Fallback: <description><description>
            if not short_description or not long_description:
                desc_fallback = desc_node.find("description")
                if desc_fallback is not None and desc_fallback.text and desc_fallback.text.strip():
                    if not short_description:
                        short_description = desc_fallback.text.strip()
                    if not long_description:
                        long_description = desc_fallback.text.strip()
        if not short_description:
            short_description = name
        if short_description and not short_description.strip():
            short_description = None
        if long_description and not long_description.strip():
            long_description = None
        # Extrair size (detalhe físico/comercial)
        if sizes_node is not None:
            size_elems = sizes_node.findall("size")
            if size_elems:
                if len(size_elems) > 1:
                    logger.warning(f"Produto {product.get('EAN') or product.get('ean')}: múltiplos <size> encontrados (não esperado). Só o primeiro será usado.")
                size = size_elems[0]
                geko_size_code = size.get("code")
                weight = size.get("weight")
                gross_weight = size.get("grossWeight")
            else:
                logger.error(f"Produto {product.get('EAN') or product.get('ean')}: <sizes> presente mas sem <size>.")
        else:
            logger.error(f"Produto {product.get('EAN') or product.get('ean')}: não tem <sizes>.")
        # Fallbacks para campos de size
        if not geko_size_code:
            geko_size_code = product.get("code")
        # Logging detalhado dos campos extraídos
        if short_description and short_description != name:
            logger.info(f"Produto {product.get('EAN') or product.get('ean')}: short_description preenchido.")
        if long_description:
            logger.info(f"Produto {product.get('EAN') or product.get('ean')}: long_description preenchido.")
        if not card_url:
            logger.warning(f"Produto {product.get('EAN') or product.get('ean')}: sem card_url.")
        if not geko_size_code:
            logger.warning(f"Produto {product.get('EAN') or product.get('ean')}: sem geko_size_code.")
        if not weight:
            logger.warning(f"Produto {product.get('EAN') or product.get('ean')}: sem weight.")
        if not gross_weight:
            logger.warning(f"Produto {product.get('EAN') or product.get('ean')}: sem grossWeight.")
        vat_rate = product.get("vat")
        price_net = None
        price_gross = None
        producer_node = product.find("producer")
        producer_name = producer_node.get("name") if producer_node is not None else None
        producer_id_geko = producer_node.get("id") if producer_node is not None else None
        category_node = product.find("category")
        category_id_categories = None
        if category_node is not None:
            # Precisa de mapear o id externo para o id interno (inteiro)
            # Exemplo: SELECT id_categories FROM categories WHERE geko_category_id = <category_node.get('id')>
            category_id_categories = get_internal_id('categories', 'geko_category_id', category_node.get('id'))
        unit_node = product.find("unit")
        unit_id_units = None
        if unit_node is not None:
            unit_id_units = get_internal_id('units', 'geko_unit_id', unit_node.get('id'))
        # Preços
        price_node = product.find("price")
        if price_node is not None:
            price_net = price_node.get("net")
            price_gross = price_node.get("gross")

        # Logging de progresso
        if (idx+1) % 500 == 0:
            logger.info(f"Processados {idx+1} produtos...")

        products.append({
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
        if (idx+1) % 1000 == 0:
            logger.info(f"{idx+1} produtos processados...")
    logger.info(f"Total de produtos processados: {idx+1}")
    logger.info(f"Total de produtos extraídos: {len(products)}")
    return products

def import_products(xml_path, db_url):
    prods = extract_products(xml_path)
    if not prods:
        logging.warning("Nenhum produto encontrado para importar.")
        return
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        insert_sql = """
            INSERT INTO products (
                ean, product_id_geko, code_geko, name, short_description, long_description, card_url, vat_rate, price_net, price_gross, producer_name, producer_id_geko, category_id_categories, unit_id_units, geko_size_code, weight, gross_weight
            ) VALUES (
                %(ean)s, %(product_id_geko)s, %(code_geko)s, %(name)s, %(short_description)s, %(long_description)s, %(card_url)s, %(vat_rate)s, %(price_net)s, %(price_gross)s, %(producer_name)s, %(producer_id_geko)s, %(category_id_categories)s, %(unit_id_units)s, %(geko_size_code)s, %(weight)s, %(gross_weight)s
            )
            ON CONFLICT (ean) DO UPDATE SET
                product_id_geko=EXCLUDED.product_id_geko,
                code_geko=EXCLUDED.code_geko,
                name=EXCLUDED.name,
                short_description=EXCLUDED.short_description,
                long_description=EXCLUDED.long_description,
                card_url=EXCLUDED.card_url,
                vat_rate=EXCLUDED.vat_rate,
                price_net=EXCLUDED.price_net,
                price_gross=EXCLUDED.price_gross,
                producer_name=EXCLUDED.producer_name,
                producer_id_geko=EXCLUDED.producer_id_geko,
                category_id_categories=EXCLUDED.category_id_categories,
                unit_id_units=EXCLUDED.unit_id_units,
                geko_size_code=EXCLUDED.geko_size_code,
                weight=EXCLUDED.weight,
                gross_weight=EXCLUDED.gross_weight
        """
        count = 0
        for prod in prods:
            if not prod["ean"]:
                logger.warning("Produto sem EAN ignorado.")
                continue
            cur.execute(insert_sql, prod)
            count += 1
        conn.commit()
        cur.close()
        conn.close()
        logging.info(f"Importados/atualizados {count} produtos na base de dados.")
    except Exception as e:
        logging.error(f"Erro ao importar produtos: {e}")

if __name__ == "__main__":
    xml_path = "data/xml/geko_full_en_utf8.xml"
    db_url = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
    import_products(xml_path, db_url)
