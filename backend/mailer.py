import logging
import smtplib
from email.mime.text import MIMEText

from settings import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    subject = "Відновлення пароля OBC"
    body = (
        "Ви запросили відновлення пароля.\n\n"
        f"Перейдіть за посиланням (дійсне обмежений час):\n{reset_link}\n\n"
        "Якщо це були не ви — проігноруйте лист."
    )

    if not settings.smtp_host:
        logger.info("SMTP не налаштовано. Посилання для %s: %s", to_email, reset_link)
        return

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to_email

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        if settings.smtp_user:
            server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.smtp_from, [to_email], msg.as_string())
