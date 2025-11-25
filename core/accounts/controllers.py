from datetime import datetime, timedelta,timezone
from flask import Blueprint, request, jsonify, current_app
from flask_mail import Message
from core import db, mail
from .models import User, UserSchema
import secrets
import jwt
import re
SECRET_KEY = "5e3f13c620903283ab1f016826d331990dc913f7141d3a13ad5fa8409393c7d0"

user_schema = UserSchema()
accounts_bp = Blueprint("accounts", __name__)

# Utility: Generate OTP
def generate_otp(length=4):
    """Generate a cryptographically secure numeric OTP."""
    digits = "0123456789"
    return ''.join(secrets.choice(digits) for _ in range(length))

# List all users
def list_all_user_controller():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

# Create new user
# @accounts_bp.route("/register", methods=["POST"])
def create_user_controller():
    data = request.get_json() or request.form.to_dict()

    full_name = data.get("full_name")
    email_or_phone = data.get("email_or_phone")
    password = data.get("password")

    if not all([full_name, email_or_phone, password]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email_or_phone=email_or_phone).first():
        return jsonify({"error": "User already exists"}), 400

    # Create user object
    user = User(full_name=full_name, email_or_phone=email_or_phone,password=password)
   

    # Generate OTP
    user.otp = generate_otp()
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)
    user.is_verified = False

    db.session.add(user)
    db.session.commit()

    # Send OTP
    if re.match(r"[^@]+@[^@]+\.[^@]+", email_or_phone):
        msg = Message(
            "Your OTP Code",
            sender=current_app.config["MAIL_USERNAME"],
            recipients=[email_or_phone]
        )
        msg.body = f"Your OTP is {user.otp}. It will expire in 5 minutes."
        mail.send(msg)
    else:
        # For phone numbers: you can integrate SMS here
        print(f"📱 OTP for {email_or_phone}: {user.otp}")

    return jsonify({"message": "User registered. OTP sent."}), 201


# @accounts_bp.route("/register", methods=["POST"])
def verify_otp():
    data = request.get_json() or request.form.to_dict()
    email_or_phone = data.get("email_or_phone")
    otp = data.get("otp")

    user = User.query.filter_by(email_or_phone=email_or_phone).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.is_verified:
        return jsonify({"message": "User already verified"}), 200

    if user.otp != otp:
        return jsonify({"error": "Invalid OTP"}), 400

    if datetime.now(timezone.utc) > user.otp_expiry:
        return jsonify({"error": "OTP expired"}), 400

    user.is_verified = True
    user.otp = None
    db.session.commit()

    return jsonify({"message": "Verification successful"}), 200

def login_user():
    data = request.get_json() or request.form.to_dict()
    email_or_phone = data.get("email_or_phone")
    password = data.get("password")

    user = User.query.filter_by(email_or_phone=email_or_phone).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_verified:
        return jsonify({"error": "Account not verified. Please verify OTP first."}), 403

     # Generate JWT token (expires in 1 day)
    token_payload = {
        "user_id": str(user.id),
        "email": user.email_or_phone,
        "exp": datetime.now(timezone.utc) + timedelta(days=1)
    }
    token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

    # Return token + user info
    return jsonify({
        "message": f"Welcome {user.full_name}!",
        "token": token,
        "user": {
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email_or_phone
        }
    }), 200
