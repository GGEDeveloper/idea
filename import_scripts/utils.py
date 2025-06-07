import logging
from datetime import datetime

def setup_logging(log_file="import.log"):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.FileHandler(log_file), logging.StreamHandler()]
    )

def log_error(error, context=None):
    logging.error(f"Error: {error} | Context: {context}")
    # Optionally, append to LOG_ERROS.md as per project rules
    with open("../docs/LOG_ERROS.md", "a") as f:
        timestamp = datetime.utcnow().isoformat()
        f.write(f"- [{timestamp} UTC] ERROR: {error} | Context: {context}\n")
