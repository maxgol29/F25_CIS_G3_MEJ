import requests
from config import config
from concurrent.futures import ThreadPoolExecutor, as_completed

class PlacesService:
    BASE_URL_NEARBY = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    BASE_URL_DETAILS = "https://maps.googleapis.com/maps/api/place/details/json"
    
    @staticmethod
    def _get_place_details(place):
        try:
            detail_response = requests.get(
                PlacesService.BASE_URL_DETAILS,
                params={
                    'place_id': place['place_id'],
                    'fields': 'name,place_id,rating,user_ratings_total,geometry,photos,vicinity,opening_hours,website,international_phone_number',
                    'key': config.GOOGLE_PLACES_API_KEY
                },
                timeout=1
            )
            detail_response.raise_for_status()
            detail_data = detail_response.json()
            
            if detail_data.get('status') == 'OK':
                result = detail_data['result']
                photos = []
                for photo in result.get('photos', [])[:1]:
                    photos.append(f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=200&photo_reference={photo['photo_reference']}&key={config.GOOGLE_PLACES_API_KEY}")
                
                return {
                    'name': result.get('name'),
                    'place_id': result.get('place_id'),
                    'rating': result.get('rating'),
                    'user_ratings_total': result.get('user_ratings_total', 0),
                    'vicinity': result.get('vicinity'),
                    'phone': result.get('international_phone_number'),
                    'website': result.get('website'),
                    'geometry': {
                        'location': {
                            'lat': result['geometry']['location']['lat'],
                            'lng': result['geometry']['location']['lng']
                        }
                    },
                    'opening_hours': result.get('opening_hours', {}),
                    'photos': photos
                }
        except:
            pass
        
        return None
    
    @staticmethod
    def get_nearby_businesses(latitude, longitude, radius=3200, place_type="restaurant"):
        try:
            api_key = config.GOOGLE_PLACES_API_KEY
            
            response = requests.get(
                PlacesService.BASE_URL_NEARBY,
                params={
                    "location": f"{latitude},{longitude}",
                    "radius": radius,
                    "type": place_type,
                    "key": api_key
                },
                timeout=1
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('status') != 'OK':
                return {'error': data.get('error_message', 'API error')}
            
            places = sorted(data.get('results', []), key=lambda x: x.get('rating', 0), reverse=True)[:20]
            detailed_places = []
            
            with ThreadPoolExecutor(max_workers=10) as executor:
                futures = [executor.submit(PlacesService._get_place_details, place) for place in places]
                
                for future in as_completed(futures):
                    result = future.result()
                    if result:
                        detailed_places.append(result)
            
            return {'success': True, 'places': detailed_places}
        
        except Exception as e:
            return {'error': str(e)}
places_service = PlacesService()