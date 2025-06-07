import logging
from .parse_xml import iterparse_products

def extract_products(xml_path):
    """Extract product core fields from XML."""
    products = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        geko_product_id = product.get("id")
        vat_rate = product.get("vat")
        base_name = product.findtext("card")
        producer_node = product.find("producer")
        producer_id = producer_node.get("id") if producer_node is not None else None
        producer_name = producer_node.get("name") if producer_node is not None else None
        unit_node = product.find("unit")
        unit_code = unit_node.get("code") if unit_node is not None else None
        unit_name = unit_node.get("name") if unit_node is not None else None
        short_desc = None
        long_desc = None
        for desc in product.findall("description"):
            if desc.get("lang") == "pol":
                if desc.get("type") == "short":
                    short_desc = desc.text
                elif desc.get("type") == "long":
                    long_desc = desc.text
        has_variants = product.find("sizes") is not None
        products.append({
            "ean": ean,
            "geko_product_id": geko_product_id,
            "vat_rate": vat_rate,
            "base_name": base_name,
            "producer_id": producer_id,
            "producer_name": producer_name,
            "unit_code": unit_code,
            "unit_name": unit_name,
            "short_desc_pol": short_desc,
            "long_desc_pol": long_desc,
            "has_variants": has_variants
        })
    return products

def import_products(xml_path, db_session):
    prods = extract_products(xml_path)
    for prod in prods:
        db_session.execute(
            """
            INSERT INTO products (
                ean, geko_product_id, vat_rate, base_name, producer_id, producer_name,
                unit_code, unit_name, short_desc_pol, long_desc_pol, has_variants
            ) VALUES (%(ean)s, %(geko_product_id)s, %(vat_rate)s, %(base_name)s, %(producer_id)s, %(producer_name)s,
                %(unit_code)s, %(unit_name)s, %(short_desc_pol)s, %(long_desc_pol)s, %(has_variants)s)
            ON CONFLICT (ean) DO UPDATE SET
                geko_product_id=EXCLUDED.geko_product_id,
                vat_rate=EXCLUDED.vat_rate,
                base_name=EXCLUDED.base_name,
                producer_id=EXCLUDED.producer_id,
                producer_name=EXCLUDED.producer_name,
                unit_code=EXCLUDED.unit_code,
                unit_name=EXCLUDED.unit_name,
                short_desc_pol=EXCLUDED.short_desc_pol,
                long_desc_pol=EXCLUDED.long_desc_pol,
                has_variants=EXCLUDED.has_variants
            """,
            prod
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(prods)} products.")
