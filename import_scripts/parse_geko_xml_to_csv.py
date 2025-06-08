import os
import csv
import logging
from lxml import etree

# Diretórios e ficheiros
XML_PATH = "data/xml/geko_full_en_utf8.xml"
CSV_DIR = "data/csv_exports"
os.makedirs(CSV_DIR, exist_ok=True)

# Configuração de logging
logging.basicConfig(
    filename=os.path.join(CSV_DIR, "parse_geko_xml.log"),
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s"
)

# Função utilitária para abrir CSVs
class CsvWriters:
    def __init__(self, dir_path):
        self.files = {}
        self.writers = {}
        self.dir_path = dir_path
    def open(self, name, header):
        f = open(os.path.join(self.dir_path, name), 'w', newline='', encoding='utf-8')
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        self.files[name] = f
        self.writers[name] = writer
    def writer(self, name):
        return self.writers[name]
    def close_all(self):
        for f in self.files.values():
            f.close()

# Função principal de parsing

def parse_geko_xml(xml_path, csv_dir):
    writers = CsvWriters(csv_dir)
    # Definir headers para cada entidade
    writers.open('producers.csv', ['geko_producer_id', 'name'])
    writers.open('units.csv', ['geko_unit_id', 'name', 'moq'])
    writers.open('categories.csv', ['geko_category_id', 'name', 'path', 'parent_geko_category_id'])
    writers.open('products.csv', [
        'ean', 'geko_product_id', 'name',
        'short_description_en', 'long_description_en', 'desc_fallback_en',
        'short_description_pt', 'long_description_pt', 'desc_fallback_pt',  # PT: aguardando tradução
        'card_url', 'vat_rate', 'geko_updated_at', 'geko_producer_id', 'geko_unit_id'
    ])
    writers.open('product_categories.csv', ['ean', 'geko_category_id'])
    writers.open('product_variants.csv', [
        'ean', 'geko_variant_size_code', 'geko_variant_producer_code', 'geko_variant_stock_id', 'weight', 'gross_weight'
    ])
    writers.open('stock_levels.csv', ['geko_variant_stock_id', 'quantity'])
    writers.open('prices.csv', ['ean', 'geko_variant_stock_id', 'price_type', 'net_value', 'gross_value', 'currency'])
    writers.open('product_images.csv', ['ean', 'url', 'is_main', 'sort_order'])

    # Dicionários para evitar duplicados
    producers = {}
    units = {}
    categories = {}

    context = etree.iterparse(xml_path, events=("end",), tag="product")
    for _, product in context:
        try:
            # IDs do produto
            ean = product.get("EAN") or product.get("ean")
            geko_product_id = product.get("id")
            vat_rate = product.get("vat")
            code_producer = product.get("code_producer")
            # Extrair produtor
            # Ajuste Cascade 2025-06-07: Se id do producer estiver vazio, usar o nome como identificador único
            prod_node = product.find('producer')
            geko_producer_id = None
            if prod_node is not None:
                prod_name = prod_node.get('name')
                # Se id estiver vazio, usa o nome como identificador
                geko_producer_id = prod_node.get('id') or prod_name
                if geko_producer_id and geko_producer_id not in producers:
                    writers.writer('producers.csv').writerow({'geko_producer_id': geko_producer_id, 'name': prod_name})
                    producers[geko_producer_id] = prod_name
            # Extrair unidade
            unit_node = product.find('unit')
            geko_unit_id = None
            if unit_node is not None:
                geko_unit_id = unit_node.get('id')
                unit_name = unit_node.get('name')
                moq = unit_node.get('moq')
                if geko_unit_id and geko_unit_id not in units:
                    writers.writer('units.csv').writerow({'geko_unit_id': geko_unit_id, 'name': unit_name, 'moq': moq})
                    units[geko_unit_id] = unit_name
            # Extrair categorias diretas do produto
            for cat_node in product.findall('category'):
                geko_category_id = cat_node.get('id')
                cat_name = cat_node.get('name')
                path = cat_node.get('path')
                parent_id = cat_node.get('parent_geko_category_id')
                if geko_category_id and geko_category_id not in categories:
                    writers.writer('categories.csv').writerow({
                        'geko_category_id': geko_category_id,
                        'name': cat_name,
                        'path': path,
                        'parent_geko_category_id': parent_id
                    })
                    categories[geko_category_id] = cat_name
                # Ligação produto-categoria
                if ean and geko_category_id:
                    writers.writer('product_categories.csv').writerow({'ean': ean, 'geko_category_id': geko_category_id})
            # Extrair dados textuais do produto
            name = ''
            long_desc_en = ''
            short_desc_en = ''
            desc_fallback_en = ''
            desc_node = product.find('description')
            # Extract EN descriptions with fallback
            if desc_node is not None:
                # Name
                name_node = desc_node.find('name')
                if name_node is not None and name_node.text:
                    name = name_node.text.strip()
                # Long description EN
                long_nodes = desc_node.findall('long_desc')
                for node in long_nodes:
                    if node.get('{http://www.w3.org/XML/1998/namespace}lang') == 'en' and node.text:
                        long_desc_en = node.text.strip()
                        break
                # Short description EN
                short_nodes = desc_node.findall('short_desc')
                for node in short_nodes:
                    if node.get('{http://www.w3.org/XML/1998/namespace}lang') == 'en' and node.text:
                        short_desc_en = node.text.strip()
                        break
                # Nested <description> (fallback)
                nested_desc_node = desc_node.find('description')
                if (not long_desc_en and not short_desc_en) and nested_desc_node is not None and nested_desc_node.text:
                    desc_fallback_en = nested_desc_node.text.strip()
                # Fallback to name if all empty
                if not long_desc_en and not short_desc_en and not desc_fallback_en:
                    desc_fallback_en = name
                # Log fallback usage
                if not long_desc_en:
                    logging.info(f"[DESC_FALLBACK] Produto {ean}: long_desc_en vazio, usando short_desc_en ou fallback.")
                if not long_desc_en and not short_desc_en:
                    logging.info(f"[DESC_FALLBACK] Produto {ean}: short_desc_en vazio, usando nested <description> ou name.")
            card_url = ''
            card_node = product.find('card')
            if card_node is not None:
                card_url = card_node.get('url', '')
            # Escrever produto
            writers.writer('products.csv').writerow({
                'ean': ean,
                'geko_product_id': geko_product_id,
                'name': name,
                'short_description_en': short_desc_en,
                'long_description_en': long_desc_en,
                'desc_fallback_en': desc_fallback_en,
                # Colunas PT aguardando tradução
                'short_description_pt': '',
                'long_description_pt': '',
                'desc_fallback_pt': '',
                'card_url': card_url,
                'vat_rate': vat_rate,
                'geko_updated_at': '',
                'geko_producer_id': geko_producer_id,
                'geko_unit_id': geko_unit_id
            })
            # NOTA: As colunas *_pt permanecem vazias até tradução futura.
            # Extrair variantes (sizes)
            for size in product.findall('sizes/size'):
                size_code = size.get('code')
                variant_producer_code = code_producer
                stock_node = size.find('stock')
                stock_id = stock_node.get('id') if stock_node is not None else None
                weight = size.get('weight')
                gross_weight = size.get('grossWeight')
                if not stock_id:
                    logging.warning(f"Variante ignorada sem stock_id: ean={ean}, size_code={size_code}, producer_code={variant_producer_code}")
                    continue
                writers.writer('product_variants.csv').writerow({
                    'ean': ean,
                    'geko_variant_size_code': size_code,
                    'geko_variant_producer_code': variant_producer_code,
                    'geko_variant_stock_id': stock_id,
                    'weight': weight,
                    'gross_weight': gross_weight
                })
                # Extrair stock
                stock_quantity = stock_node.get('quantity') if stock_node is not None else None
                writers.writer('stock_levels.csv').writerow({
                    'geko_variant_stock_id': stock_id,
                    'quantity': stock_quantity
                })
                # Extrair preço da variante
                price_node = size.find('price')
                if price_node is not None:
                    net = price_node.get('net')
                    gross = price_node.get('gross')
                    currency = price_node.get('currency', 'PLN')
                    writers.writer('prices.csv').writerow({
                        'ean': ean,
                        'geko_variant_stock_id': stock_id,
                        'price_type': 'variant_standard',
                        'net_value': net,
                        'gross_value': gross,
                        'currency': currency
                    })
            # Preço base do produto
            price_node = product.find('price')
            if price_node is not None:
                net = price_node.get('net')
                gross = price_node.get('gross')
                currency = price_node.get('currency', 'PLN')
                writers.writer('prices.csv').writerow({
                    'ean': ean,
                    'geko_variant_stock_id': None,
                    'price_type': 'base_product_standard',
                    'net_value': net,
                    'gross_value': gross,
                    'currency': currency
                })
            # Extrair imagens
            images_node = product.find('images')
            if images_node is not None:
                imgs = images_node.findall('.//image')
                for idx, img in enumerate(imgs):
                    img_url = img.get('url')
                    is_main = img.get('main', 'False')
                    if img_url is None or not img_url.strip():
                        logging.warning(f"Imagem ignorada sem atributo url: ean={ean}, idx={idx}")
                        continue
                    writers.writer('product_images.csv').writerow({
                        'ean': ean,
                        'url': img_url.strip(),
                        'is_main': is_main,
                        'sort_order': idx
                    })
        except Exception as ex:
            logging.error(f"Erro ao processar produto: {ex}")
        finally:
            product.clear()
    writers.close_all()
    logging.info("Parsing do XML concluído com sucesso.")

if __name__ == "__main__":
    parse_geko_xml(XML_PATH, CSV_DIR)
