from flask import Flask, send_from_directory
import os
from core import create_app

app = create_app()  # Will use FLASK_CONFIG env var or 'development' by default


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

# Applications Routes
from core.products import urls
from core.accounts import urls
from core.categories import urls
from core.products import urls
from core.orders import urls
from core.cart import urls
from core.payments import urls


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/')
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run()