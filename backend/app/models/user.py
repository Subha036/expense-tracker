from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.sql import func
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)  # Allow NULL for Google users
    monthly_budget = Column(Float, default=5000.0)
    email_notifications_enabled = Column(Boolean, default=True, nullable=False)
    provider = Column(String(50), default='local', nullable=True)  # From migration
    provider_id = Column(String(255), nullable=True)  # From migration

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
