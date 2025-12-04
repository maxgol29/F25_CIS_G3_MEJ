import atexit
from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
import os
from db.models import db
from routes.api import api_bp, auth_bp, businesses_bp, orders_bp, promo_codes_bp
from flask_cors import CORS
from datetime import timedelta

def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=15)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["JWT_COOKIE_SECURE"] = os.getenv("JWT_COOKIE_SECURE")
    app.config["JWT_COOKIE_SAMESITE"] = os.getenv("JWT_COOKIE_SAMESITE", "Lax")

    jwt = JWTManager(app)

    CORS(app, resources={
    r"/": {
        "origins": ["http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    },
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
    })
    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(businesses_bp, url_prefix='/api/businesses')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(promo_codes_bp, url_prefix='/api/promo-codes')

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({'message': 'Places API Server Running'}), 200
    
    return app

@atexit.register
def shutdown_pool():
    db.close_pool()

if __name__ == '__main__':
    import os
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
    app.run(
        debug=os.getenv('FLASK_DEBUG', 'False').lower() == 'true',
        host=os.getenv('FLASK_HOST', '127.0.0.1'),
        port=int(os.getenv('FLASK_PORT', '5000'))
    )