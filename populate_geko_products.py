import xml.etree.ElementTree as ET
import psycopg2
import psycopg2.extras # For execute_values and RealDictCursor
import os
import json
from decimal import Decimal, InvalidOperation
from datetime import datetime

# Define batch size for database operations
BATCH_SIZE = 200

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print(f"[{datetime.now()}] Error: DATABASE_URL environment variable not set.")
        print(f"[{datetime.now()}] Please set it, e.g., export DATABASE_URL=\"your_postgres_connection_string\"")
        return None
    try:
        conn = psycopg2.connect(db_url)
        print(f"[{datetime.now()}] Successfully connected to the database.")
        return conn
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Error connecting to the database: {e}")
        return None

def parse_product_data(product_element):
    """Extracts required data from a single <product> XML element."""
    try:
        ean = product_element.get('EAN')
        if not ean:
            # print(f"Warning: Product element missing EAN. Skipping.") # Can be noisy
            return None 

        # Supplier Price
        price_element = product_element.find('price')
        supplier_price_str = price_element.get('net') if price_element is not None else None
        supplier_price = None
        if supplier_price_str:
            try:
                supplier_price = Decimal(supplier_price_str)
            except InvalidOperation:
                print(f"[{datetime.now()}] Warning: Could not parse price '{supplier_price_str}' for EAN {ean}. Using NULL for price.")
        
        # Stock Quantity
        stock_quantity = 0 
        size_element = product_element.find('.//sizes/size/stock') 
        if size_element is not None:
            quantity_str = size_element.get('quantity')
            if quantity_str:
                try:
                    stock_quantity = int(float(quantity_str.replace(',', '.')))
                except ValueError:
                    print(f"[{datetime.now()}] Warning: Could not parse stock quantity '{quantity_str}' for EAN {ean}. Using 0 for stock.")
        
        raw_xml_data = ET.tostring(product_element, encoding='unicode')
        raw_data_json = json.dumps({"xml_product_data": raw_xml_data})

        return {
            'ean': ean,
            'supplier_price': supplier_price,
            'stock_quantity': stock_quantity,
            'raw_data': raw_data_json,
            'last_sync': datetime.now() # This will be the same for all items in a batch if set here.
                                      # Alternatively, set it when building the tuple for execute_values if per-item precision is needed,
                                      # but for batch sync, a common batch timestamp is usually fine.
        }
    except Exception as e:
        ean_for_error = product_element.get('EAN', 'Unknown EAN')
        print(f"[{datetime.now()}] Error parsing product data for EAN {ean_for_error}: {e}")
        return None

def upsert_product_batch_to_db(conn, product_batch):
    """Inserts or updates a batch of products in the geko_products table using execute_values."""
    if not product_batch:
        return 0

    # Prepare data for execute_values: list of tuples
    # (ean, supplier_price, stock_quantity, raw_data, last_sync)
    # created_at and updated_at will use their DEFAULT NOW() for new rows.
    # For updated rows, updated_at is set by the ON CONFLICT clause.
    data_tuples = [
        (
            p['ean'],
            p['supplier_price'],
            p['stock_quantity'],
            p['raw_data'],
            p['last_sync'] # Using the timestamp generated when the product was parsed
        ) for p in product_batch
    ]

    sql_upsert = """
    INSERT INTO geko_products (ean, supplier_price, stock_quantity, raw_data, last_sync)
    VALUES %s
    ON CONFLICT (ean) DO UPDATE SET
        supplier_price = EXCLUDED.supplier_price,
        stock_quantity = EXCLUDED.stock_quantity,
        raw_data = EXCLUDED.raw_data,
        last_sync = EXCLUDED.last_sync,
        updated_at = NOW(); 
    """
    
    try:
        with conn.cursor() as cur:
            psycopg2.extras.execute_values(
                cur,
                sql_upsert,
                data_tuples,
                page_size=len(data_tuples) # Process the whole batch at once
            )
        # conn.commit() is handled in main after this function returns
        return len(product_batch) # Number of items attempted in the batch
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database batch error: {e}")
        conn.rollback() 
        return 0 # 0 items successfully processed in this batch
    except Exception as e:
        print(f"[{datetime.now()}] General error during DB batch upsert: {e}")
        conn.rollback()
        return 0

def main():
    xml_file_path = "/home/pixie/idea/data/xml/produkty_xml_3_14-06-2025_13_06_53_en.xml"
    
    conn = get_db_connection()
    if not conn:
        print(f"[{datetime.now()}] Script terminated: Database connection failed.")
        return

    print(f"[{datetime.now()}] Starting XML processing for: {xml_file_path} with batch size {BATCH_SIZE}")
    products_found_in_xml = 0
    products_successfully_upserted = 0
    product_batch = []
    
    try:
        context = ET.iterparse(xml_file_path, events=('end',))
        
        for event, elem in context:
            if elem.tag == 'product':
                products_found_in_xml += 1
                product_data = parse_product_data(elem)
                
                if product_data:
                    product_batch.append(product_data)
                
                if len(product_batch) >= BATCH_SIZE:
                    print(f"[{datetime.now()}] Processing batch of {len(product_batch)} products (Total found: {products_found_in_xml})...")
                    upserted_count = upsert_product_batch_to_db(conn, product_batch)
                    if upserted_count > 0:
                        conn.commit()
                        products_successfully_upserted += upserted_count
                        print(f"[{datetime.now()}] Batch committed. {upserted_count} products upserted in this batch.")
                    else:
                        print(f"[{datetime.now()}] Batch failed or resulted in 0 upserts.")
                    product_batch = [] # Clear the batch
                
                elem.clear() 
                # For very deep trees, consider clearing parent references if memory is still an issue
                # while elem.getprevious() is not None:
                #     del elem.getparent()[0]


        # Process any remaining products in the last batch
        if product_batch:
            print(f"[{datetime.now()}] Processing final batch of {len(product_batch)} products (Total found: {products_found_in_xml})...")
            upserted_count = upsert_product_batch_to_db(conn, product_batch)
            if upserted_count > 0:
                conn.commit()
                products_successfully_upserted += upserted_count
                print(f"[{datetime.now()}] Final batch committed. {upserted_count} products upserted.")
            else:
                print(f"[{datetime.now()}] Final batch failed or resulted in 0 upserts.")
        
        print(f"[{datetime.now()}] XML processing complete.")
        print(f"[{datetime.now()}] Total products found in XML: {products_found_in_xml}")
        print(f"[{datetime.now()}] Total products successfully upserted/updated in DB: {products_successfully_upserted}")

    except ET.ParseError as e:
        print(f"[{datetime.now()}] XML Parse Error: {e}")
    except Exception as e:
        print(f"[{datetime.now()}] An unexpected error occurred during processing: {e}")
        if conn: # Attempt to rollback if an error occurs mid-processing before finally closing
            conn.rollback()
    finally:
        if conn:
            conn.close()
            print(f"[{datetime.now()}] Database connection closed.")

if __name__ == "__main__":
    main() 