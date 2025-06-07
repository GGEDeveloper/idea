import logging
from .parse_xml import iterparse_products

def extract_images(xml_path):
    """Extract product images from XML."""
    images = []
    for product in iterparse_products(xml_path):
        ean = product.get("ean")
        images_node = product.find("images")
        if images_node is not None:
            for idx, image in enumerate(images_node.findall("image"), 1):
                images.append({
                    "product_ean": ean,
                    "url": image.get("url"),
                    "type": image.get("type"),
                    "width": image.get("width"),
                    "height": image.get("height"),
                    "is_main": image.get("type") == "main" or idx == 1,
                    "sort_order": idx,
                    "updated_at": image.get("updated_at")
                })
    return images

def import_images(xml_path, db_session):
    imgs = extract_images(xml_path)
    for img in imgs:
        db_session.execute(
            """
            INSERT INTO productimages (product_ean, url, type, width, height, is_main, sort_order, updated_at)
            VALUES (%(product_ean)s, %(url)s, %(type)s, %(width)s, %(height)s, %(is_main)s, %(sort_order)s, %(updated_at)s)
            ON CONFLICT (product_ean, url) DO UPDATE SET
                type=EXCLUDED.type,
                width=EXCLUDED.width,
                height=EXCLUDED.height,
                is_main=EXCLUDED.is_main,
                sort_order=EXCLUDED.sort_order,
                updated_at=EXCLUDED.updated_at
            """,
            img
        )
    db_session.commit()
    logging.info(f"Imported/updated {len(imgs)} images.")
