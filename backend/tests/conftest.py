import pytest
import sys
import os
from dotenv import load_dotenv

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

load_dotenv()

@pytest.fixture
def app():
    from app import create_app
    from db.models import db
    
    app = create_app()
    
    with app.app_context():
        db.connect()
        yield app
        db.close()

@pytest.fixture
def client(app):
    return app.test_client()