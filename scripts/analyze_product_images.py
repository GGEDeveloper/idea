import os
import psycopg2
from dotenv import load_dotenv

# Carregar variáveis de ambiente do ficheiro .env
load_dotenv()

# Obter a URL da base de dados
DATABASE_URL = os.getenv("DATABASE_URL_UNPOOLED")

if not DATABASE_URL:
    print("Erro: DATABASE_URL_UNPOOLED não encontrada no ficheiro .env")
    exit(1)

def analyze_images():
    conn = None
    try:
        # Conectar à base de dados
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        print("--- Executando Consulta 1: Produtos Sem Imagem Associada ---")
        query1 = """
        SELECT p.id_products, p.name, p.ean
        FROM products p
        LEFT JOIN product_images pi ON p.id_products = pi.product_id_products
        WHERE pi.id_product_images IS NULL
        LIMIT 20;
        """
        cur.execute(query1)
        results1 = cur.fetchall()
        if results1:
            print("Produtos sem imagem:")
            for row in results1:
                print(f"  ID: {row[0]}, Nome: {row[1]}, EAN: {row[2]}")
        else:
            print("Nenhum produto encontrado sem imagem associada (nos primeiros 20).")

        print("\n--- Executando Consulta 2: Imagens com URLs Vazios/Nulos ---")
        query2 = """
        SELECT pi.product_id_products, p.name AS product_name, pi.url, pi.is_main
        FROM product_images pi
        JOIN products p ON pi.product_id_products = p.id_products
        WHERE pi.url IS NULL OR pi.url = ''
        LIMIT 20;
        """
        cur.execute(query2)
        results2 = cur.fetchall()
        if results2:
            print("Imagens com URLs vazios/nulos:")
            for row in results2:
                print(f"  Produto ID: {row[0]}, Nome: {row[1]}, URL: '{row[2]}', É Principal: {row[3]}")
        else:
            print("Nenhuma imagem encontrada com URL vazio/nulo (nos primeiros 20).")

        cur.close()

    except Exception as e:
        print(f"Ocorreu um erro: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    analyze_images()