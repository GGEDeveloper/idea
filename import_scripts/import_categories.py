import logging
from .parse_xml import iterparse_products

def extract_categories(xml_path):
    """Extract unique categories from products in the XML."""
    categories = {}
    for product in iterparse_products(xml_path):
        for cat in product.findall("category"):
            cat_id = cat.get("id")
            name = cat.text
            lang = cat.get("lang", "")
            if cat_id and name:
                categories[(cat_id, lang)] = name
    return categories

def import_categories(xml_path, db_session):
    cats = extract_categories(xml_path)
    for (cat_id, lang), name in cats.items():
        # Example: Upsert logic (pseudo)
        db_session.execute(
            """
            INSERT INTO categories (geko_category_id, name_pol, lang)
            VALUES (%s, %s, %s)
            ON CONFLICT (geko_category_id, lang) DO UPDATE SET name_pol=EXCLUDED.name_pol
            """,
            (cat_id, name, lang)
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(cats)} categories.")
