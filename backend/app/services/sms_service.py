# Mock SMS service - in production, integrate with actual SMS provider
import logging

logger = logging.getLogger(__name__)


def send_budget_alert_sms(phone: str, current_spending: float, budget: float):
    """Send budget alert SMS (mock implementation)"""
    message = f"Expense Tracker Alert: Your spending ${current_spending:.2f} exceeded budget ${budget:.2f}"

    # In production, integrate with SMS service like Twilio, AWS SNS, etc.
    logger.info(f"Mock SMS sent to {phone}: {message}")
    print(f"SMS sent to {phone}: {message}")  # Console output for demo


def send_notification_sms(phone: str, title: str, message: str):
    """Send notification SMS (mock implementation)"""
    sms_message = f"Expense Tracker: {title} - {message}"

    # In production, integrate with SMS service
    logger.info(f"Mock notification SMS sent to {phone}: {sms_message}")
    print(f"Notification SMS sent to {phone}: {sms_message}")  # Console output for demo