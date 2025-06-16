import os
import psycopg2
import psycopg2.extras # For DictCursor
from datetime import datetime

EAN_TO_DEBUG = '5901477183607' # EAN that showed product_price: null

def get_db_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print(f"[{datetime.now()}] FATAL: DATABASE_URL environment variable not set.")
        return None
    try:
        conn = psycopg2.connect(db_url)
        print(f"[{datetime.now()}] Successfully connected to the database for diagnostics.")
        return conn
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] FATAL: Error connecting to the database: {e}")
        return None

def run_diagnostic_queries(conn, ean):
    if not conn:
        return

    print(f"\n[{datetime.now()}] --- Running Diagnostic Queries for EAN: {ean} ---")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            print(f"\n[{datetime.now()}] Query 1: Checking product_variants for EAN {ean}...")
            cur.execute("SELECT variantid, ean, name, stockquantity, supplier_price, is_on_sale FROM product_variants WHERE ean = %s;", (ean,))
            variants = cur.fetchall()
            if variants:
                print(f"[{datetime.now()}] Found {len(variants)} variant(s) for EAN {ean}:")
                for variant in variants:
                    print(f"  VariantID: {variant['variantid']}, Supplier Price: {variant['supplier_price']}, Stock: {variant['stockquantity']}, OnSale: {variant['is_on_sale']}")
            else:
                print(f"[{datetime.now()}] No variants found for EAN {ean} in product_variants table.")

            print(f"\n[{datetime.now()}] Query 2: Checking prices table for variants of EAN {ean}...")
            # Fetches all price entries for variants linked to the given EAN
            cur.execute("""
                SELECT pv.ean, p.variantid, p.price_list_id, pl.name as price_list_name, p.price
                FROM prices p
                JOIN product_variants pv ON p.variantid = pv.variantid
                JOIN price_lists pl ON p.price_list_id = pl.price_list_id
                WHERE pv.ean = %s
                ORDER BY p.variantid, p.price_list_id;
            """, (ean,))
            variant_prices = cur.fetchall()
            if variant_prices:
                print(f"[{datetime.now()}] Found {len(variant_prices)} price entries for variants of EAN {ean}:")
                for vp_row in variant_prices:
                    print(f"  VariantID: {vp_row['variantid']}, PriceListID: {vp_row['price_list_id']} ({vp_row['price_list_name']}), Price: {vp_row['price']}")
            else:
                print(f"[{datetime.now()}] No price entries found in 'prices' table for variants of EAN {ean}.")

    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error during diagnostic queries: {e}")
    except Exception as e:
        print(f"[{datetime.now()}] General error during diagnostic queries: {e}")

def main():
    print(f"[{datetime.now()}] --- Starting Price Data Diagnostic Script ---")
    conn = get_db_connection()
    if conn:
        run_diagnostic_queries(conn, EAN_TO_DEBUG)
        # You can add more EANs to debug here if needed
        # run_diagnostic_queries(conn, 'ANOTHER_EAN_WITH_NULL_PRICE') 
        conn.close()
        print(f"\n[{datetime.now()}] Database connection closed after diagnostics.")
    print(f"[{datetime.now()}] --- Diagnostic Script Finished ---")

if __name__ == "__main__":
    main() 