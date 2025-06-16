import os
import psycopg2
import psycopg2.extras
from datetime import datetime

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print(f"[{datetime.now()}] FATAL: DATABASE_URL environment variable not set.")
        return None
    try:
        conn = psycopg2.connect(db_url)
        print(f"[{datetime.now()}] Successfully connected to the database.")
        return conn
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] FATAL: Error connecting to the database: {e}")
        return None

def execute_sql_command(conn, sql_command, description):
    """Executes a single SQL command and logs the outcome."""
    try:
        with conn.cursor() as cur:
            print(f"[{datetime.now()}] Attempting to execute: {description} -> {sql_command.strip()}")
            cur.execute(sql_command)
            conn.commit()
            print(f"[{datetime.now()}] Successfully executed: {description}")
        return True
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error for '{description}': {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"[{datetime.now()}] An unexpected error occurred for '{description}': {e}")
        conn.rollback()
        return False

def main():
    print(f"[{datetime.now()}] --- Starting Database Schema Update Script ---")
    conn = get_db_connection()
    
    if not conn:
        print(f"[{datetime.now()}] Script cannot proceed without a database connection.")
        return

    all_successful = True

    # 1. Modify product_images table
    print(f"[{datetime.now()}] --- Updating product_images table ---")
    sql_drop_img_constraint = "ALTER TABLE product_images DROP CONSTRAINT IF EXISTS product_images_ean_url_unique;"
    if not execute_sql_command(conn, sql_drop_img_constraint, "Drop existing unique constraint on product_images (ean, url) if any"):
        all_successful = False 

    sql_add_img_constraint = 'ALTER TABLE product_images ADD CONSTRAINT product_images_ean_url_unique UNIQUE (ean, "url");'
    if not execute_sql_command(conn, sql_add_img_constraint, "Add unique constraint to product_images (ean, url)"):
        all_successful = False
    
    # 2. Modify product_attributes table (columns)
    print(f"[{datetime.now()}] --- Updating product_attributes table (columns) ---")
    sql_add_created_at_attr = "ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();"
    if not execute_sql_command(conn, sql_add_created_at_attr, "Add created_at column to product_attributes"):
        all_successful = False

    sql_add_updated_at_attr = "ALTER TABLE product_attributes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();"
    if not execute_sql_command(conn, sql_add_updated_at_attr, "Add updated_at column to product_attributes"):
        all_successful = False

    # 3. Ensure trigger function exists (idempotent)
    print(f"[{datetime.now()}] --- Ensuring trigger_set_timestamp function ---")
    sql_create_trigger_func = """
    CREATE OR REPLACE FUNCTION trigger_set_timestamp()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """
    if not execute_sql_command(conn, sql_create_trigger_func, "Create/Replace trigger_set_timestamp function"):
        all_successful = False

    # 4. Apply trigger to product_attributes
    print(f"[{datetime.now()}] --- Applying trigger to product_attributes ---")
    sql_drop_attr_trigger = "DROP TRIGGER IF EXISTS set_timestamp_product_attributes ON product_attributes;"
    if not execute_sql_command(conn, sql_drop_attr_trigger, "Drop existing trigger on product_attributes if any"):
        all_successful = False 

    sql_create_attr_trigger = """
    CREATE TRIGGER set_timestamp_product_attributes
    BEFORE UPDATE ON product_attributes
    FOR EACH ROW
    EXECUTE PROCEDURE trigger_set_timestamp();
    """
    if not execute_sql_command(conn, sql_create_attr_trigger, "Create trigger set_timestamp_product_attributes"):
        all_successful = False
    
    # 5. Add UNIQUE constraint to product_attributes table
    print(f"[{datetime.now()}] --- Adding UNIQUE constraint to product_attributes table ---")
    sql_drop_attr_unique_constraint = "ALTER TABLE product_attributes DROP CONSTRAINT IF EXISTS product_attributes_product_ean_key_unique;"
    if not execute_sql_command(conn, sql_drop_attr_unique_constraint, "Drop existing unique constraint on product_attributes (product_ean, key) if any"):
        all_successful = False

    sql_add_attr_unique_constraint = 'ALTER TABLE product_attributes ADD CONSTRAINT product_attributes_product_ean_key_unique UNIQUE (product_ean, "key");'
    if not execute_sql_command(conn, sql_add_attr_unique_constraint, 'Add unique constraint to product_attributes (product_ean, "key")'):
        all_successful = False

    # 6. Add supplier_price to product_variants table
    print(f"[{datetime.now()}] --- Updating product_variants table (add supplier_price) ---")
    sql_add_supplier_price_variants = "ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS supplier_price NUMERIC(12,4);"
    if not execute_sql_command(conn, sql_add_supplier_price_variants, "Add supplier_price column to product_variants"):
        all_successful = False
        
    # --- New: Update `prices` table structure ---
    print(f"[{datetime.now()}] --- Restructuring 'prices' table for variant-specific pricing ---")
    
    # Clear existing data from prices table before altering structure that might conflict with old data.
    if not execute_sql_command(conn, "DELETE FROM prices;", "Clear existing data from prices table"):
        all_successful = False
        print(f"[{datetime.now()}] CRITICAL: Failed to clear prices table. Subsequent schema changes might fail or be inconsistent.")

    if not execute_sql_command(conn, "ALTER TABLE prices DROP CONSTRAINT IF EXISTS fk_p_product_ean;", "Drop old FK on prices.product_ean (fk_p_product_ean)"):
        print(f"[{datetime.now()}] Info: fk_p_product_ean did not exist or could not be dropped (might be OK if column is dropped next).")
        # This specific FK name comes from the original schema script where it was explicitly named.

    # Attempt to drop a potentially auto-named unique constraint involving product_ean
    # This is speculative as the name is auto-generated if not specified. A better way is to query information_schema.
    if not execute_sql_command(conn, "ALTER TABLE prices DROP CONSTRAINT IF EXISTS prices_product_ean_price_list_id_key;", "Drop potential old unique constraint involving product_ean (prices_product_ean_price_list_id_key)"):
         print(f"[{datetime.now()}] Info: prices_product_ean_price_list_id_key did not exist or could not be dropped.")

    if not execute_sql_command(conn, "ALTER TABLE prices DROP COLUMN IF EXISTS product_ean;", "Drop product_ean column from prices"):
        all_successful = False 
        print(f"[{datetime.now()}] CRITICAL: Failed to drop product_ean column. Subsequent steps might fail.")

    if not execute_sql_command(conn, "ALTER TABLE prices ADD COLUMN IF NOT EXISTS variantid TEXT;", "Add variantid column to prices"):
        all_successful = False
    else:
        # Only try to make NOT NULL if column exists/was added. Assuming table will be repopulated by ETL.
        if not execute_sql_command(conn, "ALTER TABLE prices ALTER COLUMN variantid SET NOT NULL;", "Set prices.variantid to NOT NULL"):
            all_successful = False
            print(f"[{datetime.now()}] Warning: Failed to set prices.variantid to NOT NULL. This might be an issue if data exists that would violate this.")
        
        execute_sql_command(conn, "ALTER TABLE prices DROP CONSTRAINT IF EXISTS fk_prices_variantid;", "Drop existing fk_prices_variantid if any")
        if not execute_sql_command(conn, "ALTER TABLE prices ADD CONSTRAINT fk_prices_variantid FOREIGN KEY (variantid) REFERENCES product_variants(variantid) ON DELETE CASCADE;", "Add FK from prices.variantid to product_variants.variantid"):
            all_successful = False

    execute_sql_command(conn, "ALTER TABLE prices DROP CONSTRAINT IF EXISTS prices_variantid_price_list_id_unique;", "Drop existing prices_variantid_price_list_id_unique if any")
    if not execute_sql_command(conn, "ALTER TABLE prices ADD CONSTRAINT prices_variantid_price_list_id_unique UNIQUE (variantid, price_list_id);", "Add unique constraint on prices (variantid, price_list_id)"):
        all_successful = False
        
    # --- New: Seed `price_lists` table ---
    print(f"[{datetime.now()}] --- Seeding 'price_lists' table ---")
    price_list_data = [
        (1, 'Supplier Price', 'Custo de fornecedor (base da variante)'),
        (2, 'Base Selling Price', 'Preço de venda base (+25% markup sobre custo fornecedor da variante)'),
        (3, 'Promotional Price', 'Preço promocional temporário (a ser definido manualmente)')
    ]
    sql_seed_price_lists = """
    INSERT INTO price_lists (price_list_id, name, description) VALUES (%s, %s, %s)
    ON CONFLICT (price_list_id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    """
    try:
        with conn.cursor() as cur:
            psycopg2.extras.execute_batch(cur, sql_seed_price_lists, price_list_data, page_size=len(price_list_data))
            conn.commit()
            print(f"[{datetime.now()}] Successfully seeded/updated {len(price_list_data)} price lists.")
    except Exception as e:
        print(f"[{datetime.now()}] Error seeding price_lists: {e}")
        conn.rollback()
        all_successful = False
        
    # --- Add is_featured to products table ---
    print(f"[{datetime.now()}] --- Updating products table (add is_featured) ---")
    sql_add_is_featured_products = "ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;"
    if not execute_sql_command(conn, sql_add_is_featured_products, "Add is_featured column to products table"):
        all_successful = False

    # --- Add is_on_sale to product_variants table ---
    print(f"[{datetime.now()}] --- Updating product_variants table (add is_on_sale) ---")
    sql_add_is_on_sale_variants = "ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false;"
    if not execute_sql_command(conn, sql_add_is_on_sale_variants, "Add is_on_sale column to product_variants table"):
        all_successful = False
        
    if conn:
        conn.close()
        print(f"[{datetime.now()}] Database connection closed.")

    if all_successful:
        print(f"[{datetime.now()}] --- Database Schema Update Script Completed Successfully ---")
    else:
        print(f"[{datetime.now()}] --- Database Schema Update Script Completed With Errors ---")
        print(f"[{datetime.now()}] Please review logs above for details.")

if __name__ == "__main__":
    main() 