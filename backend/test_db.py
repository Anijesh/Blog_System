import psycopg2

try:
    conn = psycopg2.connect(
        dbname="blogdb",
        user="postgres",
        password="admin123",
        host="127.0.0.1",
        port="5432"
    )
    print("Connected successfully!")
except Exception as e:
    print("Connection failed:", e)