from flask import request

from app import app
from .controllers import list_all_category_controller,create_category_controller

@app.route("/categories", methods=['GET', 'POST'])
def list_create_categories():
    if request.method == 'GET': return list_all_category_controller()
    if request.method == 'POST': return create_category_controller()
    else: return 'Method is Not Allowed'