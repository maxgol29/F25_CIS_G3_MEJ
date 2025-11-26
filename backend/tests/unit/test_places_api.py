import sys
import os
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.places_service import places_service

class TestPlacesService:
    
    @patch('services.places_service.requests.get')
    def test_get_nearby_restaurants_success(self, mock_get):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'status': 'OK',
            'results': [
                {
                    'place_id': '12345',
                    'name': 'Test Restaurant',
                    'geometry': {'location': {'lat': 29.4241, 'lng': -98.4936}},
                    'rating': 4.5,
                    'types': ['restaurant'],
                    'vicinity': 'San Antonio, TX'
                }
            ]
        }
        mock_get.return_value = mock_response
        
        result = places_service.get_nearby_restaurants(29.4241, -98.4936)
        
        assert result['success'] is True
        assert result['count'] == 1
        assert result['restaurants'][0]['name'] == 'Test Restaurant'
        assert result['restaurants'][0]['place_id'] == '12345'
        assert result['restaurants'][0]['rating'] == 4.5

        mock_get.assert_called_once()
        call_args = mock_get.call_args
        assert 'location=29.4241,-98.4936' in call_args[0][0] or 'location' in call_args[1].get('params', {})    
    @patch('services.places_service.requests.get')
    def test_get_nearby_restaurants_api_error(self, mock_get):
        mock_response = MagicMock()
        mock_response.json.return_value = {
            'status': 'ZERO_RESULTS'
        }
        mock_get.return_value = mock_response

        result = places_service.get_nearby_restaurants(29.4241, -98.4936)

        assert 'error' in result
