import xml.etree.ElementTree as ET
import os
import re
import json
try:
    from bs4 import BeautifulSoup
except ImportError:
    print("BeautifulSoup4 não está instalada. Por favor, instale com: pip install beautifulsoup4")
    BeautifulSoup = None # Define para None para que o script possa indicar o erro e sair

# Regex para especificações técnicas: "Label: Value" ou "Label:<strong>Value</strong>"
# Captura (Label) e (Value). Permite caracteres acentuados no Label.
REGEX_SPECS_HTML = re.compile(r"([\w\sÀ-ÿ]+?):\s*<strong>\s*([^<]+?)\s*</strong>", re.IGNORECASE)
REGEX_SPECS_TEXT = re.compile(r"([\w\sÀ-ÿ]+?):\s*([^\n<]{1,100})", re.IGNORECASE) # Valor até 100 chars, sem novas linhas ou tags

# Regex para informação de compatibilidade (Polaco)
REGEX_COMPATIBILITY_PL = re.compile(r"Pasuje również do.*?o kodzie:\s*([A-Z0-9,\s]+)", re.IGNORECASE)

def extract_text_from_html(html_content):
    if not html_content or not BeautifulSoup:
        return ""
    soup = BeautifulSoup(html_content, 'html.parser')
    # Extrai texto, tentando manter alguma legibilidade com espaços
    return soup.get_text(separator=' ', strip=True)

def analyze_product_descriptions(xml_file_path):
    if not BeautifulSoup:
        print("BeautifulSoup4 é necessária mas não está disponível. A sair.")
        return

    if not os.path.exists(xml_file_path):
        print(f"Erro: Ficheiro XML não encontrado em {xml_file_path}")
        return

    print(f"A iniciar extração de dados estruturados de <long_desc> para todos os produtos...\n")

    processed_products = 0
    products_with_specs = 0
    products_with_compatibility = 0
    
    all_extracted_data = []

    try:
        context = ET.iterparse(xml_file_path, events=('start', 'end'))
        _, root = next(context) # Avançar para o elemento raiz

        for event, elem in context:
            if event == 'end' and elem.tag == 'product':
                processed_products += 1
                product_id = elem.get('id', 'N/A')
                
                current_product_data = {'id': product_id, 'specs': [], 'compatibility': []}
                found_spec_for_product = False
                found_compat_for_product = False

                desc_container = elem.find('description')
                if desc_container is not None:
                    long_desc_elem = desc_container.find('long_desc')
                    if long_desc_elem is not None and long_desc_elem.text and long_desc_elem.text.strip():
                        html_content = long_desc_elem.text.strip()
                        
                        # 1. Extrair Especificações (tentativa com HTML e depois com texto limpo)
                        spec_matches = REGEX_SPECS_HTML.findall(html_content)
                        if spec_matches:
                            for label, value in spec_matches:
                                clean_label = label.strip()
                                clean_value = value.strip()
                                current_product_data['specs'].append({clean_label: clean_value})
                                found_spec_for_product = True
                        else: # Fallback para texto limpo se o padrão HTML não for encontrado
                            plain_text = extract_text_from_html(html_content)
                            spec_matches_text = REGEX_SPECS_TEXT.findall(plain_text)
                            for label, value in spec_matches_text:
                                clean_label = label.strip()
                                clean_value = value.strip()
                                # Evitar que a frase de compatibilidade seja apanhada como spec
                                if not clean_label.lower().startswith("pasuje również do") and ':' not in clean_value:
                                    current_product_data['specs'].append({clean_label: clean_value})
                                    found_spec_for_product = True
                        
                        # 2. Extrair Informação de Compatibilidade
                        compat_matches = REGEX_COMPATIBILITY_PL.search(html_content)
                        if compat_matches:
                            codes_str = compat_matches.group(1)
                            codes_list = [code.strip() for code in codes_str.split(',') if code.strip()]
                            if codes_list:
                                current_product_data['compatibility'] = codes_list
                                found_compat_for_product = True
                
                if found_spec_for_product:
                    products_with_specs += 1
                if found_compat_for_product:
                    products_with_compatibility += 1
                
                if found_spec_for_product or found_compat_for_product:
                    all_extracted_data.append(current_product_data)
                    print(f"Produto ID: {product_id}")
                    if current_product_data['specs']:
                        print(f"  Especificações Extraídas:")
                        for spec_item in current_product_data['specs']:
                            for k, v in spec_item.items():
                                print(f"    - {k}: {v}")
                    if current_product_data['compatibility']:
                        print(f"  Produtos Compatíveis: {', '.join(current_product_data['compatibility'])}")
                    # Não imprimir individualmente aqui, apenas acumular
                    # print(f"Produto ID: {product_id}")
                    # if current_product_data['specs']:
                    #     print(f"  Especificações Extraídas:")
                    #     for spec_item in current_product_data['specs']:
                    #         for k, v in spec_item.items():
                    #             print(f"    - {k}: {v}")
                    # if current_product_data['compatibility']:
                    #     print(f"  Produtos Compatíveis: {', '.join(current_product_data['compatibility'])}")
                    # print("-" * 20)
                    pass # Apenas acumula em all_extracted_data

                elem.clear() # Limpar elemento para poupar memória
        if hasattr(root, 'clear'): # Limpar root se possível
             root.clear()

        print(f"\n--- Extração de Dados Estruturados Concluída ---")
        print(f"Total de produtos processados: {processed_products}")
        print(f"Produtos com especificações extraídas: {products_with_specs}")
        print(f"Produtos com informação de compatibilidade extraída: {products_with_compatibility}")

        # Guardar os dados extraídos num ficheiro JSON
        output_json_path = os.path.join(os.path.dirname(xml_file_path), "dados_extraidos.json")
        if not os.path.isabs(output_json_path):
             # Se xml_file_path for relativo, construir caminho a partir do diretório do script
             script_dir = os.path.dirname(os.path.abspath(__file__))
             output_json_path = os.path.join(script_dir, "dados_extraidos.json")

        try:
            with open(output_json_path, 'w', encoding='utf-8') as f_json:
                json.dump(all_extracted_data, f_json, ensure_ascii=False, indent=4)
            print(f"\nDados extraídos guardados em: {output_json_path}")
        except IOError as e:
            print(f"Erro ao guardar o ficheiro JSON: {e}")

    except ET.ParseError as e:
        print(f"Erro ao fazer parse do XML: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    # O caminho para o XML é relativo ao diretório do projeto 'idea'
    # O JSON será guardado no mesmo diretório do XML (data/xml/)
    caminho_xml_no_projeto = "data/xml/geko_full_en_utf8.xml"
    caminho_xml_absoluto = os.path.join(base_path_projeto, caminho_xml_no_projeto)
    
    analyze_product_descriptions(caminho_xml_absoluto)
