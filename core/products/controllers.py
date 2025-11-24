
from flask import request, jsonify
from sqlalchemy.exc import IntegrityError
import psycopg2
from marshmallow import ValidationError

from werkzeug.utils import secure_filename
import os

from core import db
from .models import Products,ProductSchema
from core.categories.models import Category 


product_schema =ProductSchema()

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads")

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
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
        # Form data
        form = request.form.to_dict()

        name = form.get("name")
        description = form.get("description", "")
        price = float(form.get("price", 0))
        rating = float(form.get("rating", 0))
        quantity = int(form.get("quantity", 0))

        if not name:
            return jsonify({"error": "Product name is required"}), 400

        # Handle category (FK)
        category_name = form.get("category")
        category_obj = None

        if category_name:
            category_obj = Category.query.filter_by(name=category_name).first()
            if not category_obj:
                return jsonify({"error": "Category not found"}), 400

        # Handle image upload
        image_filename = None
        if "image" in request.files:
            file = request.files["image"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                image_filename = filename

        # Create product object
        new_product = Products(
            name=name,
            description=description,
            price=price,
            rating=rating,
            quantity=quantity,
            image=image_filename,
            category_id=category_obj.id if category_obj else None,
        )

        db.session.add(new_product)
        db.session.commit()

        # Build response object
        product_data = {
            "id": str(new_product.id),
            "name": new_product.name,
            "description": new_product.description,
            "price": float(new_product.price),
            "quantity": new_product.quantity,
            "category": category_obj.name if category_obj else None,
            "rating": float(new_product.rating),
            "image": new_product.image,
            "created_at": new_product.created_at.isoformat(),
        }

        return jsonify({
            "success": True,
            "message": "Product created successfully!",
            "data": product_data,
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

     
# --------------------------
# EDIT product
# --------------------------     
def update_product_controller(product_id):
    try:
        product = Products.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        # Form data
        form = request.form.to_dict()

        # Update basic fields
        if "name" in form:
            product.name = form["name"]
        if "description" in form:
            product.description = form["description"]
        if "price" in form:
            product.price = float(form["price"]) if form["price"] else 0
        if "rating" in form:
            product.rating = float(form["rating"]) if form["rating"] else 0
        if "quantity" in form:
            product.quantity = int(form["quantity"]) if form["quantity"] else 0

        # Handle category (FK)
        if "category" in form:
            category_name = form["category"]
            category_obj = Category.query.filter_by(name=category_name).first()
            if not category_obj:
                return jsonify({"error": "Category not found"}), 400
            product.category_id = category_obj.id  # assign FK

        # Handle image
        if "image" in request.files:
            file = request.files["image"]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                product.image = filename  # save filename only

        db.session.commit()

        # JSON-safe dict
        product_data = {
            "id": str(product.id),
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "quantity": product.quantity,
            "category": category_obj.name if product.category_id else None,
            "rating": float(product.rating),
            "image": product.image,
            "created_at": product.created_at.isoformat(),
        }

        return jsonify({
            "success": True,
            "message": "Product updated successfully!",
            "data": product_data
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


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

    