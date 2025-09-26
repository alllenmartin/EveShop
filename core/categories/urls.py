from flask import request
from flask_cors import cross_origin

from app import app
from .controllers import list_all_category_controller,create_category_controller,get_category_by_slug

@app.route("/categories", methods=['GET', 'POST'])
@cross_origin()
def list_create_categories():
    if request.method == 'GET': return list_all_category_controller()
    if request.method == 'POST': return create_category_controller()
    else: return 'Method is Not Allowed'
    

@app.route("/categories/<id>", methods=['GET', 'POST'])
@cross_origin()
def get_each_category(id):
    if request.method == 'GET': return get_category_by_slug(id)
    # if request.method == 'POST': return create_category_controller()
    else: return 'Method is Not Allowed'