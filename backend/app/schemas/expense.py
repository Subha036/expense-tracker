from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0, description="Expense amount must be positive")
    description: str = Field(..., min_length=1, max_length=255, description="Description is required")
    category: str = Field(..., min_length=1, max_length=100, description="Category is required")
    date: datetime


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[datetime] = None


class Expense(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True