import os
import sys
from decimal import Decimal, InvalidOperation

# Adiciona o diretório raiz do projeto ao sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

from scripts.data_import.parsers.parse_xml import parse_xml, XML_FILE_PATH
from scripts.data_import.database.db_connector import get_db_connection

def ensure_base_price_list(db_conn):
    """
    Verifica se a lista de preços 'Preço Base' existe e, se não, cria-a.
    Retorna o ID da lista de preços 'Preço Base'.
    """
    print("A garantir a existência da lista de preços 'Preço Base'...")
    with db_conn.cursor() as cursor:
        cursor.execute("SELECT price_list_id FROM price_lists WHERE name = 'Preço Base';")
        result = cursor.fetchone()
        if result:
            price_list_id = result[0]
            print(f"Lista 'Preço Base' já existe com o ID: {price_list_id}")
            return price_list_id
        else:
            print("A criar a lista de preços 'Preço Base'...")
            cursor.execute("INSERT INTO price_lists (name, description) VALUES ('Preço Base', 'Lista de preços de retalho padrão.') RETURNING price_list_id;")
            price_list_id = cursor.fetchone()[0]
            db_conn.commit()
            print(f"Lista 'Preço Base' criada com o ID: {price_list_id}")
            return price_list_id

def extract_prices(xml_path):
    """
    Analisa o XML e extrai uma lista de tuplas (EAN, preço).
    """
    print("A extrair preços do ficheiro XML...")
    prices = []
    for product_element in parse_xml(xml_path, 'product'):
        ean = product_element.get('EAN')
        if not ean:
            ean_element = product_element.find('.//ean')
            if ean_element is not None and ean_element.text:
                ean = ean_element.text.strip()

        price_element = product_element.find('price')
        if ean and price_element is not None:
            price_str = price_element.get('gross')
            try:
                price = Decimal(price_str)
                prices.append((ean, price))
            except (InvalidOperation, TypeError):
                print(f"Aviso: Preço inválido ou ausente para o EAN {ean}. Preço encontrado: '{price_str}'. A ignorar.", file=sys.stderr)
    
    print(f"Foram encontrados {len(prices)} preços válidos.")
    return prices

def insert_prices(db_conn, prices, price_list_id):
    """
    Insere os preços na base de dados, limpando primeiro as entradas antigas para a lista de preços base.
    """
    if not prices:
        print("Nenhum preço para inserir.")
        return

    print(f"A inserir {len(prices)} preços na base de dados...")
    with db_conn.cursor() as cursor:
        try:
            print(f"A limpar preços antigos da lista de preços ID {price_list_id}...")
            cursor.execute("DELETE FROM prices WHERE price_list_id = %s;", (price_list_id,))
            
            insert_query = "INSERT INTO prices (product_ean, price_list_id, price) VALUES (%s, %s, %s) ON CONFLICT (product_ean, price_list_id) DO UPDATE SET price = EXCLUDED.price;"
            data_to_insert = [(p[0], price_list_id, p[1]) for p in prices]
            
            from psycopg2.extras import execute_batch
            execute_batch(cursor, insert_query, data_to_insert)
            
            db_conn.commit()
            print(f"{len(data_to_insert)} preços enviados para inserção/atualização em lote.")
        except Exception as e:
            print(f"Erro ao inserir preços: {e}", file=sys.stderr)
            db_conn.rollback()
            raise e

if __name__ == '__main__':
    connection = get_db_connection()
    if connection:
        try:
            base_price_list_id = ensure_base_price_list(connection)
            price_data = extract_prices(XML_FILE_PATH)
            if price_data:
                insert_prices(connection, price_data, base_price_list_id)
        except Exception as e:
            print(f"Ocorreu um erro geral durante a importação de preços: {e}", file=sys.stderr)
        finally:
            connection.close()
            print("\nConexão com a base de dados fechada.")
    print("Processo de importação de preços concluído.")
