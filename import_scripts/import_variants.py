import logging
from .parse_xml import iterparse_products

def extract_variants(xml_path):
    """Extract product variants (sizes) from XML."""
    variants = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        sizes = product.find("sizes")
        if sizes is not None:
            for size in sizes.findall("size"):
                variant = {
                    "product_ean": ean,
                    "size_code_producer": size.get("code_producer"),
                    "size_code": size.get("code"),
                    "geko_variant_stock_id": size.get("stock_id"),
                }
                variants.append(variant)
    return variants

def import_variants(xml_path, db_session):
    vars = extract_variants(xml_path)
    for var in vars:
        db_session.execute(
            """
            INSERT INTO productvariants (product_ean, size_code_producer, size_code, geko_variant_stock_id)
            VALUES (%(product_ean)s, %(size_code_producer)s, %(size_code)s, %(geko_variant_stock_id)s)
            ON CONFLICT (product_ean, size_code_producer, size_code) DO UPDATE SET
                geko_variant_stock_id=EXCLUDED.geko_variant_stock_id
            """,
            var
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(vars)} variants.")
