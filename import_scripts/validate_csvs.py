import os
import csv
import logging

CSV_DIR = "data/csv_exports"
LOG_PATH = os.path.join(CSV_DIR, "csv_validation_report.log")

logging.basicConfig(
    filename=LOG_PATH,
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

def read_csv(path):
    with open(path, encoding='utf-8') as f:
        return list(csv.DictReader(f))

def validate_unique(records, key, entity):
    seen = set()
    for i, rec in enumerate(records):
        val = rec.get(key)
        if val in seen:
            msg = f"Duplicado encontrado em {entity}: {key}={val} (linha {i+2})"
            logging.error(msg)
            print(msg)
        else:
            seen.add(val)

def validate_fk(child_records, child_key, parent_records, parent_key, child_entity, parent_entity):
    parent_ids = {rec[parent_key] for rec in parent_records}
    for i, rec in enumerate(child_records):
        val = rec.get(child_key)
        if val and val not in parent_ids:
            msg = f"Chave estrangeira inválida em {child_entity}: {child_key}={val} não existe em {parent_entity}" \
                  f" (linha {i+2})"
            logging.error(msg)
            print(msg)

import re

def is_valid_ean(ean):
    return bool(ean) and re.fullmatch(r"\d{8,14}", ean)

def is_valid_url(url):
    return bool(url) and re.match(r"^https?://", url)

def validate_csvs():
    print("Iniciando validação dos CSVs...")
    # Leitura dos CSVs principais
    producers = read_csv(os.path.join(CSV_DIR, 'producers.csv'))
    units = read_csv(os.path.join(CSV_DIR, 'units.csv'))
    categories = read_csv(os.path.join(CSV_DIR, 'categories.csv'))
    products = read_csv(os.path.join(CSV_DIR, 'products.csv'))
    product_categories = read_csv(os.path.join(CSV_DIR, 'product_categories.csv'))
    product_variants = read_csv(os.path.join(CSV_DIR, 'product_variants.csv'))
    stock_levels = read_csv(os.path.join(CSV_DIR, 'stock_levels.csv'))
    prices = read_csv(os.path.join(CSV_DIR, 'prices.csv'))
    product_images = read_csv(os.path.join(CSV_DIR, 'product_images.csv'))

    # Unicidade de IDs
    validate_unique(producers, 'geko_producer_id', 'producers')
    validate_unique(units, 'geko_unit_id', 'units')
    validate_unique(categories, 'geko_category_id', 'categories')
    validate_unique(products, 'ean', 'products')
    validate_unique(products, 'geko_product_id', 'products')
    validate_unique(product_variants, 'geko_variant_stock_id', 'product_variants')

    # Integridade de FK
    validate_fk(products, 'geko_producer_id', producers, 'geko_producer_id', 'products', 'producers')
    validate_fk(products, 'geko_unit_id', units, 'geko_unit_id', 'products', 'units')
    validate_fk(product_categories, 'geko_category_id', categories, 'geko_category_id', 'product_categories', 'categories')
    validate_fk(product_categories, 'ean', products, 'ean', 'product_categories', 'products')
    validate_fk(product_variants, 'ean', products, 'ean', 'product_variants', 'products')
    validate_fk(stock_levels, 'geko_variant_stock_id', product_variants, 'geko_variant_stock_id', 'stock_levels', 'product_variants')
    validate_fk(prices, 'ean', products, 'ean', 'prices', 'products')
    validate_fk(prices, 'geko_variant_stock_id', product_variants, 'geko_variant_stock_id', 'prices', 'product_variants')
    validate_fk(product_images, 'ean', products, 'ean', 'product_images', 'products')

    # Campos obrigatórios e formatos
    for i, rec in enumerate(products):
        if not rec['ean'] or not is_valid_ean(rec['ean']):
            msg = f"EAN inválido em products: {rec['ean']} (linha {i+2})"
            logging.error(msg)
            print(msg)
        if not rec['name']:
            msg = f"Nome vazio em products (EAN={rec['ean']}) (linha {i+2})"
            logging.warning(msg)
            print(msg)
        if rec['vat_rate']:
            try:
                vat = float(rec['vat_rate'])
                if vat < 0 or vat > 100:
                    msg = f"VAT rate fora do intervalo em products: {rec['vat_rate']} (EAN={rec['ean']}) (linha {i+2})"
                    logging.warning(msg)
                    print(msg)
            except Exception:
                msg = f"VAT rate inválido em products: {rec['vat_rate']} (EAN={rec['ean']}) (linha {i+2})"
                logging.error(msg)
                print(msg)
    for i, rec in enumerate(product_images):
        if not rec['url'] or not is_valid_url(rec['url']):
            msg = f"URL inválido em product_images: {rec['url']} (linha {i+2})"
            logging.warning(msg)
            print(msg)
    for i, rec in enumerate(stock_levels):
        try:
            if rec['quantity']:
                q = int(rec['quantity'])
                if q < 0:
                    msg = f"Quantidade negativa em stock_levels: {q} (linha {i+2})"
                    logging.warning(msg)
                    print(msg)
        except Exception:
            msg = f"Quantidade inválida em stock_levels: {rec['quantity']} (linha {i+2})"
            logging.error(msg)
            print(msg)
    for i, rec in enumerate(prices):
        for field in ['net_value', 'gross_value']:
            try:
                if rec[field]:
                    val = float(rec[field])
                    if val < 0:
                        msg = f"Preço negativo em prices: {field}={val} (linha {i+2})"
                        logging.warning(msg)
                        print(msg)
            except Exception:
                msg = f"Valor inválido em prices: {field}={rec[field]} (linha {i+2})"
                logging.error(msg)
                print(msg)
    print("Validação concluída. Verifique o relatório em:", LOG_PATH)
    logging.info("Validação dos CSVs concluída.")

if __name__ == "__main__":
    validate_csvs()
