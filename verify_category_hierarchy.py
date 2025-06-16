import os
import psycopg2
import psycopg2.extras # For DictCursor
from datetime import datetime

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print(f"[{datetime.now()}] FATAL: DATABASE_URL environment variable not set.")
        return None
    try:
        conn = psycopg2.connect(db_url)
        print(f"[{datetime.now()}] Successfully connected to the database for verification.")
        return conn
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] FATAL: Error connecting to the database: {e}")
        return None

def verify_hierarchy(conn):
    """Runs queries to verify category hierarchy."""
    if not conn:
        return

    print(f"[{datetime.now()}] --- Verifying Category Hierarchy ---")

    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Query 1: Count root and child categories
            print(f"[{datetime.now()}] Querying category counts (root vs child)...")
            cur.execute("""
                SELECT 
                    SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) AS root_categories,
                    SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) AS child_categories,
                    COUNT(*) AS total_categories
                FROM categories;
            """)
            counts = cur.fetchone()
            if counts:
                print(f"[{datetime.now()}] Category Counts:")
                print(f"  Total Categories: {counts['total_categories']}")
                print(f"  Root Categories (parent_id IS NULL): {counts['root_categories']}")
                print(f"  Child Categories (parent_id IS NOT NULL): {counts['child_categories']}")
            else:
                print(f"[{datetime.now()}] Could not retrieve category counts.")

            print(f"\n[{datetime.now()}] --- Sample of Category Hierarchy (LIMIT 20) ---")
            cur.execute("""
                SELECT 
                    c1.categoryid AS child_id, 
                    c1.name AS child_name, 
                    c1."path" AS child_path, 
                    c1.parent_id, 
                    c2.name AS parent_name, 
                    c2."path" AS parent_path
                FROM categories c1
                LEFT JOIN categories c2 ON c1.parent_id = c2.categoryid
                ORDER BY c1."path"
                LIMIT 20;
            """)
            sample_hierarchy = cur.fetchall()
            if sample_hierarchy:
                print(f"[{datetime.now()}] Displaying up to 20 sample category relationships:")
                for row in sample_hierarchy:
                    print(f"  Child: ID={row['child_id']}, Name='{row['child_name']}', Path='{row['child_path']}'")
                    if row['parent_id']:
                        print(f"    -> Parent: ID={row['parent_id']}, Name='{row['parent_name']}', Path='{row['parent_path']}'")
                    else:
                        print(f"    -> Parent: ROOT (parent_id is NULL)")
            else:
                print(f"[{datetime.now()}] No sample hierarchy data to display or categories table is empty.")

    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error during hierarchy verification: {e}")
    except Exception as e:
        print(f"[{datetime.now()}] General error during hierarchy verification: {e}")

def main():
    conn = get_db_connection()
    if conn:
        verify_hierarchy(conn)
        conn.close()
        print(f"[{datetime.now()}] Database connection closed after verification.")
    print(f"[{datetime.now()}] --- Verification Script Finished ---")

if __name__ == "__main__":
    main() 