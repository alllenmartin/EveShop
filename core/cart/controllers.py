from flask import Flask, jsonify, request
# from flask_cors import CORS
from sqlalchemy.exc import IntegrityError
from core.products import models

app = Flask(__name__)
# CORS(app)
# Sample shopping cart data




cart_contents = {
   
}
def calculate_total_price():
    prices =get_products()
    print(get_products())
    total_price = sum(prices[item] * quantity for item, quantity in cart_contents.items())
    return round(total_price, 2)

def get_products():
    product_results = models.Products.query.all() 

    # serialize model objects into dicts
    products = [
        {
            "id": p.id,
            "name": p.name,
            "price": str(p.price),   
            "description": p.description
        }
        for p in product_results
    ]
    cart_contents = {item["name"]: float(item["price"]) for item in products}
  
    return cart_contents

def list_cart_controller():
    total_price = calculate_total_price()
    return jsonify({
        'cart_contents': cart_contents,
        'total_price': total_price,
    })

def create_view_cart_controller():
    try:
       request_form = request.form.to_dict() 
       item = request_form['item']
       quantity = request_form['quantity']
       cart_contents[item] = cart_contents.get(item, 0) + int(quantity)
       total_price = calculate_total_price()      
       

    except IntegrityError as e:
         return jsonify({"error": str(e)}), 500
    
         # Other Role Backs
    
    except Exception as e:
         return jsonify({"error": str(e)}), 500
    
   
    return jsonify({
        'cart_contents': cart_contents,
        'total_price': total_price,
    })