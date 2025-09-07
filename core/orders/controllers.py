
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
import psycopg2
from marshmallow import ValidationError

from core import db
from .models import Orders,OrderSchema

order_schema =OrderSchema()


# --------------------------
# List All orders
# --------------------------
def list_all_orders_controller():
    orders = Orders.query.all()
    return jsonify([o.to_dict() for o in orders])


# --------------------------
# CREATE order
# --------------------------
def create_order_controller():
     try:
       request_form = request.form.to_dict()       
       try:
          data = order_schema.load(request_form)
          print(data)
       except ValidationError as err:
         return jsonify(err.messages), 400
     
   

  
       new_order = Orders(**data)
       db.session.add(new_order)
       db.session.commit()

     except IntegrityError as e:
        db.session.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            return jsonify({
                "error": f"Category with the name '{request_form['id']}' already exists."
            }), 400
        return jsonify({"error": str(e)}), 500
    
        # Other Role Backs
    
     except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


     return jsonify({
    "success": True,
    "message": "Product created successfully!",
    "data": {
        "id": new_order.id,
        "user id": new_order.user_id,
        "quantity": new_order.quantity,
        "total_amount": new_order.total_amount
     }
      })
     
     
# --------------------------
# EDIT order
# --------------------------     
def update_order_controller(product_id):
    try:
        request_form = request.form.to_dict() or request.get_json()

        order = Orders.query.get(product_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404

        for key, value in request_form.items():
            setattr(order, key, value)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": "Product updated successfully!",
        "data": order.to_dict()
    })
    
# --------------------------
# DELETE order
# --------------------------
def delete_order_controller(id):
    try:
        order = Orders.query.get(id)
        if not order:
            return jsonify({"error": "Product not found"}), 404

        db.session.delete(order)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": f"Product '{order.name}' deleted successfully!"
    })
    