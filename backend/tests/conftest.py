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

@pytest.fixture(autouse=True)
def cleanup_user():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "User" WHERE email = %s', ('testuser@example.com',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test user: {e}")
    finally:
        cursor.close()

@pytest.fixture(autouse=True)
def cleanup_item():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Item" WHERE dish_name = %s', ('Pasta Carbonara',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test item: {e}")
    finally:
        cursor.close()


@pytest.fixture(autouse=True)
def cleanup_review():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Review" WHERE review_text = %s', ('Great food and service!',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test review: {e}")
    finally:
        cursor.close()

@pytest.fixture
def  cleanup_business():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Business" WHERE name = %s', ('Test Business',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test business: {e}")
    finally:
        cursor.close()

@pytest.fixture(autouse=True)
def cleanup_promo_code():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Promo_Code" WHERE name = %s', ('SAVE20'))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test promo code: {e}")
    finally:
        cursor.close()

@pytest.fixture(autouse=True)
def cleanup_address():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Address" WHERE street = %s', ('123 Test St',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test address: {e}")
    finally:
        cursor.close()

@pytest.fixture(autouse=True)
def cleanup_role():
    from db.models import db
    try:
        db._ensure_connection()
        cursor = db.conn.cursor()
        cursor.execute('DELETE FROM "Role" WHERE name = %s', ('Test Role',))
        db.conn.commit()
    except Exception as e:
        print(f"Error cleaning up test role: {e}")
    finally:
        cursor.close()