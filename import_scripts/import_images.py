import logging
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import psycopg2
from import_scripts.parse_xml import iterparse_products

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("import_images")

DB_URL = os.getenv("DATABASE_URL") or "postgres://neondb_owner:npg_aMgk1osmjh7X@ep-shiny-bush-abjh1ibc-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
XML_PATH = "data/xml/geko_full_en_utf8.xml"

def extract_images(xml_path):
    """Extrai imagens dos produtos do XML (qualquer profundidade sob <images>) e faz diagnóstico detalhado."""
    images = []
    produtos_com_imagem = 0
    exemplos = []
    for product in iterparse_products(xml_path):
        ean = product.get("EAN") or product.get("ean")
        images_node = product.find("images")
        if images_node is not None:
            imgs = images_node.findall('.//image')  # Busca imagens em qualquer profundidade
            if imgs:
                produtos_com_imagem += 1
                if len(exemplos) < 5:
                    exemplos.append({
                        "ean": ean,
                        "qtd": len(imgs),
                        "urls": [img.get("url") for img in imgs]
                    })
            for idx, image in enumerate(imgs, 1):
                images.append({
                    "ean": ean,
                    "url": image.get("url"),  # Usar url direto
                    "is_main": image.get("type") == "main" or idx == 1,
                    "sort_order": idx
                })
    print(f"Produtos com imagens: {produtos_com_imagem}")
    print(f"Total de imagens extraídas: {len(images)}")
    print("Exemplos de produtos com imagens:")
    for ex in exemplos:
        print(f"EAN: {ex['ean']}, Qtd: {ex['qtd']}, URLs: {ex['urls']}")
    if produtos_com_imagem == 0:
        print("Nenhum produto com imagens encontrado no XML. Dump dos primeiros campos de produto:")
        from import_scripts.parse_xml import iterparse_products as ip
        for i, product in enumerate(ip(xml_path)):
            if i >= 5:
                break
            print(product.attrib)
    return images

def get_product_id_from_ean(ean, db_url=None):
    if not ean:
        return None
    try:
        conn = psycopg2.connect(db_url or DB_URL)
        cur = conn.cursor()
        cur.execute("SELECT id_products FROM products WHERE ean = %s LIMIT 1", (ean,))
        row = cur.fetchone()
        cur.close()
        conn.close()
        return row[0] if row else None
    except Exception as e:
        logger.error(f"Erro ao mapear EAN para id_products: {e}")
        raise

def import_images(xml_path, db_url):
    print(f"DATABASE_URL usado: {db_url}")
    imgs = extract_images(xml_path)
    print(f"Total de imagens extraídas: {len(imgs)}")
    if not imgs:
        print("Nenhuma imagem encontrada para importar.")
        return

    # 1. Mapeamento EAN → id_products
    print("\n--- MAPEAMENTO EAN → id_products ---")
    ean_to_id = {}
    not_found_eans = set()
    erro_lookup = []
    for idx, img in enumerate(imgs, 1):
        ean = str(img["ean"]).strip() if img["ean"] else None
        if not ean:
            msg = f"[{idx}] Imagem sem EAN: url={img['url']}"
            print(msg)
            erro_lookup.append(msg)
            continue
        try:
            product_id = get_product_id_from_ean(ean, db_url)
            if product_id:
                ean_to_id[ean] = product_id
            else:
                msg = f"[{idx}] EAN não encontrado na base: {ean} (url={img['url']})"
                print(msg)
                not_found_eans.add(ean)
                erro_lookup.append(msg)
        except Exception as err:
            msg = f"[{idx}] ERRO ao mapear EAN={ean}: {err} (url={img['url']})"
            print(msg)
            erro_lookup.append(msg)
    print(f"\nMapeamento concluído: {len(ean_to_id)} EANs válidos, {len(not_found_eans)} não encontrados, {len(erro_lookup)} erros de lookup.")
    if erro_lookup:
        with open("log_erros_lookup.txt", "w") as f:
            for msg in erro_lookup:
                f.write(msg + "\n")
    if not ean_to_id:
        print("Nenhum EAN válido encontrado. Abortando importação de imagens.")
        return

    # 2. Inserção das imagens válidas
    print("\n--- INSERÇÃO DE IMAGENS VÁLIDAS ---")
    erro_fk = []
    erro_sql = []
    inseridos = 0
    duplicados = 0
    total = 0
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        for idx, img in enumerate(imgs, 1):
            ean = str(img["ean"]).strip() if img["ean"] else None
            product_id = ean_to_id.get(ean)
            if not product_id:
                continue  # só insere se EAN foi validado
            msg_prefix = f"[{idx}/{len(imgs)}] EAN={ean} id_products={product_id} url={img['url']}"
            try:
                cur.execute(
                    """
                    INSERT INTO product_images (product_id_products, url, is_main, sort_order)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (product_id, img["url"], img["is_main"], img["sort_order"])
                )
                print(f"{msg_prefix} -> INSERIDA")
                inseridos += 1
            except Exception as err:
                err_str = str(err)
                if 'duplicate key value' in err_str or 'unique constraint' in err_str:
                    print(f"{msg_prefix} -> DUPLICADO ignorado")
                    duplicados += 1
                elif 'foreign key' in err_str or 'referential integrity' in err_str:
                    msg = f"{msg_prefix} -> ERRO FK: {err_str}"
                    print(msg)
                    erro_fk.append(msg)
                else:
                    msg = f"{msg_prefix} -> ERRO SQL: {err_str}"
                    print(msg)
                    erro_sql.append(msg)
            total += 1
            if inseridos % 1000 == 0:
                print(f"Progress: {inseridos} imagens inseridas...")
                conn.commit()
        conn.commit()
        cur.close()
        conn.close()
        print(f"Resumo FINAL: {inseridos} inseridas, {duplicados} duplicadas, {len(erro_fk)} erros FK, {len(erro_sql)} outros erros SQL, {total} processadas.")
        if erro_fk:
            with open("log_erros_fk.txt", "w") as f:
                for msg in erro_fk:
                    f.write(msg + "\n")
        if erro_sql:
            with open("log_erros_sql.txt", "w") as f:
                for msg in erro_sql:
                    f.write(msg + "\n")
    except Exception as e:
        print(f"ERRO GLOBAL na inserção: {e}")
