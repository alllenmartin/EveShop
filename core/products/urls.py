from flask import request

from app import app
from .controllers import list_all_products_controller,create_product_controller,update_product_controller,delete_product_controller

@app.route("/products", methods=['GET', 'POST'])
def list_product_accounts():
    if request.method == 'GET': return list_all_products_controller()
    if request.method == 'POST': return create_product_controller()
    else: return 'Method is Not Allowed'
    
@app.route("/products/<uuid:id>", methods=['PUT','DELETE'])
def update_product_accounts(id):
   if request.method == 'PUT': return update_product_controller(id)
   if request.method == 'DELETE': return delete_product_controller(id)
   else: return 'Method is Not Allowed'
   
   