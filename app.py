from core import create_app

app = create_app()  # Will use FLASK_CONFIG env var or 'development' by default

# Applications Routes
from core.products import urls
from core.accounts import urls
from core.categories import urls
from core.products import urls
from core.orders import urls
from core.cart import urls
from core.payments import urls

@app.route('/')
def hello():
    return "Hello World!"

if __name__ == "__main__":
    app.run()