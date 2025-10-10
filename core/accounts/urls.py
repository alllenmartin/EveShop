from flask import request
from flask_cors import cross_origin


from app import app
from .controllers import list_all_user_controller,create_user_controller,verify_otp, login_user
# list_all_userinfo_controller,create_userinfo_controller

@app.route("/accounts", methods=['GET', 'POST'])
@cross_origin()
def list_user_accounts():
    if request.method == 'GET': return list_all_user_controller()
    if request.method == 'POST': return create_user_controller()
    else: return 'Method is Not Allowed'

@app.route("/otp", methods=['GET', 'POST'])    
@cross_origin()
def verify_user_authentication():
    # if request.method == 'GET': return list_all_userinfo_controller()
    if request.method == 'POST': return verify_otp()
    else: return 'Method is Not Allowed'
 
@app.route("/login", methods=['GET', 'POST'])    
@cross_origin()    
def loggon_user():
    if request.method == 'POST': return login_user()
    else: return 'Method is Not Allowed'