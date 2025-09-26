from core import db
from flask_login import UserMixin
from sqlalchemy import inspect
from datetime import datetime
from marshmallow import Schema, fields
import uuid
from sqlalchemy.dialects.postgresql import UUID

class Products(db.Model, UserMixin):
    __tablename__ = 'products'
  
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    name = db.Column(db.String,unique=True,nullable=False)
    description = db.Column(db.String,nullable=False)
    price = db.Column(db.Numeric(precision=10,scale=2),nullable=False) 
    quantity = db.Column(db.Integer)
    category_id = db.Column(UUID(as_uuid=True), db.ForeignKey('categories.id'))
    image = db.Column(db.String, nullable=True)
    rating = db.Column(db.Integer, default=0, nullable=False)
    # order_items = db.relationship("OrderItems", backref="product", lazy=True)
    # cart_items = db.relationship("CartItems", backref="cart_product", lazy=True)
    created_at = db.Column(db.DateTime, nullable=False)
    
    
   
    
    def __init__(self,name,description,price,quantity,category_id):
        self.created_at = datetime.now()
        self.name = name
        self.description= description
        self.price = price
        self.quantity = quantity
        self.category_id = category_id
       
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'price': self.price,
            'quantity': self.quantity,
            "category": self.category.name if self.category else None,
            'rating': self.rating,
            'image': self.image,  
            'created_at':self.created_at
        }
        
    def __repr__(self):
        return f"<product {self.name}>"
    
class ProductSchema(Schema):
    name = fields.String(required=True)
    description= fields.String(required=True) 
    price = fields.Float(required=True)
    quantity = fields.Integer(required=True)
    category_id = fields.String(required=True)
  

