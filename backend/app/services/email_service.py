# Mock email service - in production, integrate with actual email provider
import logging

logger = logging.getLogger(__name__)


def send_budget_alert_email(email: str, current_spending: float, budget: float):
    """Send budget alert email (mock implementation)"""
    subject = "Budget Alert - Expense Tracker"
    message = f"""
    Your current spending of ${current_spending:.2f} has exceeded your monthly budget of ${budget:.2f}.

    Please review your expenses and adjust your spending accordingly.
    """

    # In production, integrate with email service like SendGrid, Mailgun, etc.
    logger.info(f"Mock email sent to {email}: {subject}")
    print(f"Email sent to {email}: {message}")  # Console output for demo


def send_notification_email(email: str, title: str, message: str):
    """Send notification email (mock implementation)"""
    subject = f"Expense Tracker - {title}"

    # In production, integrate with email service
    logger.info(f"Mock notification email sent to {email}: {subject}")
    print(f"Notification email sent to {email}: {message}")  # Console output for demo