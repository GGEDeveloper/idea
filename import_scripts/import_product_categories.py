import logging
from .parse_xml import iterparse_products

def extract_product_categories(xml_path):
    """Extract product-category relationships from XML."""
    rels = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        for cat in product.findall("category"):
            cat_id = cat.get("id")
            lang = cat.get("lang", "")
            if cat_id:
                rels.append({
                    "product_ean": ean,
                    "geko_category_id": cat_id,
                    "lang": lang
                })
    return rels

def import_product_categories(xml_path, db_session):
    rels = extract_product_categories(xml_path)
    for rel in rels:
        db_session.execute(
            """
            INSERT INTO productcategories (product_ean, geko_category_id, lang)
            VALUES (%(product_ean)s, %(geko_category_id)s, %(lang)s)
            ON CONFLICT (product_ean, geko_category_id, lang) DO NOTHING
            """,
            rel
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(rels)} product-category relations.")
