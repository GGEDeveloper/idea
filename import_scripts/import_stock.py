import logging
from .parse_xml import iterparse_products

def extract_stock(xml_path):
    """Extract stock entries from XML."""
    stock_entries = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        # Stock for main product
        for stock in product.findall("stock"):
            stock_entries.append({
                "geko_stock_id": stock.get("id"),
                "product_ean": ean,
                "quantity": stock.get("quantity"),
                "availability_id": stock.get("availability_id"),
                "variant_id": None  # To be filled later if linked to variant
            })
        # Stock for variants (linked by stock_id)
        sizes = product.find("sizes")
        if sizes is not None:
            for size in sizes.findall("size"):
                stock_id = size.get("stock_id")
                if stock_id:
                    stock_entries.append({
                        "geko_stock_id": stock_id,
                        "product_ean": ean,
                        "quantity": None,  # To be filled if present in <stock>
                        "availability_id": None,
                        "variant_id": None  # To be resolved in DB after both tables are loaded
                    })
    return stock_entries

def import_stock(xml_path, db_session):
    stocks = extract_stock(xml_path)
    for entry in stocks:
        db_session.execute(
            """
            INSERT INTO stockentries (geko_stock_id, product_ean, quantity, availability_id, variant_id)
            VALUES (%(geko_stock_id)s, %(product_ean)s, %(quantity)s, %(availability_id)s, %(variant_id)s)
            ON CONFLICT (geko_stock_id) DO UPDATE SET
                quantity=EXCLUDED.quantity,
                availability_id=EXCLUDED.availability_id,
                variant_id=EXCLUDED.variant_id
            """,
            entry
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(stocks)} stock entries.")
