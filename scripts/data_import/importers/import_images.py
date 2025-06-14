import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

from scripts.data_import.parsers.parse_xml import parse_xml, XML_FILE_PATH
from scripts.data_import.database.db_connector import get_db_connection

def extract_images(xml_path):
    """
    Analisa o XML e extrai os dados das imagens dos produtos.
    Retorna uma lista de dicionários, cada um representando uma imagem.
    """
    print("A extrair imagens do ficheiro XML...")
    images_data = []
    for product_element in parse_xml(xml_path, 'product'):
        ean = product_element.get('EAN')
        if not ean:
            ean_element = product_element.find('.//ean')
            if ean_element is not None and ean_element.text:
                ean = ean_element.text.strip()

        if not ean:
            continue

        product_name_element = product_element.find('name')
        alt_text = product_name_element.text.strip() if product_name_element is not None and product_name_element.text else 'Imagem do produto'

        # O caminho correto é .//images/large
        large_images_section = product_element.find('.//images/large')
        if large_images_section is not None:
            is_first = True
            for image_element in large_images_section.findall('image'):
                url = image_element.get('url')
                if url:
                    # Assume a primeira imagem é a principal, pois o atributo 'main' não parece estar presente.
                    is_primary = is_first
                    images_data.append({
                        'ean': ean,
                        'url': url,
                        'alt': alt_text,
                        'is_primary': is_primary
                    })
                    is_first = False
    
    print(f"Foram encontradas {len(images_data)} imagens.")
    return images_data

def insert_images(db_conn, images):
    """
    Insere os dados das imagens na base de dados, limpando a tabela primeiro.
    """
    if not images:
        print("Nenhuma imagem para inserir.")
        return

    print(f"A inserir {len(images)} imagens na base de dados...")
    with db_conn.cursor() as cursor:
        try:
            print("A limpar a tabela 'product_images'...")
            cursor.execute("TRUNCATE TABLE product_images RESTART IDENTITY CASCADE;")
            
            insert_query = "INSERT INTO product_images (ean, url, alt, is_primary) VALUES (%s, %s, %s, %s);"
            data_to_insert = [(img['ean'], img['url'], img['alt'], img['is_primary']) for img in images]
            
            from psycopg2.extras import execute_batch
            execute_batch(cursor, insert_query, data_to_insert)
            
            db_conn.commit()
            print(f"{len(data_to_insert)} imagens enviadas para inserção em lote.")
        except Exception as e:
            print(f"Erro ao inserir imagens: {e}", file=sys.stderr)
            db_conn.rollback()
            raise e

if __name__ == '__main__':
    connection = get_db_connection()
    if connection:
        try:
            image_data = extract_images(XML_FILE_PATH)
            if image_data:
                insert_images(connection, image_data)
        except Exception as e:
            print(f"Ocorreu um erro geral durante a importação de imagens: {e}", file=sys.stderr)
        finally:
            connection.close()
            print("\nConexão com a base de dados fechada.")
    print("Processo de importação de imagens concluído.")
