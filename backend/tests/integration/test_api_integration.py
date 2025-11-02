import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db.models import db

class TestAPIIntegration:
    
    def test_health_check(self, client):
        response = client.get('/api/health')
        assert response.status_code == 200
        assert response.get_json()['status'] == 'healthy'
    
    def test_add_item(self, client):
        payload = {
            'image_url': 'https://example.com/image.jpg',
            'dish_name': 'Pasta Carbonara',
            'food_type': 'Italian',
            'cooking_method': 'Boiling'
        }
        response = client.post('/api/items', json=payload)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Item added successfully'
    
    def test_top_items(self, client):
        response = client.get('/api/items')
        assert response.status_code == 200
        data = response.get_json()
        assert 'count' in data
        assert 'items' in data
        assert data['count'] > 0 
    
    def test_add_review(self, client):
        payload = {
            'review_text': 'Great food and service!',
            'label': '1'
        }
        response = client.post('/api/reviews', json=payload)
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['message'] == 'Review added successfully'
    
    def test_add_review_invalid_label(self, client):
        payload = {
            'review_text': 'Some review',
            'label': '5'
        }
        response = client.post('/api/reviews', json=payload)
        
        assert response.status_code == 400
        assert 'Label must be 0, 1, or 2' in response.get_json()['error']
    
    def test_top_reviews(self, client):
        response = client.get('/api/reviews')
        assert response.status_code == 200
        data = response.get_json()
        assert 'count' in data
        assert 'reviews' in data
        assert data['count'] > 0 