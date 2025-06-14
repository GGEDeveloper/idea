import xml.etree.ElementTree as ET
import logging
import sys
import os

# Ensure basic logging is configured if this module is run in a context where it hasn't been
# This helps if the module is tested or run standalone, though usually the calling script (run_import_geko_data or orchestrator) will set up logging.
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s')

def parse_product_node(product_node):
    """Parseia um único nó <product> e retorna um dicionário com os dados extraídos."""
    try:
        ean = product_node.get('EAN')
        product_id_attr = product_node.get('id') # ID interno do Geko para o produto
        code_attr = product_node.get('code') # Código do produto Geko

        if not ean:
            logging.warning(f"Produto com ID Geko '{product_id_attr}' e código '{code_attr}' não possui EAN. Pulando.")
            return None

        # Preço de fornecedor (net) - filho direto de <product>
        price_node = product_node.find('price')
        supplier_price = 0.0
        if price_node is not None and price_node.get('net') is not None:
            try:
                supplier_price = float(price_node.get('net'))
            except ValueError:
                logging.warning(f"Valor de preço inválido para EAN {ean}: '{price_node.get('net')}'. Usando 0.0.")
        else:
            logging.info(f"Tag <price> ou atributo 'net' não encontrado para EAN {ean} a nível de produto. Verificando variantes...")

        # Stock - somar de todas as tags <size>/<stock>
        stock_quantity = 0
        sizes_node = product_node.find('sizes')
        found_stock_in_variant = False
        if sizes_node is not None:
            for size_node in sizes_node.findall('size'):
                stock_node = size_node.find('stock')
                if stock_node is not None and stock_node.get('quantity') is not None:
                    try:
                        stock_quantity += int(stock_node.get('quantity'))
                        found_stock_in_variant = True # Marcar se encontramos stock em variante
                    except ValueError:
                        logging.warning(f"Valor de stock inválido para uma variante do EAN {ean}: '{stock_node.get('quantity')}'.")
                # Se o preço principal do produto não foi encontrado, tentar pegar da primeira variante com preço
                if supplier_price == 0.0 and not found_stock_in_variant: # Condição para pegar preço da variante apenas se principal for 0
                    variant_price_node = size_node.find('price')
                    if variant_price_node is not None and variant_price_node.get('net') is not None:
                        try:
                            supplier_price = float(variant_price_node.get('net'))
                            logging.info(f"Preço principal não encontrado para EAN {ean}, usando preço da primeira variante: {supplier_price}")
                        except ValueError:
                            logging.warning(f"Valor de preço da variante inválido para EAN {ean}: '{variant_price_node.get('net')}'.")
        
        if not found_stock_in_variant and sizes_node is None:
             logging.info(f"Nenhuma tag <sizes> ou <stock> encontrada para EAN {ean}. Stock será 0.")

        # Raw XML node como string
        # Cuidado: ET.tostring pode ter problemas com encoding se não for tratado. UTF-8 é o padrão.
        raw_xml_node_str = ET.tostring(product_node, encoding='unicode')

        return {
            'ean': ean,
            'supplier_price': supplier_price,
            'stock_quantity': stock_quantity,
            'raw_xml_node_str': raw_xml_node_str,
            'geko_product_id': product_id_attr, # Campo adicional para referência
            'geko_product_code': code_attr      # Campo adicional para referência
        }
    except Exception as e:
        logging.error(f"Erro ao parsear nó do produto (EAN: {product_node.get('EAN', 'N/A')} ID Geko: {product_node.get('id', 'N/A')}): {e}", exc_info=True)
        return None

def parse_geko_xml_file(xml_file_path):
    """Parses the Geko XML file and extracts product data.

    Args:
        xml_file_path (str): The path to the XML file.

    Returns:
        list: A list of dictionaries, where each dictionary represents a product.
              Returns None if a critical error occurs (e.g., file not found).
    """
    logging.info(f"Starting XML parsing for file: {xml_file_path}")
    products_data = []
    processed_count = 0
    skipped_products_count = 0
    log_interval = 500 # Log progress every 500 products

    try:
        # Using iterparse for memory-efficient parsing of large XML files
        context = ET.iterparse(xml_file_path, events=("start", "end"))
        context = iter(context) # Make it an iterator
        event, root = next(context) # Get the root element to clear it later

        for event, elem in context:
            if event == "end" and elem.tag == "product":
                processed_count += 1
                try:
                    ean = elem.get("EAN")
                    geko_product_id_attr = elem.get("id") # Attribute "id" from <product>
                    geko_code_attr = elem.get("code")     # Attribute "code" from <product>

                    if not ean:
                        logging.warning(f"Product missing EAN attribute. Product ID: {geko_product_id_attr}, Code: {geko_code_attr}. Skipping product.")
                        skipped_products_count += 1
                        elem.clear() # Crucial for memory management with iterparse
                        # root.clear() # If products are direct children of root and you want to clear root attributes periodically
                        continue

                    supplier_price = 0.0
                    price_tag = elem.find("price")
                    if price_tag is not None and price_tag.get("net") is not None:
                        try:
                            supplier_price = float(price_tag.get("net"))
                        except ValueError:
                            logging.warning(f"Could not convert supplier_price 'net' value to float for EAN {ean}. Product ID: {geko_product_id_attr}. Defaulting to 0.0.")
                            supplier_price = 0.0
                    else:
                        logging.debug(f"No direct <price net='...'> tag found for EAN {ean}. Product ID: {geko_product_id_attr}. Supplier price will be 0.0.")

                    stock_quantity = 0
                    sizes_tag = elem.find("sizes")
                    if sizes_tag is not None:
                        for size_tag in sizes_tag.findall("size"):
                            stock_tag = size_tag.find("stock")
                            if stock_tag is not None and stock_tag.get("quantity") is not None:
                                try:
                                    stock_quantity += int(stock_tag.get("quantity"))
                                except ValueError:
                                    logging.warning(f"Could not convert stock 'quantity' to int for EAN {ean}, Size Code: {size_tag.get('code')}. Product ID: {geko_product_id_attr}. Skipping this stock entry.")
                    else:
                        logging.debug(f"No <sizes> tag found for EAN {ean}. Product ID: {geko_product_id_attr}. Stock quantity will be 0.")
                    
                    # Get the raw XML string for the product node
                    # Ensure encoding is consistent with the XML file (typically UTF-8)
                    raw_xml_node_str = ET.tostring(elem, encoding='unicode')

                    products_data.append({
                        'ean': ean,
                        'supplier_price': supplier_price,
                        'stock_quantity': stock_quantity,
                        'raw_xml_node_str': raw_xml_node_str,
                        'geko_product_id_attr': geko_product_id_attr,
                        'geko_code_attr': geko_code_attr
                    })

                    if processed_count % log_interval == 0:
                        logging.info(f"Parsed {processed_count} products so far...")
                
                except Exception as e_prod:
                    logging.error(f"Error processing a <product> element (ID: {elem.get('id', 'N/A')}, EAN: {elem.get('EAN', 'N/A')}): {e_prod}", exc_info=False) # Set exc_info=True for full traceback if needed
                    skipped_products_count +=1
                finally:
                    elem.clear() # Crucial for memory management with iterparse
                    # If products are direct children of root, and root itself might accumulate text content between products:
                    # root.clear() # This would clear attributes and text of the root element as well.
                    # A more targeted approach if products are children of <products> which is child of <offer>
                    # is to clear `elem` and ensure its parent releases it. Iterparse handles much of this.
                    # For deeply nested structures, you might need to manage clearing parent elements if they are not the iteration target.

        logging.info(f"Finished XML parsing. Successfully processed {len(products_data)} products out of {processed_count} <product> tags encountered.")
        if skipped_products_count > 0:
            logging.warning(f"Skipped {skipped_products_count} products due to missing EAN or errors during processing.")
        return products_data

    except FileNotFoundError:
        logging.error(f"XML file not found at: {xml_file_path}")
        return None # Indicate critical failure
    except ET.ParseError as e:
        logging.error(f"XML ParseError in file {xml_file_path}: {e}", exc_info=True)
        return None # Indicate critical failure
    except Exception as e:
        logging.error(f"An unexpected error occurred during XML parsing: {e}", exc_info=True)
        return None # Indicate critical failure

if __name__ == '__main__':
    # Example usage for testing the parser directly
    # Make sure this test XML file exists or change the path
    # This part is for direct testing, not used when called as a module
    
    # Determine the project root from this script's location
    # scripts/data_import/parsers/parse_geko_xml.py
    # Need to go up 3 levels to get to project_root
    project_root_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    test_xml_file = os.path.join(project_root_path, 'data', 'xml', 'produkty_xml_3_14-06-2025_13_06_53_en.xml') 
    
    # Setup logging for direct script execution test
    log_dir = os.path.join(project_root_path, 'logs') # Example log directory
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    test_log_file = os.path.join(log_dir, 'parse_geko_xml_test.log')

    logging.basicConfig(
        level=logging.DEBUG, # More verbose for testing
        format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s',
        handlers=[
            logging.FileHandler(test_log_file, mode='w'), # Overwrite for each test run
            logging.StreamHandler(sys.stdout)
        ]
    )

    logging.info(f"--- Starting direct test of parse_geko_xml_file with {test_xml_file} ---")
    
    if not os.path.exists(test_xml_file):
        logging.error(f"Test XML file not found: {test_xml_file}. Cannot run direct test.")
    else:
        products = parse_geko_xml_file(test_xml_file)
        if products is not None:
            logging.info(f"Direct test: Successfully parsed {len(products)} products.")
            # for i, product in enumerate(products[:5]): # Print first 5 products as sample
            #     logging.debug(f"Sample product {i+1}: {product}")
        else:
            logging.error("Direct test: Parsing failed.")
    logging.info("--- Finished direct test of parse_geko_xml_file ---") 