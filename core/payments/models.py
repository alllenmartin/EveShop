import uuid
from sqlalchemy.dialects.postgresql import UUID
from marshmallow import validates
from core import db

class Payments(db.Model):
    __tablename__ = "payments"
    id = db.Column(db.Integer, primary_key=True)
    # order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    payment_amount = db.Column(db.Float)
    payment_date = db.Column(db.DateTime)
    payment_method = db.Column(db.String)
    status = db.Column(db.String)
    transaction_id = db.Column(db.String)

    @validates("payment_amount")
    def validate_payment_amount(self, key, payment_amount):
        if payment_amount < 0:
            raise ValueError("Payment amount cannot be negative")
        return payment_amount
    
class MpesaTransaction(db.Model):
    __tablename__ = "mpesa_transactions"

    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    amount = db.Column(db.Float, nullable=False)
    receipt = db.Column(db.String(50), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    trans_time = db.Column(db.String(20), nullable=False)  # YYYYMMDDHHMMSS
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def to_dict(self):
        return {
            "id": self.id,
            "amount": self.amount,
            "receipt": self.receipt,
            "phone": self.phone,
            "trans_time": self.trans_time,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }