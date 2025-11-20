import logging
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services.address_service import address_service
from services.promo_code_service import promo_code_service
from services.business_service import business_service
from services.places_service import places_service
from services.review_service import review_service
from services.item_service import item_service
from services.user_service import user_service
from services.role_service import role_service
from services.auth_user_service import auth_user_service
import traceback


api_bp = Blueprint('api', __name__)
CORS(api_bp)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

#health check endpoint
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
    

#items endpoints
@api_bp.route('/items', methods=['GET'])
def get_items():
    try:
        limit = request.args.get('limit', type=int)
        business_id = request.args.get('business_id', type=int)
        google_place_id = request.args.get('google_place_id', type=str)
        category = request.args.get('category', type=str)

        result = item_service.get_all_items(limit=limit, business_id=business_id, google_place_id=google_place_id, category=category)
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


#reviews endpoints

@api_bp.route('/reviews', methods=['GET'])
def get_reviews():
    try:
        limit = request.args.get('limit', type=int)
        result = review_service.get_all_reviews(limit=limit)
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
    
#user endpoints

@api_bp.route('/users', methods=['GET'])
# def get_users():
#     try:
#         limit = request.args.get('limit', type=int)
#         result = user_service.get_all_users(limit=limit)
#         return jsonify({
#             'count': len(result),
#             'users': [dict(user) for user in result]
#         }), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
    

@api_bp.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.get_json()

        if not data or 'last_name' not in data or 'email' not in data:
            return jsonify({'error': 'Missing last_name or email'}), 400

        user_service.create_user(
            last_name=data.get('last_name'),
            email=data.get('email')
        )

        return jsonify({'message': 'User added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    try:
        user = user_service.get_user_details(user_id)
        return jsonify(user), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Error fetching user by ID: {e}", exc_info=True)
        return jsonify({'error': 'Failed to fetch user details'}), 500
    
#business endpoints

@api_bp.route('/businesses', methods=['GET'])
def get_businesses():
    try:
        limit = request.args.get('limit', type=int)
        result = business_service.get_all_businesses(limit=limit)
        return jsonify({
            'count': len(result),
            'businesses': [dict(business) for business in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/businesses', methods=['POST'])
def add_business():
    try:
        data = request.get_json()

        if not data or 'name' not in data or 'type' not in data or 'location' not in data:
            return jsonify({'error': 'Missing name, type, or location'}), 400
        business_service.create_business(
            name=data.get('name'),
            type=data.get('type'),
            location=data.get('location')
        )

        return jsonify({'message': 'Business added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#promo code endpoints

@api_bp.route('/promo_codes', methods=['GET'])
def get_promo_codes():
    try:
        limit = request.args.get('limit', type=int)
        result = promo_code_service.get_all_promo_codes(limit=limit)
        return jsonify({
            'count': len(result),
            'promo_codes': [dict(promo_code) for promo_code in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api_bp.route('/promo_codes', methods=['POST'])
def add_promo_code():
    try:
        data = request.get_json()

        if not data or 'name' not in data or 'description' not in data:
            return jsonify({'error': 'Missing name or description'}), 400

        promo_code_service.create_promo_code(
            name=data.get('name'),
            description=data.get('description')
        )

        return jsonify({'message': 'Promo code added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

#address endpoints

@api_bp.route('/addresses', methods=['GET'])
def get_addresses():
    try:
        limit = request.args.get('limit', type=int)
        result = address_service.get_all_addresses(limit=limit)
        return jsonify({
            'count': len(result),
            'addresses': [dict(address) for address in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_bp.route('/addresses', methods=['POST'])
def add_address():
    try:
        data = request.get_json()

        if not data or 'street' not in data:
            return jsonify({'error': 'Missing street'}), 400

        address_service.create_address(
            street=data.get('street'),
            city=data.get('city'),
            state=data.get('state'),
            zip=data.get('zip')
        )

        return jsonify({'message': 'Address added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


#role endpoints

@api_bp.route('/roles', methods=['GET'])
def get_roles():
    try:
        limit = request.args.get('limit', type=int)
        result = role_service.get_all_roles(limit=limit)
        return jsonify({
            'count': len(result),
            'roles': [dict(role) for role in result]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@api_bp.route('/roles', methods=['POST'])
def add_role():
    try:
        data = request.get_json()

        if not data or 'name' not in data:
            return jsonify({'error': 'Missing name'}), 400

        role_service.create_role(
            name=data.get('name')
        )

        return jsonify({'message': 'Role added successfully'}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# new APIs for authentication can be added here
    
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        user_type = data.get('user_type', 'customer')
        business_id = data.get('business_id')
        user = auth_user_service.signup(
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            password=data.get('password'),
            address=data.get('address', {}),
            user_type=user_type,  
            business_id=business_id  
        ) 
        return jsonify({'message': 'User created successfully', 'user': user}), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Signup error: {e}", exc_info=True)
        return jsonify({'error': 'Signup failed'}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = auth_user_service.login(data.get('email'), data.get('password'))
        return jsonify({'message': 'Login successful', 'user': user}), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        return jsonify({'error': 'Login failed'}), 500
    
@auth_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = auth_user_service.get_user_details(user_id)
        return jsonify({
            'success': True,
            'user': user 
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Get user error: {e}")
        return jsonify({'error': 'Failed to fetch user'}), 500

# Restaurants adding to db

restaurants_bp = Blueprint('restaurants', __name__, url_prefix='/api/restaurants')

@restaurants_bp.route('/save-from-places', methods=['POST'])
def save_business_from_places():
    try:
        data = request.get_json()
        businesses = data.get('restaurants', []) if data else []

        result = business_service.save_businesses_from_places(businesses)
        
        return jsonify({
            'message': 'Businesses processed',
            'saved': result['saved'],
            'skipped': result['skipped'],
            'errors': result['errors']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Failed to save businesses", exc_info=True)
        return jsonify({
            'error': 'Failed to save businesses',
            'details': str(e)
        }), 500

@restaurants_bp.route('/get-all', methods=['GET'])
def get_all_restaurants():
    try:
        limit = request.args.get('limit', default=None, type=int)
        restaurants = business_service.get_all_restaurants_service(limit)
        
        return jsonify({
            'count': len(restaurants),
            'restaurants': restaurants
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to fetch restaurants',
            'details': str(e)
        }), 500
    


@restaurants_bp.route('/<int:business_id>', methods=['GET'])
def get_business_details(business_id):
    try:
        business = business_service.get_business_by_id(business_id)
        
        return jsonify({
            'success': True,
            'business': business
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch business',
            'details': str(e)
        }), 500


@restaurants_bp.route('/<int:business_id>/items', methods=['GET'])
def get_business_items(business_id):
    try:
        items = business_service.get_items_by_business_id(business_id)
        
        return jsonify({
            'success': True,
            'count': len(items),
            'items': items
        }), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch items',
            'details': str(e)
        }), 500