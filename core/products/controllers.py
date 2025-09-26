
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
import psycopg2
from marshmallow import ValidationError

from core import db
from .models import Products,ProductSchema

product_schema =ProductSchema()


# --------------------------
# List All product
# -------------------------- 
def list_all_products_controller():
    products = Products.query.all()
    return jsonify([p.to_dict() for p in products])
  
  
# --------------------------
# CREATE product
# --------------------------     
def create_product_controller():
     try:
       request_form = request.form.to_dict()  or request.get_json()    
       try:
          data = product_schema.load(request_form)
          print(data)
       except ValidationError as err:
         return jsonify(err.messages), 400


       print(data)
       new_product = Products(**data)
       db.session.add(new_product)
       db.session.commit()

     except IntegrityError as e:
        db.session.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            return jsonify({
                "error": f"Product with the name '{request_form['name']}' already exists."
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
        "id": new_product.id,
        "name": new_product.name,
        "created at": new_product.created_at
     }
      })
     
# --------------------------
# EDIT product
# --------------------------     
def update_product_controller(product_id):
    try:
        request_form = request.form.to_dict() or request.get_json()

        product = Products.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        for key, value in request_form.items():
            setattr(product, key, value)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": "Product updated successfully!",
        "data": product.to_dict()
    })
    
# --------------------------
# DELETE product
# --------------------------
def delete_product_controller(id):
    try:
        product = Products.query.get(id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        db.session.delete(product)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": f"Product '{product.name}' deleted successfully!"
    })
    
    
def get_product_by_slug(id):
    product = Products.query.filter_by(id=id).first()
    if product:
        return jsonify(product.to_dict())  # no iteration needed
    return jsonify({"error": "Product not found"}), 404

    