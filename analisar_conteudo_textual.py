import xml.etree.ElementTree as ET
import os

def analisar_conteudo_descritivo_completo(caminho_ficheiro_xml, max_exemplos=5):
    if not os.path.exists(caminho_ficheiro_xml):
        print(f"Erro: O ficheiro XML não foi encontrado em {caminho_ficheiro_xml}")
        return

    print(f"A iniciar análise de conteúdo textual de <long_desc> e <description> interna para TODOS os produtos...\n")
    
    total_produtos_processados = 0
    produtos_com_long_desc = 0
    produtos_com_inner_desc = 0
    
    exemplos_long_desc = []
    exemplos_inner_desc = []

    try:
        context = ET.iterparse(caminho_ficheiro_xml, events=('start', 'end'))
        _, root = next(context) # Avançar para o primeiro elemento (presumivelmente <offer>)

        for event, elem in context:
            if event == 'end' and elem.tag == 'product':
                product_id = elem.get('id', 'N/A') # Corrigido: Obter ID primeiro
                total_produtos_processados += 1    # Corrigido: Incrementar contador

                desc_container = elem.find('description')
                if desc_container is not None:
                    # Analisar <long_desc>
                    long_desc_elem = desc_container.find('long_desc')
                    if long_desc_elem is not None and long_desc_elem.text and long_desc_elem.text.strip():
                        produtos_com_long_desc += 1
                        if len(exemplos_long_desc) < max_exemplos:
                            exemplos_long_desc.append(f"ID {product_id}: \"{long_desc_elem.text.strip()}\"")
                    
                    # Analisar <description> interna
                    inner_desc_elem = desc_container.find('description')
                    if inner_desc_elem is not None and inner_desc_elem.text and inner_desc_elem.text.strip():
                        produtos_com_inner_desc += 1
                        if len(exemplos_inner_desc) < max_exemplos:
                            exemplos_inner_desc.append(f"ID {product_id}: \"{inner_desc_elem.text.strip()}\"")
                
                elem.clear() 
                # if root is not None: root.clear() # Cuidado com a limpeza do root aqui

        print(f"\n--- Análise de Conteúdo Textual Concluída ---")
        print(f"Total de produtos processados: {total_produtos_processados}")

        print(f"\nAnálise de <long_desc>:")
        print(f"  Produtos com <long_desc> preenchida: {produtos_com_long_desc}")
        if exemplos_long_desc:
            print(f"  Primeiros {len(exemplos_long_desc)} exemplos de <long_desc>:")
            for ex in exemplos_long_desc:
                print(f"    - {ex}")
        elif produtos_com_long_desc > 0:
             print(f"  (Existem {produtos_com_long_desc} <long_desc> preenchidas, mas não foram capturados exemplos - verificar lógica do script)")
        else:
            print(f"  Nenhum produto encontrado com <long_desc> preenchida.")

        print(f"\nAnálise de <description> interna (product/description/description):")
        print(f"  Produtos com <description> interna preenchida: {produtos_com_inner_desc}")
        if exemplos_inner_desc:
            print(f"  Primeiros {len(exemplos_inner_desc)} exemplos de <description> interna:")
            for ex in exemplos_inner_desc:
                print(f"    - {ex}")
        elif produtos_com_inner_desc > 0:
            print(f"  (Existem {produtos_com_inner_desc} <description> internas preenchidas, mas não foram capturados exemplos - verificar lógica do script)")
        else:
            print(f"  Nenhum produto encontrado com <description> interna preenchida.")

    except ET.ParseError as e:
        print(f"Erro ao fazer parse do XML: {e}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

if __name__ == "__main__":
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    caminho_xml_relativo = "data/xml/geko_full_en_utf8.xml"
    caminho_xml_absoluto_para_script = os.path.join(base_path_projeto, caminho_xml_relativo)
    
    analisar_conteudo_descritivo_completo(caminho_xml_absoluto_para_script, max_exemplos=30)
