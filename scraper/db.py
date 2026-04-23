import os
import psycopg2
from dotenv import load_dotenv

# Load from scraper/.env if present; falls back to system environment variables.
load_dotenv()

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 5432)),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "dbname": os.environ.get("DB_NAME", "postgres"),
}


def get_connection():
    return psycopg2.connect(**DB_CONFIG)
