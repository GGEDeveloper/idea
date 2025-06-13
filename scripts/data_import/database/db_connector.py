import os
import psycopg2
from dotenv import load_dotenv
import sys

# Adiciona o diretório raiz do projeto ao sys.path para encontrar o .env
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.append(project_root)

# Carrega as variáveis de ambiente do ficheiro .env na raiz do projeto
load_dotenv(os.path.join(project_root, '.env'))

def get_db_connection():
    """
    Estabelece e retorna uma conexão com a base de dados PostgreSQL.
    Utiliza a variável de ambiente DATABASE_URL_UNPOOLED.
    """
    conn = None
    try:
        db_url = os.getenv('DATABASE_URL_UNPOOLED')
        if not db_url:
            raise ValueError("A variável de ambiente DATABASE_URL_UNPOOLED não está definida.")
        
        print("A conectar à base de dados...")
        conn = psycopg2.connect(db_url)
        print("Conexão bem-sucedida!")
        return conn
    except (psycopg2.Error, ValueError) as e:
        print(f"Erro ao conectar à base de dados: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    # Bloco de teste para verificar a conexão
    connection = get_db_connection()
    if connection:
        print("Teste de conexão: SUCESSO.")
        connection.close()
        print("Conexão de teste fechada.")
    else:
        print("Teste de conexão: FALHOU.")
