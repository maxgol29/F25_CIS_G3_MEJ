import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

class TestAPIIntegration:

    # Health check endpoint
    
    def test_health_check(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200
        assert response.get_json()['status'] == 'healthy'

    # # Items endpoints
    
    # def test_add_item(self, client):
    #     payload = {
    #         'image_url': 'https://example.com/image.jpg',
    #         'dish_name': 'Pasta Carbonara',
    #         'food_type': 'Italian',
    #         'cooking_method': 'Boiling'
    #     }
    #     response = client.post('/api/items', json=payload)
        
    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Item added successfully'
    
    # def test_all_items(self, client):
    #     response = client.get('/api/items?limit=100')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'items' in data
    #     assert isinstance(data['items'], list)
    #     assert data['count'] >= 0
    #     assert len(data['items']) <= 100

    # def test_add_item_missing_dish_name(self, client):

    #     payload = {
    #         'image_url': 'https://example.com/image.jpg',
    #         'food_type': 'Italian',
    #         'cooking_method': 'Boiling'
    #     }
    #     response = client.post('/api/items', json=payload)
        
    #     assert response.status_code == 400
    #     assert 'Missing dish_name' in response.get_json()['error']

    
    # # Reviews endpoints

    # def test_add_review(self, client):
    #     payload = {
    #         'review_text': 'Great food and service!',
    #         'label': '1'
    #     }
    #     response = client.post('/api/reviews', json=payload)
        
    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Review added successfully'
    
    # def test_add_review_invalid_label(self, client):
    #     payload = {
    #         'review_text': 'Some review',
    #         'label': '5'
    #     }
    #     response = client.post('/api/reviews', json=payload)
        
    #     assert response.status_code == 400
    #     assert 'Label must be 0, 1, or 2' in response.get_json()['error']
    
    # def test_all_reviews(self, client):
    #     response = client.get('/api/reviews?limit=100')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'reviews' in data
    #     assert isinstance(data['reviews'], list)
    #     assert data['count'] >= 0
    #     assert len(data['reviews']) <= 100

    # # Users endpoints

    # def test_all_users(self, client):
    #     response = client.get('/api/users?limit=50')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'users' in data
    #     assert isinstance(data['users'], list)
    #     assert data['count'] >= 0
    #     assert len(data['users']) <= 50

    # def test_add_user(self, client):
    #     payload = {
    #         'last_name': 'Doe',
    #         'email': 'testuser@example.com'
    #     }
    #     response = client.post('/api/users', json=payload)

    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'User added successfully'


    # def test_add_user_missing_last_name(self, client):
    #     payload = {
    #         'email': 'testuser@example.com'
    #     }
    #     response = client.post('/api/users', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing last_name or email' in response.get_json()['error']


    # def test_add_user_missing_email(self, client):
    #     payload = {
    #         'last_name': 'testuser'
    #     }
    #     response = client.post('/api/users', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing last_name or email' in response.get_json()['error']

    # # Businesses endpoints

    # def test_all_businesses(self, client):
    #     response = client.get('/api/businesses?limit=50')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'businesses' in data
    #     assert isinstance(data['businesses'], list)
    #     assert data['count'] >= 0
    #     assert len(data['businesses']) <= 50
    
    # def test_add_business(self, client):
    #     payload = {
    #         'name': 'Test Business',
    #         'type': 'Restaurant',
    #         'location': '123 Test St, Test City, TS',
    #     }
    #     response = client.post('/api/businesses', json=payload)

    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Business added successfully'
    
    # def test_add_business_missing_name(self, client):
    #     payload = {
    #         'type': 'Restaurant',
    #         'location': '123 Test St, Test City, TS',
    #     }
    #     response = client.post('/api/businesses', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing name, type, location, or phone' in response.get_json()['error']

    # # promo_code endpoints 
    # def test_all_promo_codes(self, client):
    #     response = client.get('/api/promo_codes?limit=50')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'promo_codes' in data
    #     assert isinstance(data['promo_codes'], list)
    #     assert data['count'] >= 0
    #     assert len(data['promo_codes']) <= 50

    # def test_add_promo_code(self, client):
    #     payload = {
    #         'name': 'SAVE20',
    #         'description': '20% off on all items'
    #     }

    #     response = client.post('/api/promo_codes', json=payload)

    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Promo code added successfully'

    # def test_add_promo_code_missing_name(self, client):
    #     payload = {
    #         'description': '20% off on all items'
    #     }
    #     response = client.post('/api/promo_codes', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing name or description' in response.get_json()['error']# address endpoints

    # def test_add_address(self, client):
    #     payload = {
    #         'street': '123 Test St',
    #         'city': 'Testville',
    #         'state': 'TS',
    #         'zip': '12345'
    #     }

    #     response = client.post('/api/addresses', json=payload)

    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Address added successfully'

    # def test_add_address_missing_street(self, client):
    #     payload = {
    #         'city': 'Testville',
    #         'state': 'TS',
    #         'zip': '12345'
    #     }
    #     response = client.post('/api/addresses', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing street' in response.get_json()['error']


    # def test_all_addresses(self, client):
    #     response = client.get('/api/addresses?limit=50')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'addresses' in data
    #     assert isinstance(data['addresses'], list)
    #     assert data['count'] >= 0
    #     assert len(data['addresses']) <= 50

    # # role endpoints

    # def test_all_roles(self, client):
    #     response = client.get('/api/roles?limit=50')
    #     assert response.status_code == 200

    #     data = response.get_json()

    #     assert 'count' in data
    #     assert 'roles' in data
    #     assert isinstance(data['roles'], list)
    #     assert data['count'] >= 0
    #     assert len(data['roles']) <= 50

    # def test_add_role(self, client):
    #     payload = {
    #         'name': 'Test Role'
    #     }
    #     response = client.post('/api/roles', json=payload)

    #     assert response.status_code == 201
    #     data = response.get_json()
    #     assert data['message'] == 'Role added successfully'


    # def test_add_role_missing_name(self, client):
    #     payload = {}
    #     response = client.post('/api/roles', json=payload)
    #     assert response.status_code == 400
    #     assert 'Missing name' in response.get_json()['error']