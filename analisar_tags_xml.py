import xml.etree.ElementTree as ET
import os

def extrair_tags_unicas(caminho_ficheiro_xml):
    """
    Extrai todas as tags XML únicas de um ficheiro XML.
    Utiliza iterparse para lidar com ficheiros grandes de forma eficiente em termos de memória.
    """
    tags = set()
    try:
        # Garante que estamos a usar um caminho absoluto para o ficheiro XML
        caminho_absoluto_xml = os.path.abspath(caminho_ficheiro_xml)
            
        print(f"A processar o ficheiro XML em: {caminho_absoluto_xml}")
        
        if not os.path.exists(caminho_absoluto_xml):
            print(f"Erro: O ficheiro XML não foi encontrado em {caminho_absoluto_xml}")
            return None

        # Usar iterparse para processar o XML de forma incremental
        for evento, elem in ET.iterparse(caminho_absoluto_xml, events=('start',)):
            tags.add(elem.tag)
            # Limpar o elemento da memória após o processamento para poupar recursos
            elem.clear()
            # Opcional: se a árvore XML for muito profunda, pode ser necessário limpar os ancestrais também.
            # while elem.getprevious() is not None:
            #     del elem.getparent()[0]

        return sorted(list(tags))
        
    except ET.ParseError as e:
        print(f"Erro ao fazer parse do XML: {e}")
        return None
    except FileNotFoundError:
        # Esta exceção é mais para o caso de o caminho absoluto não ser resolvido corretamente
        # ou se o ficheiro for removido entre a verificação e a abertura.
        print(f"Erro: Ficheiro não encontrado em {caminho_ficheiro_xml}")
        return None
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
        return None

if __name__ == "__main__":
    # O workspace do USER é /home/pixiewsl/CascadeProjects/idea
    # O ficheiro XML está em data/xml/geko_full_en_utf8.xml dentro desse workspace.
    
    # Determinar o caminho base do projeto. Assume-se que o script está na raiz do projeto.
    # Se o script for guardado noutro local, este caminho pode precisar de ajuste
    # ou ser passado como argumento.
    base_path_projeto = "/home/pixiewsl/CascadeProjects/idea"
    
    caminho_xml_relativo = "data/xml/geko_full_en_utf8.xml"
    caminho_xml_absoluto_para_script = os.path.join(base_path_projeto, caminho_xml_relativo)

    print(f"Script iniciado. Tentando aceder ao ficheiro XML: {caminho_xml_absoluto_para_script}")

    tags_unicas = extrair_tags_unicas(caminho_xml_absoluto_para_script)
    
    if tags_unicas:
        print("\n--- Tags XML Únicas Encontradas ---")
        for tag in tags_unicas:
            print(tag)
        print(f"\nTotal de tags únicas: {len(tags_unicas)}")
    else:
        print("\nNão foram encontradas tags únicas ou ocorreu um erro ao processar o ficheiro.")
