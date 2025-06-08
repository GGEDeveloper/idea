import xml.etree.ElementTree as ET
import os

def analisar_xml_completo(caminho_ficheiro_xml):
    if not os.path.exists(caminho_ficheiro_xml):
        print(f"Erro: O ficheiro XML não foi encontrado em {caminho_ficheiro_xml}")
        return

    print(f"A iniciar análise completa do ficheiro XML em: {caminho_ficheiro_xml}\n")

    todas_tags_dentro_produtos = set()
    todos_atributos_dentro_produtos = set()
    tags_irma_de_product = set()
    root_tag_name = None
    num_produtos_processados = 0

    try:
        context = ET.iterparse(caminho_ficheiro_xml, events=('start', 'end'))
        
        # Obter o nome da tag raiz do primeiro evento 'start'
        event, first_element = next(context)
        if event == 'start':
            root_tag_name = first_element.tag
        
        # Reiniciar o iterador para o parse principal
        context = ET.iterparse(caminho_ficheiro_xml, events=('start', 'end'))
        
        element_stack = [] # Para rastrear a profundidade e o pai (de forma aproximada)

        for event, elem in context:
            if event == 'start':
                element_stack.append(elem.tag)
            elif event == 'end':
                current_tag_popped = element_stack.pop() if element_stack else None
                
                # Assegurar que o que foi retirado da pilha corresponde ao elemento atual
                if not current_tag_popped == elem.tag:
                    # Esta situação pode ocorrer se o XML estiver mal formado ou a lógica da pilha precisar de ajuste
                    # Para um XML bem formado, isto não deve acontecer com esta lógica simples.
                    # print(f"Aviso: Desfasamento na pilha de elementos. Esperado {elem.tag}, removido {current_tag_popped}")
                    pass # Continuar mesmo assim, mas pode indicar problemas na deteção de irmãos

                if elem.tag == 'product':
                    num_produtos_processados += 1
                    collect_tags_and_attributes_recursive(elem, todas_tags_dentro_produtos, todos_atributos_dentro_produtos)
                    elem.clear() 
                
                elif root_tag_name and elem.tag != root_tag_name and not element_stack:
                    # Se a pilha está vazia e não é o root, 'elem' era um filho direto do root.
                    if elem.tag != 'product':
                         tags_irma_de_product.add(elem.tag)
                    elem.clear() # Limpar também estes elementos irmãos
                
                elif elem.tag == root_tag_name and event == 'end':
                    # O elemento raiz terminou, não fazer nada especial de limpeza aqui
                    pass


        print(f"\n--- Análise Concluída ---")
        print(f"Elemento raiz identificado: <{root_tag_name}>")
        print(f"Total de elementos <product> processados: {num_produtos_processados}")
        
        print(f"\nTags únicas encontradas DENTRO de todos os elementos <product> (incluindo 'product' e sub-tags):")
        for tag in sorted(list(todas_tags_dentro_produtos)):
            print(f"- {tag}")
        print(f"Total de tags únicas dentro dos produtos: {len(todas_tags_dentro_produtos)}")

        print(f"\nNomes de atributos únicos encontrados NAS TAGS DENTRO dos elementos <product>:")
        for attr in sorted(list(todos_atributos_dentro_produtos)):
            print(f"- {attr}")
        print(f"Total de atributos únicos dentro dos produtos: {len(todos_atributos_dentro_produtos)}")

        # Lista de tags do primeiro script para referência
        tags_do_primeiro_script = ['card', 'category', 'category_idosell', 'delivery', 'description', 'image', 'images', 'large', 'long_desc', 'name', 'offer', 'price', 'producer', 'product', 'products', 'short_desc', 'size', 'sizes', 'srp', 'stock', 'unit']
        
        if 'offer' in todas_tags_dentro_produtos:
            print("\nA tag <offer> FOI encontrada dentro de pelo menos um elemento <product>.")
        elif 'offer' in tags_irma_de_product:
            print(f"\nA tag <offer> NÃO FOI encontrada dentro de elementos <product>, mas FOI encontrada como um elemento irmão de <product> (filho direto de <{root_tag_name}>).")
        elif 'offer' in tags_do_primeiro_script:
            print("\nA tag <offer> NÃO FOI encontrada dentro de elementos <product> nem como um irmão direto de <product> nesta análise detalhada.")
            print("  No entanto, o script 'analisar_tags_xml.py' (que lista todas as tags no ficheiro) detetou 'offer'.")
            print("  Isto pode indicar uma estrutura mais complexa para <offer> ou que ela aparece num contexto não coberto aqui.")
        else:
            print("\nA tag <offer> não foi encontrada nesta análise nem na análise global de tags do primeiro script.")


        if tags_irma_de_product:
            print(f"\nOutras tags encontradas como filhas diretas de <{root_tag_name}> (além de <product>):")
            for tag in sorted(list(tags_irma_de_product)):
                print(f"- {tag}")
        elif num_produtos_processados > 0 : # Só faz sentido se houver produtos e o root não for um produto
            if root_tag_name != 'product':
                 print(f"\nNenhuma outra tag (além de <product>) foi identificada como filha direta de <{root_tag_name}> nesta análise.")

    except ET.ParseError as e:
        print(f"Erro ao fazer parse do XML: {e}")
    except FileNotFoundError:
        print(f"Erro: Ficheiro não encontrado em {caminho_ficheiro_xml}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")

def collect_tags_and_attributes_recursive(element, tags_set, attributes_set):
    tags_set.add(element.tag)
    for attr_name in element.attrib.keys():
        attributes_set.add(attr_name)
    for child in element:
        collect_tags_and_attributes_recursive(child, tags_set, attributes_set)

if __name__ == "__main__":
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    caminho_xml_relativo = "data/xml/geko_full_en_utf8.xml"
    caminho_xml_absoluto_para_script = os.path.join(base_path_projeto, caminho_xml_relativo)
    analisar_xml_completo(caminho_xml_absoluto_para_script)
