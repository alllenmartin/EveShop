from flask import request
from flask_cors import cross_origin

from app import app
from .controllers import list_all_orders_controller,create_order_controller

@app.route("/api/orders", methods=['GET', 'POST'])
@cross_origin()
def list_order_accounts():
    if request.method == 'GET': return list_all_orders_controller()
    if request.method == 'POST': return create_order_controller()
    else: return 'Method is Not Allowed'