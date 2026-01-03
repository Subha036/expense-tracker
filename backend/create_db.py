import psycopg2

try:
    # Connect to the default postgres database
    conn = psycopg2.connect("postgresql://postgres:9976%40chandran@localhost:5432/postgres")
    conn.autocommit = True  # Required for CREATE DATABASE
    cur = conn.cursor()
    cur.execute("CREATE DATABASE \"ExpenseTrackerDB\";")
    print("Database ExpenseTrackerDB created successfully.")
    conn.close()
except Exception as e:
    print(f"Error: {e}")