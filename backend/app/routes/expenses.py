from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List
from datetime import datetime
from ..database import get_db
from ..models.expense import Expense
from ..models.user import User
from ..models.notification import Notification
from ..schemas.expense import ExpenseCreate, ExpenseUpdate, Expense as ExpenseSchema
from ..dependencies import get_current_user


router = APIRouter()


@router.post("/", response_model=ExpenseSchema)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense = Expense(**expense.dict(), user_id=current_user.id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)

    print(f"Debug: Expense amount: {expense.amount}")

    # Notification triggers

    current_month = datetime.now().month

    current_year = datetime.now().year

    current_month_total = db.query(func.sum(Expense.amount)).filter(

        Expense.user_id == current_user.id,

        extract('year', Expense.date) == current_year,

        extract('month', Expense.date) == current_month

    ).scalar() or 0.0

    budget = 5000.0  # Hardcoded for testing

    print(f"Debug: Total expenses this month: {current_month_total}, Budget: {budget}")

    # Check for 80% budget

    if current_month_total >= 0.8 * budget:

        # Check if no previous 80% alert exists

        existing_alert = db.query(Notification).filter(

            Notification.user_id == current_user.id,

            Notification.title == "Budget Alert"

        ).first()

        if existing_alert is None:

            print("Debug: Triggering Budget Alert")

            title = "Budget Alert"

            message = "You have used more than 80% of your monthly budget."

            notification = Notification(user_id=current_user.id, title=title, message=message)

            db.add(notification)

    # Check for budget exceeded

    if current_month_total > budget:

        print("Debug: Triggering Budget Exceeded")

        title = "Budget Exceeded"

        message = "Your expenses have exceeded your monthly budget."

        notification = Notification(user_id=current_user.id, title=title, message=message)

        db.add(notification)

    # Check for large expense

    if expense.amount > 1000:

        print("Debug: Triggering Large Expense Added")

        title = "Large Expense Added"

        message = f"You added an expense of ₹{expense.amount}"

        notification = Notification(user_id=current_user.id, title=title, message=message)

        db.add(notification)

    # Test notification for every expense

    print("Debug: Creating test notification")

    title = "Test Notification"

    message = f"Expense added: {expense.description} for ₹{expense.amount}"

    notification = Notification(user_id=current_user.id, title=title, message=message)

    db.add(notification)

    db.commit()
    print(f"Expense inserted: ID {db_expense.id}, Amount {db_expense.amount}, User {db_expense.user_id}")

    return db_expense


@router.get("/", response_model=List[ExpenseSchema])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).offset(skip).limit(limit).all()
    return expenses


@router.get("/{expense_id}", response_model=ExpenseSchema)
def read_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseSchema)
def update_expense(
    expense_id: int,
    expense_update: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    for field, value in expense_update.dict(exclude_unset=True).items():
        setattr(expense, field, value)
    
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}