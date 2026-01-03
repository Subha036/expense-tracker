from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.notification import Notification
from ..models.user import User
from ..schemas.notification import NotificationCreate, Notification as NotificationSchema
from ..dependencies import get_current_user


router = APIRouter()


@router.post("/", response_model=NotificationSchema)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_notification = Notification(**notification.dict(), user_id=current_user.id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification


@router.get("/", response_model=List[NotificationSchema])
def read_notifications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == current_user.id).offset(skip).limit(limit).all()
    return notifications


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"unread_count": count}


@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if notification is None:
        return {"error": "Notification not found"}
    
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    if notification is None:
        return {"error": "Notification not found"}
    
    db.delete(notification)
    db.commit()
    return {"message": "Notification deleted"}