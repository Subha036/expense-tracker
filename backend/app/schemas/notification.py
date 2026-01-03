from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NotificationBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Title is required")
    message: str = Field(..., min_length=1, max_length=500, description="Message is required")


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True