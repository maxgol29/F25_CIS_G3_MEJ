from db.models import db
import json
from db.redis_client import redis_client

class BusinessService:

    def save_businesses_from_places(self, businesses): 
        if not businesses:
            raise ValueError("No businesses provided")

        if not isinstance(businesses, list):
            raise ValueError("Businesses must be a list")

        return db.save_businesses_from_places(businesses)
    
    def get_all_businesses_service(self, limit=None):
        businesses = db.get_all_businesses(limit)
        return businesses

    def get_items_by_business_id(self, business_id):

        if business_id is None:
            raise ValueError("Business ID required")
        cache_key = f"business:{business_id}:items"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        items = db.get_items_by_business_id(business_id)
        redis_client.setex(cache_key, 1800, json.dumps(items))
        return items


    def get_business_by_id(self, business_id):
        if not business_id:
            raise ValueError("Business ID required")
        
        business = db.get_business_by_id(business_id)

        
        if not business:
            raise ValueError("Business not found")
        
        return business
    
    def get_business_items_by_popularity(self, business_id):
        cache_key = f"business:{business_id}:items_by_popularity"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        result = db.get_business_items_by_popularity(business_id)
        redis_client.setex(cache_key, 1800, json.dumps(result))
        return result
    
    def get_business_orders_daily(self, business_id):
        cache_key = f"business:{business_id}:orders_daily"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        result = db.get_business_orders_daily(business_id)
        redis_client.setex(cache_key, 300, json.dumps(result))
        return result

    def get_business_income(self, business_id):
        cache_key = f"business:{business_id}:income"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        result = db.get_business_income(business_id)
        return result
    
business_service = BusinessService()
