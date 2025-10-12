from flask import request
from flask_cors import cross_origin
from .controllers import get_access_token,get_mpesa_transactions,initiate_MPESA_push,add_wallet_transaction,get_transactions
from app import app

@app.route("/get_token", methods=['GET','POST'])
def token():
    if request.method == 'GET': return get_mpesa_transactions()
    if request.method == 'POST': return get_access_token()
    else: return 'Method is Not Allowed'
    
    
@app.route("/initiate_push", methods=['GET','POST'])
def initiate_transaction():
    if request.method == 'GET': return get_mpesa_transactions()
    if request.method == 'POST': return initiate_MPESA_push()
    else: return 'Method is Not Allowed'
  
@app.route("/wallet", methods=['GET','POST'])
@cross_origin()    
def my_wallet_transaction():
    # if request.method == 'GET': return add__wallet_transaction()
    if request.method == 'POST': return add_wallet_transaction()
    else: return 'Method is Not Allowed'
    
@app.route("/wallet/<user_id>/transactions", methods=["GET"])
@cross_origin()
def get_wallet_transactions(user_id):
    if request.method == 'GET': return get_transactions(user_id)
    # if request.method == 'POST': return create_category_controller()
    else: return 'Method is Not Allowed'