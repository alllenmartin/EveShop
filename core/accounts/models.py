
from time import timezone
from core import db,bcrypt,mail
from flask_login import UserMixin
from sqlalchemy import inspect
from datetime import datetime, timedelta, timezone
import pyotp
import uuid
from sqlalchemy.dialects.postgresql import UUID
from marshmallow import Schema, fields,ValidationError

    
class User(db.Model, UserMixin):
    __tablename__ = "users"
    
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    full_name = db.Column(db.String(100), nullable=False)
    email_or_phone = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    otp = db.Column(db.String(6))
    otp_expiry =  db.Column(db.DateTime(timezone=True))
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, nullable=False)
    
    
        
    

    def set_password(self,password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
   

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def __init__(self, full_name, email_or_phone, password):
       self.full_name = full_name
       self.email_or_phone = email_or_phone
       self.set_password(password)
       self.created_at = datetime.now(timezone.utc)

    
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
            'name': self.full_name,
            'email': self.email,
            'mobile': self.email_or_phone,
            'created_at':self.created_at,
          
            
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
        

        
        

  


