import logging
import os
import sys

# Ensure the parent directory of 'scripts' is in sys.path
current_script_path = os.path.abspath(__file__)
current_dir = os.path.dirname(current_script_path)
scripts_dir = os.path.dirname(current_dir)
project_root = os.path.dirname(scripts_dir)

if project_root not in sys.path:
    sys.path.insert(0, project_root)

# It's good practice to attempt imports after sys.path manipulation
try:
    from scripts.data_import.parsers.parse_geko_xml import parse_geko_xml_file
    from scripts.data_import.importers.upsert_geko_products import upsert_geko_products_batch
except ModuleNotFoundError as e:
    # Log this error specifically if it happens when run_import_geko_data is called as a module
    # The orchestrator should catch its own import errors for these modules if run directly.
    logging.basicConfig(level=logging.ERROR) # Ensure logging is configured to see this
    logging.error(f"CRITICAL IMPORT ERROR in run_import_geko_data: {e}. sys.path: {sys.path}")
    raise # Re-raise to ensure failure is clear

# Configure logging for this script
# The orchestrator will also log, but this script can have its own when run directly or as a module
log_file_name = 'run_import_geko_data.log'
log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), log_file_name)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file_path, mode='a'), # Append mode
        logging.StreamHandler(sys.stdout) # Also print to console
    ]
)

# Define the path to the XML file relative to this script's location
# scripts/data_import/run_import_geko_data.py
# XML path: data/xml/produkty_xml_3_14-06-2025_13_06_53_en.xml
XML_FILE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), # up three levels to project root
    'data', 'xml', 'produkty_xml_3_14-06-2025_13_06_53_en.xml'
)

def main():
    logging.info(f"Starting Geko data import process. XML file: {XML_FILE_PATH}")

    if not os.path.exists(XML_FILE_PATH):
        logging.error(f"XML file not found at {XML_FILE_PATH}. Please check the path.")
        return

    try:
        logging.info("Step 1: Parsing XML file...")
        parsed_products = parse_geko_xml_file(XML_FILE_PATH)
        if parsed_products is None: # Assuming parser returns None on critical error
            logging.error("XML parsing failed critically. Check parser logs.")
            return 
        
        product_count = len(parsed_products)
        logging.info(f"XML parsing completed. Found {product_count} products.")

        if not parsed_products:
            logging.warning("No products found in the XML file or parsing resulted in an empty list.")
            # Decide if to proceed or not. For now, let's proceed to see if upsert handles empty list gracefully.
            # return # Optionally, uncomment to stop if no products are found

        logging.info("Step 2: Upserting parsed products into the database...")
        success = upsert_geko_products_batch(parsed_products)
        if success:
            logging.info(f"Successfully upserted data for {product_count} products (or handled them appropriately if already up-to-date).")
        else:
            logging.error("Database upsert process reported errors. Check importer logs.")
            
        logging.info("Geko data import process finished.")

    except FileNotFoundError:
        logging.error(f"Error: XML file not found at {XML_FILE_PATH}")
    except Exception as e:
        logging.error(f"An unexpected error occurred during the Geko data import process: {e}", exc_info=True)

if __name__ == "__main__":
    # This allows the script to be run directly, e.g., python -m scripts.data_import.run_import_geko_data
    # The orchestrator script will also call this main() function when running it as part of its flow.
    main() 