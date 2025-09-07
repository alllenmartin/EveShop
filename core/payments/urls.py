from flask import request
from .controllers import get_access_token,get_mpesa_transactions,initiate_MPESA_push
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