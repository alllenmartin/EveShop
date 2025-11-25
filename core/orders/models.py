from core import db
from flask_login import UserMixin
from sqlalchemy import inspect
from datetime import datetime
from marshmallow import Schema, fields,INCLUDE
from sqlalchemy.dialects.postgresql import JSON
import uuid
from sqlalchemy.dialects.postgresql import UUID
import enum

class OrderStatus(enum.Enum):
    PENDING    = "pending"
    PROCESSING = "processing"
    ON_HOLD    = "on hold"
    CONFIRMED  = "confirmed"
    SHIPPED    = "shipped"
    DELIVERED  = "delivered"
    COMPLETED  = "completed"
    REFUNDED   = "refunded"
    CANCELLED  = "cancelled"
    FAILED     = "failed"
    RETURNED   = "returned"
    

class Orders(db.Model, UserMixin):
    __tablename__ = 'orders'
  
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    user_id = db.Column(db.String, nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_amount = db.Column(db.Numeric(precision=10,scale=2),nullable=False) 
    quantity = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) 
     # Add all these as optional
    items = db.Column(JSON, nullable=True)
    deliveryMethod = fields.Str(required=False)
    deliveryFee = fields.Float(required=False)
    deliveryDate = fields.Str(required=False)
    deliveryTime = fields.Str(required=False)
    paymentMethod = fields.Str(required=False)
    walletDeduction = fields.Float(required=False)
    remainingPayment = fields.Float(required=False)
    address = fields.Dict(required=False)
    reference = fields.Str(required=False)
    userPhone = fields.Str(required=False)
    total = fields.Float(required=False)
    # payment = db.relationship("Payments", backref="orders", uselist=False)
   
    
    # def __init__(self,user_id,total_amount,quantity):
    #     self.created_at = datetime.now()
    #     self.user_id= user_id
    #     self.total_amount = total_amount
    #     self.quantity = quantity
  
       
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_amount': self.total_amount,
            'quantity': self.quantity,
            'status': self.status.value,
            'created_at':self.created_at
        }
        
    def __repr__(self):
        return f"<product {self.id}>"
    
    
# class OrderItem(db.Model):
#     id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
#     order_id = db.Column(UUID(as_uuid=True), db.ForeignKey("orders.id"), nullable=False)
#     product_id = db.Column(UUID(as_uuid=True), db.ForeignKey("products.id"), nullable=False)
#     quantity = db.Column(db.Integer, nullable=False)

#     def __repr__(self):
#         return f"OrderItem(order_id={self.order_id}, product_id={self.product_id}, quantity={self.quantity})"
    
    

    
class OrderSchema(Schema):
    class Meta:
        unknown = INCLUDE
        
    user_id = fields.String(required=True)
    quantity = fields.Integer(required=True)
    total_amount= fields.Float(required=True)
    
    items = db.Column(JSON, nullable=True)
    deliveryMethod = fields.Str(required=False)
    deliveryFee = fields.Float(required=False)
    deliveryDate = fields.Str(required=False)
    deliveryTime = fields.Str(required=False)
    paymentMethod = fields.Str(required=False)
    walletDeduction = fields.Float(required=False)
    remainingPayment = fields.Float(required=False)
    address = fields.Dict(required=False)
    reference = fields.Str(required=False)
    userPhone = fields.Str(required=False)
    total = fields.Float(required=False)

 
    

    
  

