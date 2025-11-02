from flask import Blueprint, request, jsonify
from services.places_service import places_service
from services.review_service import review_service
from services.item_service import item_service


api_bp = Blueprint('places', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'}), 200

@api_bp.route('/restaurants', methods=['GET'])
def get_nearby_restaurants():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', default=3212, type=int)
        
        if lat is None or lng is None:
            return jsonify({'error': 'Missing lat or lng parameters'}), 400
        
        result = places_service.get_nearby_restaurants(lat, lng, radius)
        
        if 'error' in result:
            return jsonify(result), 400
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/items', methods=['GET'])
def get_items():
    try:
        result = item_service.get_all_items()
        return jsonify({
            'count': len(result),
            'items': [dict(item) for item in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/items', methods=['POST'])
def add_item():
    try:
        data = request.get_json()
        
        if not data or 'dish_name' not in data:
            return jsonify({'error': 'Missing dish_name'}), 400
        
        image_url = data.get('image_url')
        dish_name = data.get('dish_name')
        food_type = data.get('food_type')
        ingredients = data.get('ingredients')
        portion_size = data.get('portion_size')
        nutritional_profile = data.get('nutritional_profile')
        cooking_method = data.get('cooking_method')

        item_service.create_item(image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method)

        return jsonify({
            'message': 'Item added successfully'
        }), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        result = review_service.get_all_reviews()
        return jsonify({
            'count': len(result),
            'reviews': [dict(review) for review in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    


@api_bp.route('/reviews', methods=['POST'])
def add_review():
    try:
        data = request.get_json()
        
        if not data or 'review_text' not in data or 'label' not in data:
            return jsonify({'error': 'Missing review_text or label'}), 400

        review_service.create_review(
            review_text=data.get('review_text'),
            label=data.get('label')
        )
        
        return jsonify({'message': 'Review added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500