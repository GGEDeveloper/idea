import logging
import psycopg2
import psycopg2.extras # Para execute_batch
import os
import sys
from ..database.db_connector import get_db_connection # Usar path relativo para import dentro do mesmo pacote

# Ensure the parent directory of 'scripts' is in sys.path
current_script_path = os.path.abspath(__file__)
current_dir = os.path.dirname(current_script_path) # .../scripts/data_import/importers
scripts_dir = os.path.dirname(current_dir) # .../scripts/data_import
project_root = os.path.dirname(scripts_dir) # .../scripts
project_root_actual = os.path.dirname(project_root) # .../ (project root)

if project_root_actual not in sys.path:
    sys.path.insert(0, project_root_actual)

try:
    from scripts.data_import.database.db_connector import get_db_connection
except ModuleNotFoundError as e:
    logging.basicConfig(level=logging.ERROR)
    logging.error(f"CRITICAL IMPORT ERROR in upsert_geko_products: {e}. sys.path: {sys.path}")
    raise

# Configurar logging básico
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s')

UPSERT_SQL = """
INSERT INTO geko_products (
    ean, 
    supplier_price, 
    stock_quantity, 
    raw_xml_node, 
    geko_product_id_attr, 
    geko_code_attr,
    last_updated_at
)
VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
ON CONFLICT (ean) DO UPDATE SET
    supplier_price = EXCLUDED.supplier_price,
    stock_quantity = EXCLUDED.stock_quantity,
    raw_xml_node = EXCLUDED.raw_xml_node,
    geko_product_id_attr = EXCLUDED.geko_product_id_attr,
    geko_code_attr = EXCLUDED.geko_code_attr,
    last_updated_at = CURRENT_TIMESTAMP;
"""

def upsert_geko_products_batch(products_data):
    """Inserts or updates a batch of products in the geko_products table."""
    if not products_data:
        logging.info("No product data provided to upsert_geko_products_batch. Skipping database operation.")
        return True # Considered successful as there's nothing to do

    total_products = len(products_data)
    logging.info(f"Starting batch upsert for {total_products} products into geko_products table.")
    
    conn = None
    success_count = 0
    error_count = 0
    log_interval = 500 # Log progress every 500 products
    processed_for_log = 0

    try:
        conn = get_db_connection()
        if not conn:
            logging.error("Failed to establish database connection for batch upsert.")
            return False

        with conn.cursor() as cur:
            # Prepare data for execute_batch
            # (ean, supplier_price, stock_quantity, raw_xml_node, geko_product_id_attr, geko_code_attr)
            data_to_upsert = [
                (
                    p.get('ean'), 
                    p.get('supplier_price'), 
                    p.get('stock_quantity'), 
                    p.get('raw_xml_node_str'),
                    p.get('geko_product_id_attr'),
                    p.get('geko_code_attr')
                 ) for p in products_data if p.get('ean') # Ensure EAN exists
            ]
            
            products_with_ean = len(data_to_upsert)
            if products_with_ean < total_products:
                logging.warning(f"{total_products - products_with_ean} products were missing EAN and will be skipped in this batch.")

            if not data_to_upsert:
                logging.info("No products with EAN to upsert in this batch after filtering.")
                conn.close() # Close connection as it won't be used
                return True

            # psycopg2.extras.execute_batch(cur, UPSERT_SQL, data_to_upsert, page_size=100) # page_size can be tuned
            # Iterating to provide more granular logging and error handling for now
            for i, product_tuple in enumerate(data_to_upsert):
                try:
                    cur.execute(UPSERT_SQL, product_tuple)
                    success_count += 1
                    processed_for_log += 1
                    if processed_for_log % log_interval == 0:
                        logging.info(f"Upsert progress: {processed_for_log}/{products_with_ean} products processed for database operation...")
                except psycopg2.Error as db_err:
                    error_count += 1
                    logging.error(f"Database error upserting product EAN {product_tuple[0] if product_tuple else 'N/A'}: {db_err}")
                    # Optionally, log the specific product data that failed, but be mindful of PII/log size
                    # logging.debug(f"Failed product data: {product_tuple}")
                    # Decide if one error should stop the whole batch or continue
                    # For now, we continue and report errors at the end.
                except Exception as e_ind:
                    error_count += 1
                    logging.error(f"Unexpected error upserting product EAN {product_tuple[0] if product_tuple else 'N/A'}: {e_ind}")

            conn.commit()
            logging.info(f"Batch upsert process completed. Successfully processed: {success_count}, Errors: {error_count} out of {products_with_ean} products with EAN.")

        return error_count == 0 # Return True if no errors

    except psycopg2.Error as e:
        logging.error(f"Database error during batch upsert setup or commit: {e}", exc_info=True)
        if conn:
            conn.rollback() # Rollback on general error
        return False
    except Exception as e:
        logging.error(f"An unexpected error occurred in upsert_geko_products_batch: {e}", exc_info=True)
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()
            logging.debug("Database connection closed after batch upsert.")

if __name__ == '__main__':
    # Example of how to test this module directly
    # Setup logging for direct script execution test
    log_dir = os.path.join(project_root_actual, 'logs')
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    test_log_file = os.path.join(log_dir, 'upsert_geko_products_test.log')

    logging.basicConfig(
        level=logging.DEBUG,
        format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(lineno)d - %(message)s',
        handlers=[
            logging.FileHandler(test_log_file, mode='w'),
            logging.StreamHandler(sys.stdout)
        ]
    )

    logging.info("--- Starting direct test of upsert_geko_products_batch ---")
    sample_products = [
        {'ean': '1234567890123', 'supplier_price': 10.99, 'stock_quantity': 100, 'raw_xml_node_str': '<product EAN="1234567890123"></product>', 'geko_product_id': 'prod1', 'geko_product_code': 'P1'},
        {'ean': '9876543210987', 'supplier_price': 5.49, 'stock_quantity': 50, 'raw_xml_node_str': '<product EAN="9876543210987"></product>', 'geko_product_id': 'prod2', 'geko_product_code': 'P2'},
        {'ean': '1234500000000', 'supplier_price': 1.00, 'stock_quantity': 0, 'raw_xml_node_str': '<product EAN="1234500000000"></product>', 'geko_product_id': 'prod3', 'geko_product_code': 'P3'},
        # Product missing EAN to test filtering
        {'supplier_price': 99.99, 'stock_quantity': 5, 'raw_xml_node_str': '<product></product>', 'geko_product_id': 'prod4_no_ean', 'geko_product_code': 'P4NE'},
    ]
    
    # Test with valid data
    logging.info("Test 1: Upserting sample products...")
    success = upsert_geko_products_batch(sample_products)
    logging.info(f"Test 1 Result: Success = {success}")

    # Test with empty data
    logging.info("Test 2: Upserting empty list...")
    success_empty = upsert_geko_products_batch([])
    logging.info(f"Test 2 Result (empty list): Success = {success_empty}")

    # Test with data where some products might already exist (to test ON CONFLICT)
    logging.info("Test 3: Upserting same sample products again (testing ON CONFLICT)...")
    updated_sample_products = [
        {'ean': '1234567890123', 'supplier_price': 11.50, 'stock_quantity': 90, 'raw_xml_node_str': '<product EAN="1234567890123" updated="true"></product>', 'geko_product_id': 'prod1_upd', 'geko_product_code': 'P1U'},
    ]
    success_update = upsert_geko_products_batch(updated_sample_products)
    logging.info(f"Test 3 Result (update): Success = {success_update}")

    logging.info("--- Finished direct test of upsert_geko_products_batch ---") 