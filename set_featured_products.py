import os
import psycopg2
from datetime import datetime

EANS_TO_FEATURE = [
    "5901477100215",
    "5901477100451", 
    "5901477100208",
    "5901477100482",
    "5901477100499"
]
UNIQUE_EANS_TO_FEATURE = sorted(list(set(EANS_TO_FEATURE)))


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

def update_featured_status(conn, ean_list, featured_status):
    """Updates the is_featured status for a list of EANs."""
    if not ean_list:
        print(f"[{datetime.now()}] No EANs provided to update to featured_status={featured_status}.")
        return 0
    
    updated_count = 0
    try:
        with conn.cursor() as cur:
            for ean in ean_list:
                sql = "UPDATE products SET is_featured = %s, updated_at = NOW() WHERE ean = %s;"
                cur.execute(sql, (featured_status, ean))
                if cur.rowcount > 0:
                    updated_count += cur.rowcount
                    print(f"[{datetime.now()}] EAN {ean} set to is_featured = {featured_status}.")
                else:
                    print(f"[{datetime.now()}] Warning: EAN {ean} not found or already had is_featured = {featured_status}.")
            conn.commit()
            print(f"[{datetime.now()}] Total products attempted to set to is_featured = {featured_status}: {len(ean_list)}. Actual rows affected: {updated_count}.")
        return updated_count
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error updating featured status: {e}")
        conn.rollback()
        return 0
    except Exception as e:
        print(f"[{datetime.now()}] An unexpected error occurred: {e}")
        conn.rollback()
        return 0

def clear_all_featured_flags(conn):
    """Sets is_featured = false for all products."""
    try:
        with conn.cursor() as cur:
            print(f"[{datetime.now()}] Setting is_featured = false for ALL products...")
            cur.execute("UPDATE products SET is_featured = false, updated_at = NOW() WHERE is_featured = true;")
            count = cur.rowcount
            conn.commit()
            print(f"[{datetime.now()}] Successfully reset is_featured flag for {count} product(s).")
        return True
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error clearing featured flags: {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"[{datetime.now()}] An unexpected error occurred while clearing featured flags: {e}")
        conn.rollback()
        return False

def main():
    print(f"[{datetime.now()}] --- Starting Script to Set Featured Products ---")
    conn = get_db_connection()
    
    if not conn:
        print(f"[{datetime.now()}] Script cannot proceed without a database connection.")
        return

    all_successful = True

    if not clear_all_featured_flags(conn):
        all_successful = False
        print(f"[{datetime.now()}] Warning: Could not reliably clear existing featured flags.")

    if all_successful: 
        print(f"[{datetime.now()}] Setting specified EANs to is_featured = true: {UNIQUE_EANS_TO_FEATURE}")
        update_featured_status(conn, UNIQUE_EANS_TO_FEATURE, True)
        
    if conn:
        conn.close()
        print(f"[{datetime.now()}] Database connection closed.")

    if all_successful:
        print(f"[{datetime.now()}] --- Script to Set Featured Products Completed Successfully (or with warnings) ---")
    else:
        print(f"[{datetime.now()}] --- Script to Set Featured Products Completed With Errors ---")
    print(f"[{datetime.now()}] Please check your application's Home Page carousel.")

if __name__ == "__main__":
    main() 