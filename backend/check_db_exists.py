import psycopg2

try:
    # Connect to the default postgres database to check if ExpenseTrackerDB exists
    conn = psycopg2.connect("postgresql://postgres:9976%40chandran@localhost:5432/postgres")
    cur = conn.cursor()
    cur.execute("SELECT 1 FROM pg_database WHERE datname = 'ExpenseTrackerDB';")
    exists = cur.fetchone()
    if exists:
        print("Database ExpenseTrackerDB exists.")
    else:
        print("Database ExpenseTrackerDB does not exist.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")