import os
import psycopg2
import logging
from dotenv import load_dotenv
import sys

# Configurar logging básico
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s')

# Adiciona o diretório raiz do projeto ao sys.path para encontrar o .env
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

# Carrega as variáveis de ambiente do ficheiro .env na raiz do projeto
load_dotenv(os.path.join(project_root, '.env'))

def get_db_connection(dotenv_path=None):
    """Estabelece e retorna uma conexão com o banco de dados PostgreSQL.
    
    Procura por um arquivo .env subindo dois níveis a partir da localização deste script,
    que é o esperado se este script está em scripts/data_import/database/ e .env na raiz do projeto.
    """
    if dotenv_path is None:
        # Caminho para a raiz do projeto (assumindo que db_connector.py está em scripts/data_import/database/)
        # __file__ -> .../scripts/data_import/database/db_connector.py
        # os.path.dirname(__file__) -> .../scripts/data_import/database
        # os.path.join(..., '..') -> .../scripts/data_import
        # os.path.join(..., '..', '..') -> .../scripts
        # os.path.join(..., '..', '..', '..') -> .../ (raiz do projeto)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        dotenv_path = os.path.join(base_dir, '.env')

    logging.info(f"Tentando carregar variáveis de ambiente de: {dotenv_path}")
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path=dotenv_path)
        logging.info(".env carregado com sucesso.")
    else:
        logging.warning(f"Arquivo .env não encontrado em {dotenv_path}. As variáveis de ambiente devem estar definidas globalmente.")

    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        logging.error("DATABASE_URL não está definida no ambiente.")
        raise ValueError("DATABASE_URL não está definida no ambiente.")

    try:
        conn = psycopg2.connect(database_url)
        logging.info("Conexão com o banco de dados estabelecida com sucesso.")
        return conn
    except psycopg2.Error as e:
        logging.error(f"Erro ao conectar ao banco de dados PostgreSQL: {e}")
        raise

if __name__ == '__main__':
    logging.info("Testando a conexão com o banco de dados...")
    connection = None
    try:
        # Para testar diretamente, o .env deve estar dois níveis acima de database/
        # ou seja, na raiz do projeto se a estrutura é projeto_raiz/scripts/data_import/database/
        connection = get_db_connection()
        if connection:
            cur = connection.cursor()
            cur.execute("SELECT version();")
            db_version = cur.fetchone()
            logging.info(f"Versão do PostgreSQL: {db_version}")
            cur.close()
    except Exception as e:
        logging.error(f"Falha no teste de conexão com o banco de dados: {e}")
    finally:
        if connection:
            connection.close()
            logging.info("Conexão de teste com o banco de dados fechada.")
