from flask import request


from app import app
from .controllers import list_all_user_controller,create_user_controller
# list_all_userinfo_controller,create_userinfo_controller

@app.route("/accounts", methods=['GET', 'POST'])
def list_user_accounts():
    if request.method == 'GET': return list_all_user_controller()
    if request.method == 'POST': return create_user_controller()
    else: return 'Method is Not Allowed'

# @app.route("/info", methods=['GET', 'POST'])    
# def list_userinfo_accounts():
#     if request.method == 'GET': return list_all_userinfo_controller()
#     if request.method == 'POST': return create_userinfo_controller()
#     else: return 'Method is Not Allowed'