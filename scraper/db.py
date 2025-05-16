import mysql.connector

# You can move these into a config file or env vars
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "rootroot",
    "database": "map_db",
}


def get_connection():
    return mysql.connector.connect(**DB_CONFIG)
