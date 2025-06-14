import os
import sys

# Adiciona o diretório raiz do projeto ao sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

from scripts.data_import.parsers.parse_xml import parse_xml, XML_FILE_PATH
from scripts.data_import.database.db_connector import get_db_connection

def extract_categories_and_relations(xml_path):
    """
    Analisa o XML para extrair categorias únicas e as relações produto-categoria.

    Retorna:
        tuple: Uma tupla contendo (lista de categorias únicas, lista de relações).
    """
    print("A extrair categorias e relações do ficheiro XML...")
    categories = {}
    relations = []
    # Itera sobre os produtos para extrair dados de categoria e EAN
    for product_element in parse_xml(xml_path, 'product'):
        ean = None
        # 1. Tenta obter o EAN do atributo 'EAN' da tag <product>
        ean_from_attr = product_element.get('EAN')
        if ean_from_attr:
            ean = ean_from_attr.strip()
        
        # 2. Se não encontrar no atributo, procura a tag <ean> em qualquer nível
        if not ean:
            ean_element = product_element.find('.//ean')
            if ean_element is not None and ean_element.text:
                ean = ean_element.text.strip()

        category_element = product_element.find('category')
        if category_element is not None:
            cat_id = category_element.get('id')
            # Adiciona ao dicionário para garantir unicidade de categorias
            if cat_id and cat_id not in categories:
                categories[cat_id] = {
                    'id': cat_id,
                    'name': category_element.text,
                    'path': category_element.get('path')
                }
            
            # Adiciona a relação se o EAN e o ID da categoria foram encontrados
            if ean and cat_id:
                relations.append((ean, cat_id))

    unique_categories = list(categories.values())
    print(f"Foram encontradas {len(unique_categories)} categorias únicas e {len(relations)} relações produto-categoria.")
    return unique_categories, relations

def insert_categories(db_conn, categories):
    """
    Insere uma lista de categorias na base de dados.
    Limpa a tabela 'categories' e tabelas relacionadas (via CASCADE) antes da inserção.
    """
    if not categories:
        print("Nenhuma categoria para inserir.")
        return

    print(f"A inserir {len(categories)} categorias na base de dados...")
    with db_conn.cursor() as cursor:
        try:
            print("A limpar as tabelas 'categories' e 'product_categories' (via CASCADE)...")
            cursor.execute("TRUNCATE TABLE categories RESTART IDENTITY CASCADE;")

            insert_query = "INSERT INTO categories (categoryid, name, path) VALUES (%s, %s, %s)"
            data_to_insert = [(cat['id'], cat['name'], cat['path']) for cat in categories]
            
            from psycopg2.extras import execute_batch
            execute_batch(cursor, insert_query, data_to_insert)
            
            db_conn.commit()
            print(f"{len(data_to_insert)} categorias enviadas para inserção em lote.")
        except Exception as e:
            print(f"Erro ao inserir categorias: {e}", file=sys.stderr)
            db_conn.rollback()
            raise e

def insert_product_categories(db_conn, relations):
    """
    Insere as relações produto-categoria na tabela de junção.
    """
    if not relations:
        print("Nenhuma relação produto-categoria para inserir.")
        return

    print(f"A inserir {len(relations)} relações em 'product_categories'...")
    with db_conn.cursor() as cursor:
        try:
            insert_query = "INSERT INTO product_categories (product_ean, category_id) VALUES (%s, %s) ON CONFLICT DO NOTHING"
            
            from psycopg2.extras import execute_batch
            execute_batch(cursor, insert_query, relations)
            
            db_conn.commit()
            print(f"{len(relations)} relações enviadas para inserção em lote.")
        except Exception as e:
            print(f"Erro ao inserir relações produto-categoria: {e}", file=sys.stderr)
            db_conn.rollback()
            raise e

if __name__ == '__main__':
    # Bloco de execução principal
    unique_categories, relations = extract_categories_and_relations(XML_FILE_PATH)
    
    if unique_categories:
        connection = get_db_connection()
        if connection:
            try:
                # Insere as categorias únicas. O TRUNCATE com CASCADE limpa também a product_categories.
                insert_categories(connection, unique_categories)
                
                # Insere as relações na tabela de junção agora vazia.
                if relations:
                    insert_product_categories(connection, relations)

            except Exception as e:
                print(f"Ocorreu um erro durante o processo de importação: {e}", file=sys.stderr)
            finally:
                connection.close()
                print("\nConexão com a base de dados fechada.")
    print("Processo de importação de categorias e suas relações concluído.")
