from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:9976%40chandran@localhost:5432/expense_tracker')
with engine.connect() as conn:
    result = conn.execute(text('SELECT * FROM expenses;')).fetchall()
    print('Expenses:', result)
    result_users = conn.execute(text('SELECT * FROM users;')).fetchall()
    print('Users:', result_users)