import xml.etree.ElementTree as ET
import os

def analisar_estrutura_produto(caminho_ficheiro_xml, num_produtos_exemplo=2):
    """
    Analisa a estrutura e o conteúdo de exemplo dos primeiros N elementos 'product'
    num ficheiro XML. Também recolhe todos os nomes de tags e atributos únicos
    encontrados dentro dos elementos 'product' de exemplo.
    """
    if not os.path.exists(caminho_ficheiro_xml):
        print(f"Erro: O ficheiro XML não foi encontrado em {caminho_ficheiro_xml}")
        return

    print(f"A processar o ficheiro XML em: {caminho_ficheiro_xml} para análise de estrutura de produto.\n")
    
    produtos_processados = 0
    all_tags_in_sample_products = set()
    all_attributes_in_sample_products = set()

    try:
        # Usar iterparse para processamento eficiente de ficheiros grandes
        context = ET.iterparse(caminho_ficheiro_xml, events=('start', 'end'))
        event, root = next(iter(context)) # Get the root element to clear its children later if needed

        for event, elem in context:
            if event == 'end' and elem.tag == 'product':
                if produtos_processados < num_produtos_exemplo:
                    print(f"\n--- Exemplo de Produto {produtos_processados + 1} ---")
                    print_element_structure(elem, indent_level=0, 
                                            tags_collector=all_tags_in_sample_products, 
                                            attributes_collector=all_attributes_in_sample_products)
                    produtos_processados += 1
                
                # Limpar o elemento da memória após o processamento para poupar recursos
                elem.clear()
                # Para ficheiros XML muito grandes e planos (ex: <root><item/><item/>...</root>),
                # pode ser útil limpar também os filhos já processados do elemento raiz.
                # root.clear() # Cuidado: usar apenas se souber que não afeta a iteração.

            # Parar após processar o número desejado de exemplos para esta análise específica.
            if produtos_processados >= num_produtos_exemplo and elem.tag == 'product': # check elem.tag to ensure we break after a product is fully processed
                break 
                # Se precisarmos de uma lista exaustiva de tags/atributos de *todos* os produtos,
                # o loop não deveria parar aqui, mas a impressão seria limitada.

        if produtos_processados > 0:
            print(f"\n--- Resumo das Tags e Atributos nos Primeiros {produtos_processados} Produtos Analisados ---")
            print(f"Tags encontradas DENTRO destes {produtos_processados} produtos de exemplo: {sorted(list(all_tags_in_sample_products))}")
            print(f"Nomes de atributos encontrados DENTRO destas tags nestes {produtos_processados} produtos de exemplo: {sorted(list(all_attributes_in_sample_products))}")
        elif produtos_processados == 0:
            print("Nenhum elemento <product> foi encontrado ou processado.")

    except ET.ParseError as e:
        print(f"Erro ao fazer parse do XML: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

def print_element_structure(elem, indent_level=0, tags_collector=None, attributes_collector=None):
    """
    Imprime recursivamente a estrutura de um elemento XML (tag, atributos, texto).
    Também recolhe nomes de tags e atributos.
    """
    indent = "  " * indent_level
    tag_info = f"{indent}Tag: <{elem.tag}>"
    
    if tags_collector is not None:
        tags_collector.add(elem.tag)

    if elem.attrib:
        attr_str = ", ".join([f"{k}='{v}'" for k, v in elem.attrib.items()])
        tag_info += f" (Atributos: {attr_str})"
        if attributes_collector is not None:
            for attr_name in elem.attrib.keys():
                attributes_collector.add(attr_name)
    
    print(tag_info)

    text_content = elem.text.strip() if elem.text else None
    if text_content:
        max_len = 100 # Limitar o comprimento do texto exibido
        display_text = (text_content[:max_len] + '...') if len(text_content) > max_len else text_content
        print(f"{indent}  Texto: \"{display_text}\"")

    for child in elem:
        print_element_structure(child, indent_level + 1, tags_collector, attributes_collector)
    
    # Opcional: Mostrar texto "tail" se existir (texto entre o fim de um filho e o início do próximo)
    # if elem.tail and elem.tail.strip():
    #     print(f"{indent}  (Texto Posterior: \"{elem.tail.strip()}\")")

if __name__ == "__main__":
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    caminho_xml_relativo = "data/xml/geko_full_en_utf8.xml"
    caminho_xml_absoluto_para_script = os.path.join(base_path_projeto, caminho_xml_relativo)

    print("Script de análise de estrutura de produto iniciado.")
    # Analisar os primeiros 2 produtos para dar uma ideia da estrutura.
    # Pode aumentar num_produtos_exemplo se desejar ver mais.
    analisar_estrutura_produto(caminho_xml_absoluto_para_script, num_produtos_exemplo=2)
