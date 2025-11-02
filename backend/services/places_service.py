import requests
from config import config

class PlacesService:
    BASE_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    @staticmethod
    def get_nearby_restaurants(latitude, longitude, radius=3212):
        params = {
            'location': f'{latitude},{longitude}',
            'radius': radius,
            'type': 'restaurant',
            'key': config.GOOGLE_PLACES_API_KEY
        }
        
        try:
            response = requests.get(PlacesService.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'OK':
                return {
                    'error': f"Google Places API error: {data.get('status')}",
                    'message': data.get('error_message', 'Unknown error')
                }
            
            restaurants = []
            for place in data.get('results', []):
                restaurants.append({
                    'place_id': place.get('place_id'),
                    'name': place.get('name'),
                    'latitude': place.get('geometry', {}).get('location', {}).get('lat'),
                    'longitude': place.get('geometry', {}).get('location', {}).get('lng'),
                    'rating': place.get('rating'),
                    'types': place.get('types', []),
                    'vicinity': place.get('vicinity')
                })
            
            return {
                'success': True,
                'count': len(restaurants),
                'restaurants': restaurants
            }
        
        except requests.exceptions.RequestException as e:
            return {
                'error': 'Failed to fetch from Google Places API',
                'details': str(e)
            }

places_service = PlacesService()