"""
One-time script to create BrunoMap tables in Supabase Postgres.
Run from scraper/ directory: python run_schema.py
"""
import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

conn = psycopg2.connect(
    host=os.environ.get("DB_HOST"),
    port=int(os.environ.get("DB_PORT", 5432)),
    user=os.environ.get("DB_USER"),
    password=os.environ.get("DB_PASSWORD"),
    dbname=os.environ.get("DB_NAME"),
)
conn.autocommit = True
cursor = conn.cursor()

with open("create_table.sql", "r") as f:
    sql = f.read()

cursor.execute(sql)
print("✅ All tables created successfully in Supabase!")

# Verify tables exist
cursor.execute("""
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
""")
tables = cursor.fetchall()
print(f"\nTables in database:")
for t in tables:
    print(f"  ✓ {t[0]}")

cursor.close()
conn.close()
