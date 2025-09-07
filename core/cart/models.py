from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from core import db
import uuid

class Carts(db.Model):
    __tablename__ = "carts"
    id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="pending")
    # cart_items = db.relationship("CartItem", backref="cart", lazy=True)

    def __repr__(self):
        return f"Cart(id={self.id})"


# class CartItem(db.Model):
#     __tablename__ = "cartitems"
#     id = db.Column(UUID(as_uuid=True),nullable=False, primary_key=True,default=uuid.uuid4)
#     cart_id = db.Column(UUID(as_uuid=True), db.ForeignKey("carts.id"), nullable=False)
#     product_id = db.Column(UUID(as_uuid=True), db.ForeignKey("products.id"), nullable=False)
#     quantity = db.Column(db.Integer, nullable=False)
#     product = db.relationship("Product", backref=db.backref("cart_items_rel", lazy="dynamic")
#     )

#     def __repr__(self):
#         return f"CartItem(cart_id={self.cart_id}, product_id={self.product_id}, quantity={self.quantity})"