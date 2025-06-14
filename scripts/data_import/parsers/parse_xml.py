import os
from lxml import etree
import sys

# Adiciona o diretório raiz do projeto ao sys.path para encontrar o .env e outros módulos
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

# Caminho para o ficheiro XML
XML_FILE_PATH = os.path.join(project_root, 'data', 'xml', 'geko_full_en_utf8.xml')

def parse_xml(file_path, tag_to_find):
    """
    Analisa um ficheiro XML de forma eficiente usando iterparse e retorna um gerador 
    para os elementos com a tag especificada.

    Args:
        file_path (str): O caminho para o ficheiro XML.
        tag_to_find (str): A tag dos elementos a serem extraídos (ex: 'product').

    Yields:
        lxml.etree._Element: Um elemento do XML correspondente à tag.
    """
    if not os.path.exists(file_path):
        print(f"Erro: O ficheiro XML não foi encontrado em '{file_path}'", file=sys.stderr)
        sys.exit(1)

    # Usamos 'iterparse' para eficiência de memória. 'context' mantém o rasto dos eventos.
    context = etree.iterparse(file_path, events=('end',), tag=tag_to_find)

    for event, elem in context:
        yield elem
        # Limpa o elemento e os seus irmãos anteriores da memória para manter o uso de memória baixo.
        elem.clear()
        while elem.getprevious() is not None:
            del elem.getparent()[0]

if __name__ == '__main__':
    # Bloco de teste para verificar o parser
    print(f"A iniciar o teste de parsing do ficheiro: {XML_FILE_PATH}")
    print(f"A procurar pela tag: 'product'")

    product_count = 0
    # Itera sobre os produtos usando o nosso parser
    for product_element in parse_xml(XML_FILE_PATH, 'product'):
        product_count += 1
        # Para demonstração, vamos imprimir o EAN do primeiro produto
        if product_count == 1:
            ean = product_element.get('EAN') # Corrigido para 'EAN' em maiúsculas
            print(f"EAN do primeiro produto encontrado: {ean}")

    print(f"\nTeste concluído.")
    print(f"Total de produtos contados: {product_count}")

    if product_count > 0:
        print("Parser a funcionar corretamente!")
    else:
        print("Nenhum produto encontrado. Verificar o ficheiro XML ou a tag procurada.")
