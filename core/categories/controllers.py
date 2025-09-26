from flask import Blueprint
from flask import request, jsonify
from sqlalchemy.exc import DataError,IntegrityError
import psycopg2
from marshmallow import ValidationError

from core import db
from .models import Category,CategorySchema

category_schema = CategorySchema()
categories_bp = Blueprint("categories", __name__)

# --------------------------
# LIST All categories
# --------------------------   
def list_all_category_controller():
    category = Category.query.all()
    return jsonify([c.to_dict() for c in category])

# --------------------------
# CREATE categories
# --------------------------   
def create_category_controller():
    try:
        request_form = request.form.to_dict()  or request.get_json()
        try:
           data = category_schema.load(request_form)
        except ValidationError as err:
             return jsonify(err.messages), 400
        
        if request_form['name'] == ''  or request_form['description'] == '':
            return jsonify({"error": "Missing required fields"}), 400

        new_category = Category(**data)
        db.session.add(new_category)
        db.session.commit()
        
    except IntegrityError as e:
        db.session.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            return jsonify({
                "error": f"Category with the name '{request_form['name']}' already exists."
            }), 400
        return jsonify({"error": str(e)}), 500
    
    # Other Role Backs
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    # response = Category.query.get(new_account.id)
    
    # return jsonify(response)

    return jsonify({
    "success": True,
    "message": "Product created successfully!",
    "data": {
        "id": new_category.id,
        "name": new_category.name,
        "description": new_category.description
     }
      })
    
# --------------------------
# EDIT categories
# --------------------------     
def update_category_controller(category_id):
    try:
        request_form = request.form.to_dict() or request.get_json()

        category = Category.query.get(category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404

        for key, value in request_form.items():
            setattr(category, key, value)

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": "Category updated successfully!",
        "data": category.to_dict()
    })
    
# --------------------------
# DELETE category
# --------------------------
def delete_category_controller(id):
    try:
        category = Category.query.get(id)
        if not category:
            return jsonify({"error": "Product not found"}), 404

        db.session.delete(category)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    return jsonify({
        "success": True,
        "message": f"Product '{category.name}' deleted successfully!"
    })
    

def get_category_by_slug(id):
    category = Category.query.filter_by(id=id).first()
    if category:
        return jsonify({"category": {
            "id": category.id,
            "name": category.name,
            "slug": category.id,
            "description": category.description
        }})
    return jsonify({"error": "Category not found"}), 404