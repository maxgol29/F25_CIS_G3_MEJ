import logging
from flask import Blueprint, request, jsonify
from flask_cors import CORS
from services import *

api_bp = Blueprint('api', __name__)
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
orders_bp = Blueprint('orders', __name__, url_prefix='/api/orders')
businesses_bp = Blueprint('businesses', __name__, url_prefix='/api/businesses')
promo_codes_bp = Blueprint('promo', __name__, url_prefix='/api/promo_codes')

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
    
@api_bp.route('/business/<int:business_id>/items/<int:item_id>', methods=['PUT'])
def update_item(business_id, item_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        updated_item = item_service.update_item(business_id, item_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Item updated successfully',
            'item': updated_item
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to update item {item_id} for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to update item',
            'details': str(e)
        }), 500

@api_bp.route('/business/<int:business_id>/items/<int:item_id>', methods=['DELETE'])
def delete_item(business_id, item_id):
    try:
        result = item_service.delete_item(business_id, item_id)
        
        return jsonify({
            'success': True,
            'message': result['message'],
            'deleted_item_id': result['deleted_item_id']
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to delete item {item_id} for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to delete item',
            'details': str(e)
        }), 500

@api_bp.route('/business/<int:business_id>/items', methods=['POST'])
def create_item(business_id):
    try:
        data = request.get_json()        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        required_fields = ['dish_name', 'price']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        created_item = item_service.create_item(business_id, data)
        
        return jsonify({
            'success': True,
            'message': 'Item created successfully',
            'item': created_item
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Failed to create item for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to create item',
            'details': str(e)
        }), 500
    
@api_bp.route('/business/<int:business_id>/items/popular', methods=['GET'])
def get_items_by_popularity(business_id):
    try:
        items = item_service.get_items_by_popularity(business_id)
        
        return jsonify({
            'success': True,
            'business_id': business_id,
            'count': len(items),
            'items': items
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch popular items for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch items',
            'details': str(e)
        }), 500

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

@auth_bp.route('/users/<int:user_id>', methods=['GET'])
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

# businesses adding to db

@businesses_bp.route('/save-from-places', methods=['POST'])
def save_business_from_places():
    try:
        data = request.get_json()
        businesses = data.get('businesses', []) if data else []

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

@businesses_bp.route('/get-all', methods=['GET'])
def get_all_businesses():
    try:
        limit = request.args.get('limit', default=None, type=int)
        businesses = business_service.get_all_businesses_service(limit)
        
        return jsonify({
            'count': len(businesses),
            'businesses': businesses
        }), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to fetch businesses',
            'details': str(e)
        }), 500
    

@businesses_bp.route('/<int:business_id>', methods=['GET'])
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

@businesses_bp.route('/<int:business_id>/items', methods=['GET'])
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

@businesses_bp.route('/business/<int:business_id>/items/popular', methods=['GET'])
def get_business_items_by_popularity(business_id):
    try:
        items = business_service.get_business_items_by_popularity(business_id)
        
        return jsonify({
            'success': True,
            'business_id': business_id,
            'count': len(items),
            'items': items
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch popular items for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch items',
            'details': str(e)
        }), 500

@businesses_bp.route('/business/<int:business_id>/orders/daily', methods=['GET'])
def get_business_orders_daily(business_id):
    try:
        daily_orders = business_service.get_business_orders_daily(business_id)
        
        return jsonify({
            'success': True,
            'business_id': business_id,
            'count': len(daily_orders),
            'daily_orders': daily_orders
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch daily orders for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch daily orders',
            'details': str(e)
        }), 500

@businesses_bp.route('/business/<int:business_id>/income', methods=['GET'])
def get_business_income(business_id):
    try:
        income_data = business_service.get_business_income(business_id)
        
        return jsonify({
            'success': True,
            'business_id': business_id,
            'income': income_data
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch income for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch income data',
            'details': str(e)
        }), 500
    

@orders_bp.route('/create', methods=['POST'])
def create_order():
    try:
        data = request.get_json()

        required_fields = ['userID', 'businessID', 'items', 'subtotal', 'total_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        if not isinstance(data['items'], list) or len(data['items']) == 0:
            return jsonify({'error': 'Items must be a non-empty list'}), 400

        order = order_service.create_order(
            promo_id=data.get('promoID'),
            user_id=data['userID'],
            business_id=data['businessID'],
            items=data['items'],
            subtotal=data['subtotal'],
            discount_amount=data.get('discount_amount', 0),
            tax_amount=data.get('tax_amount', 0),
            processing_fee=data.get('processing_fee', 0),
            total_amount=data['total_amount'],
            promo_code=data.get('promoCode')
        )   
        return jsonify({
            'message': 'Order created successfully',
            'order': order
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Failed to create order", exc_info=True)
        return jsonify({
            'error': 'Failed to create order',
            'details': str(e)
        }), 500


@orders_bp.route('/<int:order_id>', methods=['GET'])
def get_order(order_id):
    try:
        order = order_service.get_order(order_id)
        
        return jsonify({
            'success': True,
            'order': order
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch order {order_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch order',
            'details': str(e)
        }), 500


@orders_bp.route('/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    try:
        limit = request.args.get('limit', default=50, type=int)
        orders = order_service.get_user_orders(user_id, limit)
        
        return jsonify({
            'success': True,
            'count': len(orders),
            'orders': orders
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to fetch orders for user {user_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch orders',
            'details': str(e)
        }), 500

@orders_bp.route('/business/<int:business_id>', methods=['GET'])
def get_business_orders(business_id):
    try:
        limit = request.args.get('limit', default=50, type=int)
        orders = order_service.get_business_orders(business_id, limit)
        
        return jsonify({
            'success': True,
            'count': len(orders),
            'orders': orders
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to fetch orders for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch orders',
            'details': str(e)
        }), 500

# promo code endpoints

@promo_codes_bp.route('/create', methods=['POST'])
def create_promo():
    try:
        data = request.get_json()
        
        required_fields = ['businessID', 'code', 'typeID', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        promo = promo_code_service.create_promo_code(
            business_id=data['businessID'],
            type_id=data['typeID'],
            code=data['code'],
            description=data['description'],
            expiration_date=data.get('expiration_date'),
            max_uses=data.get('max_uses'),
            item_ids=data.get('item_ids', []), 
            is_active=data.get('is_active', True)
        )
        
        return jsonify({
            'message': 'Promo code created successfully',
            'promo': promo
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Failed to create promo code", exc_info=True)
        return jsonify({
            'error': 'Failed to create promo code',
            'details': str(e)
        }), 500
    
@promo_codes_bp.route('/types', methods=['GET'])
def get_promo_types():
    try:
        promo_types = promo_code_service.get_promo_types()
        
        return jsonify({
            'success': True,
            'promo_types': promo_types,
            'count': len(promo_types)
        }), 200
        
    except Exception as e:
        logger.error("Failed to fetch promo types", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch promo types',
            'details': str(e)
        }), 500

@promo_codes_bp.route('/business/<int:business_id>', methods=['GET'])
def get_business_promos(business_id):
    try:
        promos = promo_code_service.get_business_promos(business_id)
        
        return jsonify({
            'success': True,
            'count': len(promos),
            'promos': promos
        }), 200
        
    except Exception as e:
        logger.error(f"Failed to fetch promos for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch promos',
            'details': str(e)
        }), 500

@promo_codes_bp.route('/<int:promo_id>/business/<int:business_id>/usage', methods=['GET'])
def get_business_promo_usage(business_id, promo_id):
    try:
        usage_history = promo_code_service.get_business_promo_usage(business_id, promo_id)
        
        return jsonify({
            'success': True,
            'business_id': business_id,
            'promo_id': promo_id,
            'count': len(usage_history),
            'usage': usage_history
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch promo usage for business {business_id}, promo {promo_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch promo usage',
            'details': str(e)
        }), 500


@promo_codes_bp.route('/business/<int:business_id>/promos/usage', methods=['GET'])
def get_business_all_promos_usage(business_id):
    try:
        usage_history = promo_code_service.get_business_all_promos_usage(business_id)

        return jsonify({
            'success': True,
            'business_id': business_id,
            'count': len(usage_history),
            'usage': usage_history
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 404
    except Exception as e:
        logger.error(f"Failed to fetch all promos usage for business {business_id}", exc_info=True)
        return jsonify({
            'error': 'Failed to fetch promos usage',
            'details': str(e)
        }), 500

@promo_codes_bp.route('/validate', methods=['POST'])
def validate_promo():
    try:
        data = request.get_json()
        
        if not data or 'code' not in data:
            return jsonify({'error': 'Missing promo code'}), 400
        
        if 'subtotal' not in data:
            return jsonify({'error': 'Missing subtotal'}), 400 
        
        promo = promo_code_service.validate_promo_code(data['code'], data['subtotal'])

        return jsonify({
            'promo_id': promo['promo_id'],
            'success': True,
            'discount_amount': promo['discount_amount'],
            'discount_percentage': promo.get('discount_percentage', 0),
            'message': f"Promo applied: ${promo['discount_amount']:.2f} off"
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error("Failed to validate promo code", exc_info=True)
        return jsonify({
            'error': 'Failed to validate promo code',
            'details': str(e)
        }), 500
    
@api_bp.route('/places/nearby-search', methods=['POST'])
def nearby_search():    
    data = request.get_json()
    lat = data.get('latitude') if data else None
    lng = data.get('longitude') if data else None
    radius = data.get('radius', 3200) if data else 3200
    place_type = data.get('type', 'restaurant')
    
    if lat is None or lng is None:
        return jsonify({'error': 'Missing latitude or longitude', 'received': data}), 400
    
    result = places_service.get_nearby_businesses(lat, lng, radius, place_type)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result), 200