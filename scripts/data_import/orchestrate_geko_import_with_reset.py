import logging
import subprocess
import os
import sys

# Ensure the parent directory of 'scripts' is in sys.path if it's not already
# This allows 'from scripts.data_import...' to work when running this script directly
# or as a module.
# Get the absolute path of the current script
current_script_path = os.path.abspath(__file__)
# Get the directory containing the current script (e.g., /path/to/idea/scripts/data_import)
current_dir = os.path.dirname(current_script_path)
# Get the parent directory of current_dir (e.g., /path/to/idea/scripts)
scripts_dir = os.path.dirname(current_dir)
# Get the parent directory of scripts_dir (e.g., /path/to/idea) - this is the project root
project_root = os.path.dirname(scripts_dir)

# Add project_root to sys.path if it's not already there
if project_root not in sys.path:
    sys.path.insert(0, project_root)

try:
    from scripts.data_import.database.db_connector import get_db_connection
except ModuleNotFoundError:
    print(f"ERROR: Could not import get_db_connection. Ensure '{project_root}' is in PYTHONPATH or run with 'python -m scripts.data_import.orchestrate_geko_import_with_reset'")
    sys.exit(1)

# Configure logging
log_file_path = os.path.join(current_dir, 'geko_import_orchestration.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path),
        logging.StreamHandler(sys.stdout) # Also print to console
    ]
)

ALTER_TABLE_SQL = """
ALTER TABLE geko_products
ADD COLUMN IF NOT EXISTS geko_product_id_attr TEXT,
ADD COLUMN IF NOT EXISTS geko_code_attr TEXT;
"""

COMMENT_ID_SQL = """
COMMENT ON COLUMN geko_products.geko_product_id_attr IS 'O atributo "id" da tag <product> no XML da Geko.';
"""

COMMENT_CODE_SQL = """
COMMENT ON COLUMN geko_products.geko_code_attr IS 'O atributo "code" da tag <product> no XML da Geko.';
"""

TRUNCATE_TABLE_SQL = """
TRUNCATE TABLE geko_products RESTART IDENTITY CASCADE;
"""

def execute_sql_command(conn, sql_command, description):
    """Executes a given SQL command and logs the outcome."""
    try:
        with conn.cursor() as cur:
            cur.execute(sql_command)
        conn.commit()
        logging.info(f"Successfully executed SQL command: {description}")
        return True
    except Exception as e:
        logging.error(f"Error executing SQL command ({description}): {e}")
        conn.rollback() # Rollback in case of error
        return False

def run_main_import_script():
    """Runs the main Geko data import script."""
    logging.info("Starting the main Geko data import script: scripts.data_import.run_import_geko_data")
    # Use the Python interpreter from the virtual environment
    python_executable = os.path.join(project_root, '.venv', 'bin', 'python3')
    if not os.path.exists(python_executable):
        # Fallback to python3 if not found, though ideally it should be in .venv
        logging.warning(f"Python executable not found at {python_executable}, falling back to 'python3'. This might use the wrong environment.")
        python_executable = 'python3'

    script_to_run = [python_executable, '-m', 'scripts.data_import.run_import_geko_data']
    
    try:
        # We need to run this from the project root for module resolution to work correctly
        # The project_root variable should be correctly set up above
        process = subprocess.Popen(script_to_run, cwd=project_root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        # Log stdout and stderr line by line
        if process.stdout:
            for line in iter(process.stdout.readline, ''):
                logging.info(f"[Import Script STDOUT]: {line.strip()}")
        
        if process.stderr:
            for line in iter(process.stderr.readline, ''):
                logging.error(f"[Import Script STDERR]: {line.strip()}")

        process.wait() # Wait for the subprocess to complete

        if process.returncode == 0:
            logging.info("Main Geko data import script completed successfully.")
            return True
        else:
            logging.error(f"Main Geko data import script failed with return code {process.returncode}.")
            return False
    except FileNotFoundError:
        logging.error(f"Error: The Python interpreter or the script module was not found. Command: {' '.join(script_to_run)}")
        logging.error("Please ensure Python is in your PATH and you are running this from a context where 'scripts.data_import.run_import_geko_data' can be resolved.")
        return False
    except Exception as e:
        logging.error(f"An unexpected error occurred while running the main import script: {e}")
        return False

def main():
    logging.info("Starting Geko data import orchestration script.")
    
    conn = None
    try:
        logging.info("Attempting to connect to the database...")
        conn = get_db_connection()
        if conn:
            logging.info("Successfully connected to the database.")
            
            logging.info("Step 1: Ensuring geko_product_id_attr and geko_code_attr columns exist in geko_products table.")
            if not execute_sql_command(conn, ALTER_TABLE_SQL, "Add geko_product_id_attr and geko_code_attr columns"):
                logging.error("Failed to alter table. Aborting.")
                return

            logging.info("Step 1b: Adding comments to new columns.")
            if not execute_sql_command(conn, COMMENT_ID_SQL, "Add comment to geko_product_id_attr column"):
                logging.warning("Failed to add comment to geko_product_id_attr. Continuing.")
            if not execute_sql_command(conn, COMMENT_CODE_SQL, "Add comment to geko_code_attr column"):
                logging.warning("Failed to add comment to geko_code_attr. Continuing.")

            logging.info("Step 2: Truncating geko_products table.")
            if not execute_sql_command(conn, TRUNCATE_TABLE_SQL, "Truncate geko_products table"):
                logging.error("Failed to truncate table. Aborting.")
                return
            
            logging.info("Database preparation steps completed.")
        else:
            logging.error("Failed to connect to the database. Aborting orchestration.")
            return

    except Exception as e:
        logging.error(f"An error occurred during database operations: {e}")
        return # Abort if database setup fails
    finally:
        if conn:
            conn.close()
            logging.info("Database connection closed.")

    logging.info("Step 3: Running the main data import script.")
    if run_main_import_script():
        logging.info("Geko data import orchestration script completed successfully.")
    else:
        logging.error("Geko data import orchestration script encountered errors during the main import.")

if __name__ == "__main__":
    main() 