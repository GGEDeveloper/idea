import os
import sys
import psycopg2

# Adiciona o diretório raiz do projeto ao sys.path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

from scripts.data_import.parsers.parse_xml import parse_xml, XML_FILE_PATH
from scripts.data_import.database.db_connector import get_db_connection
from psycopg2.extras import execute_batch
import html

def sanitize_string(value):
    """Remove null bytes from a string, as they are not allowed by PostgreSQL."""
    if isinstance(value, str):
        # The null byte is invalid in PostgreSQL text fields.
        return value.replace(chr(0), '')
    return value

def extract_products(xml_path):
    """
    Analisa o XML e extrai uma lista de todos os produtos, com tratamento de erros, dados em falta e verificação de duplicados.
    """
    print("A extrair produtos do ficheiro XML...")
    products = []
    processed_ids = set()
    processed_eans = set()
    processed_count = 0
    
    for elem in parse_xml(xml_path, 'product'):
        processed_count += 1
        if processed_count % 1000 == 0:
            print(f"Processados {processed_count} de 8184 produtos...")

        product_id = elem.get('id')
        if product_id in processed_ids:
            print(f"Aviso: ID de produto duplicado '{product_id}' encontrado. A ignorar esta ocorrência.", file=sys.stderr)
            continue
        processed_ids.add(product_id)

        ean = elem.get('EAN')
        if not ean:
            print(f"Aviso: Produto com ID '{product_id}' não tem EAN e será ignorado.", file=sys.stderr)
            continue

        if ean in processed_eans:
            print(f"Aviso: EAN duplicado '{ean}' (Produto ID: {product_id}) encontrado. A ignorar este produto.", file=sys.stderr)
            continue
        processed_eans.add(ean)

        card_element = elem.find('card')
        name = card_element.text.strip() if card_element is not None and card_element.text else 'Nome Indisponível'

        short_desc_elem = elem.find('short_desc')
        long_desc_elem = elem.find('long_desc')
        
        # Extrai o texto e depois "desescapa" as entidades HTML (ex: &lt;p&gt; -> <p>, &#13; -> \r)
        short_desc_text = short_desc_elem.text.strip() if short_desc_elem is not None and short_desc_elem.text else ''
        long_desc_text = long_desc_elem.text.strip() if long_desc_elem is not None and long_desc_elem.text else ''
        
        short_description = html.unescape(short_desc_text)
        long_description = html.unescape(long_desc_text)

        producer_elem = elem.find('producer')
        brand = producer_elem.get('name').strip() if producer_elem is not None and producer_elem.get('name') else 'Marca Indisponível'

        products.append({
            'ean': sanitize_string(ean),
            'productid': sanitize_string(product_id),
            'name': sanitize_string(name),
            'shortdescription': sanitize_string(short_description),
            'longdescription': sanitize_string(long_description),
            'brand': sanitize_string(brand),
            'active': elem.get('active') == '1'
        })

    print(f"Extração concluída. Foram encontrados {len(products)} produtos válidos.")
    return products

def get_db_connection():
    """Establishes a connection to the PostgreSQL database with a timeout."""
    print("A conectar à base de dados...")
    try:
        # Usar a URL de conexão direta (sem pooler) e adicionar um timeout de 15 segundos
        conn = psycopg2.connect(
            os.getenv("DATABASE_URL_UNPOOLED"),
            connect_timeout=15
        )
        print("Conexão bem-sucedida!")
        return conn
    except psycopg2.OperationalError as e:
        print(f"Erro Crítico: Não foi possível conectar à base de dados. Verifique a connection string e a rede.")
        print(f"Detalhe do erro: {e}")
        return None

def insert_products(db_conn, products, batch_size=1000):
    """
    Insere uma lista de produtos na base de dados em lotes (chunks) para maior robustez.
    """
    if not products:
        print("Nenhum produto para inserir.")
        return

    print(f"A preparar a inserção de {len(products)} produtos na base de dados...")
    with db_conn.cursor() as cursor:
        print("A limpar a tabela 'products' (e tabelas dependentes via CASCADE)...")
        cursor.execute("TRUNCATE TABLE products RESTART IDENTITY CASCADE;")
        db_conn.commit()

        insert_query = """
        INSERT INTO products (ean, productid, name, shortdescription, longdescription, brand, active)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        data_to_insert = [(p['ean'], p['productid'], p['name'], p['shortdescription'], p['longdescription'], p['brand'], p['active']) for p in products]
        
        total_inserted = 0
        for i in range(0, len(data_to_insert), batch_size):
            batch = data_to_insert[i:i + batch_size]
            try:
                print(f"A inserir lote de {len(batch)} produtos (iniciando no índice {i})...")
                execute_batch(cursor, insert_query, batch)
                db_conn.commit()
                total_inserted += len(batch)
                print(f"Lote inserido com sucesso. Total inserido até agora: {total_inserted}")
            except Exception as e:
                print(f"ERRO ao inserir o lote que começa no índice {i}: {e}", file=sys.stderr)
                db_conn.rollback()
                print("A importação de produtos foi interrompida devido a um erro.", file=sys.stderr)
                return

    print(f"\nInserção concluída. Total de {total_inserted} produtos inseridos na base de dados.")

if __name__ == '__main__':
    # --- Processo de Importação Padrão ---
    print("A iniciar o processo de importação de produtos...")
    
    # 1. Extrair todos os produtos válidos do ficheiro XML
    products_to_import = extract_products(XML_FILE_PATH)
    
    # 2. Se existirem produtos, obter conexão e inseri-los
    if products_to_import:
        db_connection = get_db_connection()
        if db_connection:
            try:
                insert_products(db_connection, products_to_import)
                print("\nProcesso de importação concluído com sucesso.")
            except Exception as e:
                print(f"\nOcorreu um erro inesperado durante a importação: {e}", file=sys.stderr)
            finally:
                db_connection.close()
                print("Conexão com a base de dados fechada.")
        else:
            print("A importação falhou porque a conexão com a base de dados não pôde ser estabelecida.", file=sys.stderr)
    else:
        print("Nenhum produto válido foi extraído. A importação não será executada.", file=sys.stderr)
