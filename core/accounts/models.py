
from core import db,bcrypt,mail
from flask_login import UserMixin
from sqlalchemy import inspect
from datetime import datetime
import pyotp
import uuid
from sqlalchemy.dialects.postgresql import UUID
from marshmallow import Schema, fields,ValidationError

    
class User(db.Model, UserMixin):
    __tablename__ = "users"
    
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    verified= db.Column(db.Boolean, default=False)
    is_two_factor_authentication_enabled = db.Column(
        db.Boolean, nullable=False, default=False)
    secret_token = db.Column(db.String, unique=True)

    def __init__(self,password,email):
        # self.username = username
        self.password = bcrypt.generate_password_hash(password)
        self.email = email
        # self.phone=phone
        self.created_at = datetime.now()
        self.secret_token = pyotp.random_base32()

    def get_authentication_setup_uri(self):
        return pyotp.totp.TOTP(self.secret_token).provisioning_uri(
            name=self.username, issuer_name='EVESHOP')

    def is_otp_valid(self, user_otp):
        totp = pyotp.parse_uri(self.get_authentication_setup_uri())
        return totp.verify(user_otp)

    def __repr__(self):
        return f"<user {self.username}>"
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.username,
            'email': self.email,
            'mobile': self.phone,
            'created_at':self.created_at,
            'token':self.secret_token
            
        }
        
def validate_phone(value):
    import re
    if not re.fullmatch(r'^\+?\d{10,15}$', value):
        raise ValidationError("Invalid phone number format.")
        
class UserSchema(Schema):
    username = fields.String(required=True)
    password= fields.String(required=True) 
    email = fields.Email(required=True)  # Marshmallow has built-in email validation
    phone = fields.String(required=True, validate=validate_phone)
        

        
        

  


