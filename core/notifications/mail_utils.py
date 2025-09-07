# import logging
# import traceback
# from flask_mail import Message
# from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
# from config import SECRET_KEY
# from core import mail


# # Set up logging configuration
# logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# # Token Serializer
# s = URLSafeTimedSerializer(SECRET_KEY)

# def generate_token(email):
#     """Generate a time-limited token for email verification."""
#     return s.dumps(email, salt="email-confirm")

# def confirm_token(token, expiration=3600):
#     """Validate the token and extract the email if valid."""
#     try:
#         return s.loads(token, salt="email-confirm", max_age=expiration)
#     except SignatureExpired:
#         logging.warning("Verification token expired.")
#         return False  # Token expired
#     except BadSignature:
#         logging.warning("Invalid verification token.")
#         return False  # Token is invalid

# def send_verification_email(to, verify_url):
#     """Send the verification email with a secure link."""
#     try:
#         msg = Message(
#             subject="Verify Your Account",
#             recipients=[to],
#             html=f"""
#             <p>Click the link below to verify your email:</p>
#             <p><a href="{verify_url}">{verify_url}</a></p>
#             """
#         )
#         mail.send(msg)
#         logging.info(f"Verification email sent to {to}.")
#     except Exception as e:
#         logging.error(f"Error sending email to {to}: {str(e)}")
#         logging.error(traceback.format_exc())  # Logs full error traceback