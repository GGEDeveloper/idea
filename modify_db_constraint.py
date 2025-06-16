import os
import psycopg2
from datetime import datetime

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

def drop_fk_constraint(conn):
    """Drops the specified foreign key constraint if it exists."""
    # Constraint name as defined in your schema
    constraint_name = "fk_gp_product_ean" 
    table_name = "geko_products"
    sql_command = f"ALTER TABLE {table_name} DROP CONSTRAINT IF EXISTS {constraint_name};"
    
    try:
        with conn.cursor() as cur:
            print(f"[{datetime.now()}] Attempting to execute: {sql_command}")
            cur.execute(sql_command)
            conn.commit()
            print(f"[{datetime.now()}] Successfully executed command. Constraint '{constraint_name}' on table '{table_name}' should be dropped (if it existed).")
            # Note: ALTER TABLE DROP CONSTRAINT does not typically return rows or raise an error if the constraint didn't exist (due to IF EXISTS)
            # A more robust check would be to query information_schema.table_constraints, but for this purpose, success of execution is usually sufficient.
        return True
    except psycopg2.Error as e:
        print(f"[{datetime.now()}] Database error while trying to drop constraint '{constraint_name}': {e}")
        conn.rollback()
        return False
    except Exception as e:
        print(f"[{datetime.now()}] An unexpected error occurred: {e}")
        conn.rollback()
        return False

def main():
    print(f"[{datetime.now()}] --- Starting Database Constraint Modification Script ---")
    conn = get_db_connection()
    
    if not conn:
        print(f"[{datetime.now()}] Script cannot proceed without a database connection.")
        return

    if drop_fk_constraint(conn):
        print(f"[{datetime.now()}] Constraint modification process completed successfully.")
    else:
        print(f"[{datetime.now()}] Constraint modification process encountered errors.")
        
    if conn:
        conn.close()
        print(f"[{datetime.now()}] Database connection closed.")
    print(f"[{datetime.now()}] --- Finished Database Constraint Modification Script ---")

if __name__ == "__main__":
    main() 