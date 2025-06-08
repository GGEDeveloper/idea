import xml.etree.ElementTree as ET
import os
import json
import csv

def get_element_text(element, path, default=''):
    found = element.find(path)
    return found.text.strip() if found is not None and found.text else default

def get_element_attr(element, path, attr, default=''):
    found = element.find(path)
    return found.get(attr, default) if found is not None else default

def get_product_attr(element, attr, default=''):
    return element.get(attr, default)

def format_specs_for_csv(spec_list):
    if not spec_list:
        return ''
    # Converte a lista de dicionários de especificações para uma string JSON
    return json.dumps(spec_list, ensure_ascii=False)

def format_compatibility_for_csv(compat_list):
    if not compat_list:
        return ''
    return ','.join(compat_list)

def create_products_csv(xml_file_path, extracted_data_json_path, output_csv_path):
    # Carregar dados extraídos (specs e compatibilidade)
    extracted_data_map = {}
    if os.path.exists(extracted_data_json_path):
        with open(extracted_data_json_path, 'r', encoding='utf-8') as f_json:
            extracted_list = json.load(f_json)
            for item in extracted_list:
                extracted_data_map[item.get('id')] = item
    else:
        print(f"Aviso: Ficheiro de dados extraídos não encontrado em {extracted_data_json_path}")

    # Garantir que o diretório de output existe
    os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)

    headers = [
        'productId', 'name', 'sku', 'ean', 'codeProducer',
        'shortDescription', 'longDescription', 'descriptionLang', 
        'stockQuantity', 'deliveryTime',
        'priceNet', 'priceGross', 'priceVat',
        'srpNet', 'srpGross', 'srpVat',
        'producerName', 'categoryName', 'categoryIDosell', 'unitName',
        'specifications_json', 'compatibilityCodes'
    ]

    print(f"A iniciar a geração do CSV de produtos em: {output_csv_path}")
    products_processed_count = 0

    with open(output_csv_path, 'w', newline='', encoding='utf-8') as f_csv:
        writer = csv.DictWriter(f_csv, fieldnames=headers)
        writer.writeheader()

        try:
            context = ET.iterparse(xml_file_path, events=('start', 'end'))
            _, root = next(context)

            for event, elem in context:
                if event == 'end' and elem.tag == 'product':
                    products_processed_count += 1
                    product_id = get_product_attr(elem, 'id')
                    
                    # Dados diretos do produto
                    product_data = {
                        'productId': product_id,
                        'name': get_element_text(elem, 'name'),
                        'sku': get_element_text(elem, 'card'),
                        'ean': get_product_attr(elem, 'EAN'),
                        'codeProducer': get_product_attr(elem, 'code_producer'),
                        'stockQuantity': get_element_attr(elem, 'stock', 'quantity'),
                        'deliveryTime': get_element_attr(elem, 'delivery', 'time'),
                        'priceNet': get_element_attr(elem, 'price', 'net'),
                        'priceGross': get_element_attr(elem, 'price', 'gross'),
                        'priceVat': get_element_attr(elem, 'price', 'vat'),
                        'srpNet': get_element_attr(elem, 'srp', 'net', default='0'), # Default para evitar None
                        'srpGross': get_element_attr(elem, 'srp', 'gross', default='0'),
                        'srpVat': get_element_attr(elem, 'srp', 'vat', default='0'),
                        'producerName': get_element_attr(elem, 'producer', 'name'),
                        'unitName': get_element_attr(elem, 'unit', 'name')
                    }

                    # Descrição Curta, Longa e Idioma
                    short_desc_elem = elem.find('description/short_desc')
                    if short_desc_elem is not None:
                        product_data['shortDescription'] = short_desc_elem.text.strip() if short_desc_elem.text else ''
                        product_data['descriptionLang'] = short_desc_elem.get('xml:lang', '')
                    else:
                        product_data['shortDescription'] = ''
                        product_data['descriptionLang'] = ''

                    # Descrição Longa (HTML)
                    long_desc_elem = elem.find('description/long_desc')
                    if long_desc_elem is not None and long_desc_elem.text:
                        product_data['longDescription'] = long_desc_elem.text.strip()
                    else:
                        product_data['longDescription'] = ''
                    
                    # Categoria (primeira encontrada)
                    category_elem = elem.find('category')
                    if category_elem is not None:
                        product_data['categoryName'] = category_elem.text.strip() if category_elem.text else ''
                        product_data['categoryIDosell'] = category_elem.get('idosell', '')
                    else:
                        product_data['categoryName'] = ''
                        product_data['categoryIDosell'] = ''

                    # Dados extraídos (specs e compatibilidade)
                    product_extracted_info = extracted_data_map.get(product_id, {})
                    product_data['specifications_json'] = format_specs_for_csv(product_extracted_info.get('specs', []))
                    product_data['compatibilityCodes'] = format_compatibility_for_csv(product_extracted_info.get('compatibility', []))
                    
                    writer.writerow(product_data)
                    elem.clear()
            
            if hasattr(root, 'clear'):
                root.clear()

        except ET.ParseError as e:
            print(f"Erro ao fazer parse do XML: {e}")
            return
        except Exception as e:
            print(f"Ocorreu um erro inesperado: {e}")
            return

    print(f"Processamento concluído. {products_processed_count} produtos escritos em {output_csv_path}")

if __name__ == "__main__":
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    caminho_xml_relativo = "data/xml/geko_full_en_utf8.xml"
    caminho_json_extraido_relativo = "data/xml/dados_extraidos.json"
    caminho_csv_output_relativo = "data/csv_para_bd/products_table.csv"

    caminho_xml_abs = os.path.join(base_path_projeto, caminho_xml_relativo)
    caminho_json_abs = os.path.join(base_path_projeto, caminho_json_extraido_relativo)
    caminho_csv_abs = os.path.join(base_path_projeto, caminho_csv_output_relativo)

    create_products_csv(caminho_xml_abs, caminho_json_abs, caminho_csv_abs)
