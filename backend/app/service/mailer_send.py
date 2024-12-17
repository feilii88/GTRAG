from mailersend import emails

from app.config import constants

class MailerSend:
    def __init__(self):
        self.mailer = emails.NewEmail(constants.MAILERSEND_API_KEY)

    def signup_mailer(self, customer_email, verify_token):
        signup_link = f"{constants.FRONTEND_URL}register/callback?token={verify_token}&email={customer_email}"

        mail_body = {"signup_link": signup_link}
        mail_from = {
            "name": "GTRAG",
            "email": "info@gtrag.com",
        }
        recipients = [
            {
                "email": customer_email,
            }
        ]
        personalization = [
            {
                "email": customer_email,
                "data": {
                    "verify_id": signup_link
                }
            }
        ]
        self.mailer.set_mail_from(mail_from, mail_body)
        self.mailer.set_mail_to(recipients, mail_body)
        self.mailer.set_subject("Please verify your email", mail_body)
        self.mailer.set_template(constants.EMAIL_TEMPLATE_SIGNUP, mail_body)
        self.mailer.set_personalization(personalization, mail_body)
        response = self.mailer.send(mail_body)