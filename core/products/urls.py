from flask import request
from flask_cors import cross_origin

from app import app
from .controllers import list_all_products_controller,create_product_controller,update_product_controller,delete_product_controller,get_product_by_slug

@app.route("/products", methods=['GET', 'POST'])
@cross_origin()
def list_product_accounts():
    if request.method == 'GET': return list_all_products_controller()
    if request.method == 'POST': return create_product_controller()
    else: return 'Method is Not Allowed'

@app.route("/products/<id>", methods=['GET', 'POST'])
@cross_origin()
def get_each_product(id):
    if request.method == 'GET': return get_product_by_slug(id)
    # if request.method == 'POST': return create_category_controller()
    else: return 'Method is Not Allowed'
    
@app.route("/products/<uuid:id>", methods=['PUT','DELETE'])
@cross_origin()
def update_product_accounts(id):
   if request.method == 'PUT': return update_product_controller(id)
   if request.method == 'DELETE': return delete_product_controller(id)
   else: return 'Method is Not Allowed'
   
   