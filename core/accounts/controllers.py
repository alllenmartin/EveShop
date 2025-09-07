from marshmallow import ValidationError
from flask import Blueprint
from flask import request, jsonify,url_for
from sqlalchemy.exc import IntegrityError
import psycopg2
from core import db
# from core.notifications.mail_utils import generate_token, send_verification_email
from .models import User,UserSchema


user_schema = UserSchema()
accounts_bp = Blueprint("accounts", __name__)

def list_all_user_controller():
    user = User.query.all()
    return jsonify([c.to_dict() for c in user])


def create_user_controller():
    try:
       request_form = request.form.to_dict()       
       try:
          data = user_schema.load(request_form)
       except ValidationError as err:
         return jsonify(err.messages), 400

  
       new_account = User(**data)
       db.session.add(new_account)
       db.session.commit()
       
        # Generate token & send email - To be continued
    #    token = generate_token(new_account.email)
    #    verify_url = url_for("verify_email", token=token, _external=True)
    #    send_verification_email(new_account.email, verify_url)

    except IntegrityError as e:
        db.session.rollback()
        if isinstance(e.orig, psycopg2.errors.UniqueViolation):
            return jsonify({
                "error": f"Category with the name '{request_form['username']}' already exists."
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
        "id": new_account.id,
        "name": new_account.username,
        "token": new_account.secret_token,
         "created at": new_account.created_at
     }
      })
    