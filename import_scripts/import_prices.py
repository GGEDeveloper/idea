import logging
from .parse_xml import iterparse_products

def extract_prices(xml_path):
    """Extract price entries from XML."""
    prices = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        for price in product.findall("price"):
            prices.append({
                "product_ean": ean,
                "type": price.get("type"),
                "net": price.get("net"),
                "gross": price.get("gross"),
                "currency": price.get("currency")
            })
    return prices

def import_prices(xml_path, db_session):
    prices = extract_prices(xml_path)
    for price in prices:
        db_session.execute(
            """
            INSERT INTO prices (product_ean, type, net, gross, currency)
            VALUES (%(product_ean)s, %(type)s, %(net)s, %(gross)s, %(currency)s)
            ON CONFLICT (product_ean, type, currency) DO UPDATE SET
                net=EXCLUDED.net,
                gross=EXCLUDED.gross
            """,
            price
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(prices)} prices.")
