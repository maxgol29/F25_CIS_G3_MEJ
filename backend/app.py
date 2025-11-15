from flask import Flask, jsonify
from db.models import db
from routes.api import api_bp, auth_bp, restaurants_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://localhost:5000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
    })
    db.connect()

    app.register_blueprint(api_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(restaurants_bp, url_prefix='/api/restaurants')

    @app.route('/', methods=['GET'])
    def root():
        return jsonify({'message': 'Places API Server Running'}), 200
    
    @app.teardown_appcontext
    def teardown_db(exception):
        db.close()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)