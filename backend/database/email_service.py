import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

def send_password_reset_email(to_email, reset_url):
    if os.getenv("LOG_PASSWORD_RESET_LINK", "false").lower() == "true":
        logger.info("Password reset link for %s: %s", to_email, reset_url)
        print(f"Password reset link for {to_email}: {reset_url}")
        return

    sender = os.getenv("GMAIL_EMAIL")
    password = os.getenv("GMAIL_APP_PASSWORD")

    message = EmailMessage()
    message["Subject"] = "Passwort zurücksetzen"
    message["From"] = sender
    message["To"] = to_email
    message.set_content(
        f"""Hallo,

du hast eine Passwort-Zurücksetzung angefordert.

Öffne diesen Link, um dein Passwort zurückzusetzen:
{reset_url}

Der Link ist nur zeitlich begrenzt gültig.
"""
    )

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(sender, password)
        smtp.send_message(message)
