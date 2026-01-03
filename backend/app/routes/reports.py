from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from ..database import get_db
from ..models.expense import Expense
from ..models.user import User
from ..dependencies import get_current_user

from typing import Dict, List
from datetime import datetime
import csv
import io

router = APIRouter()


@router.get("/monthly/{year}/{month}")
def get_monthly_report(
    year: int,
    month: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get expenses for the specified month
    expenses = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.date) == year,
        extract('month', Expense.date) == month
    ).all()

    # Calculate totals
    total_expenses = sum(expense.amount for expense in expenses)
    
    # Category breakdown
    category_totals = {}
    for expense in expenses:
        category_totals[expense.category] = category_totals.get(expense.category, 0) + expense.amount

    # Daily breakdown
    daily_totals = {}
    for expense in expenses:
        day = expense.date.day
        daily_totals[day] = daily_totals.get(day, 0) + expense.amount

    return {
        "year": year,
        "month": month,
        "total_expenses": total_expenses,
        "category_breakdown": category_totals,
        "daily_breakdown": daily_totals,
        "expense_count": len(expenses),
        "expenses": expenses
    }


@router.get("/summary")
def get_expense_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Current month expenses
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    current_month_expenses = db.query(func.sum(Expense.amount)).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.date) == current_year,
        extract('month', Expense.date) == current_month
    ).scalar() or 0

    # Category breakdown for current month
    category_query = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).filter(
        Expense.user_id == current_user.id,
        extract('year', Expense.date) == current_year,
        extract('month', Expense.date) == current_month
    ).group_by(Expense.category).all()

    category_breakdown = {cat: total for cat, total in category_query}

    budget = current_user.monthly_budget if current_user.monthly_budget and current_user.monthly_budget > 0 else 5000
    return {
        "current_month_total": current_month_expenses,
        "budget": budget,
        "remaining_budget": budget - current_month_expenses,
        "category_breakdown": category_breakdown
    }


@router.get("/export")
def export_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all expenses for the current user
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()

    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Date', 'Title', 'Category', 'Amount'])

    for expense in expenses:
        writer.writerow([
            expense.date.strftime('%Y-%m-%d'),
            expense.description,
            expense.category,
            expense.amount
        ])

    output.seek(0)
    filename = f"expense_data_{current_user.username}.csv"

    return StreamingResponse(
        io.StringIO(output.getvalue()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )