#!/usr/bin/env python3

from app.database import SessionLocal
from app.models.user import User
from app.routes.auth import get_password_hash

def create_demo_user():
    db = SessionLocal()
    try:
        # Delete existing demo user if exists
        existing_user = db.query(User).filter(User.username == 'demo').first()
        if existing_user:
            db.delete(existing_user)
            db.commit()
            print('Deleted existing demo user')

        # Create new demo user
        hashed = get_password_hash('demo')
        demo_user = User(
            username='demo',
            email='demo@example.com',
            hashed_password=hashed,
            monthly_budget=1000.0
        )
        db.add(demo_user)
        db.commit()
        print('Demo user created successfully!')
        print('Username: demo')
        print('Password: demo')
    except Exception as e:
        print(f'Error creating demo user: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_demo_user()