from flask import request


from app import app
from .controllers import create_view_cart_controller,list_cart_controller


@app.route("/cart", methods=['GET', 'POST'])
def cart_details():
    if request.method == 'GET': return list_cart_controller()
    if request.method == 'POST': return create_view_cart_controller()
    else: return 'Method is Not Allowed'