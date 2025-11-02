from flask import Flask, jsonify
from db.models import db
from routes.api import api_bp

def create_app():
    app = Flask(__name__)
    db.connect()

    app.register_blueprint(api_bp, url_prefix='/api')
    
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