from db.models import db

class BusinessService:
    def get_all_businesses(self, limit=None):
        return db.get_all_businesses(limit)

    def create_business(self, name, type, location):
        if not name or not type or not location:
            raise ValueError('Missing name, type, or location')
        return db.add_business(name, type, location)

    def save_businesses_from_places(self, businesses):
        if not businesses:
            raise ValueError("No businesses provided")

        if not isinstance(businesses, list):
            raise ValueError("Businesses must be a list")

        return db.save_businesses_from_places(businesses)
    
    def get_all_restaurants_service(self, limit=None):
        restaurants = db.get_all_restaurants(limit)
        
        if not restaurants:
            raise ValueError("No restaurants found in database")
        
        return restaurants

    def get_items_by_business_id(self, business_id):

        if not business_id:
            raise ValueError("Business ID required")
        
        return db.get_items_by_business_id(business_id)


    def get_business_by_id(self, business_id):
        if not business_id:
            raise ValueError("Business ID required")
        
        business = db.get_business_by_id(business_id)

        
        if not business:
            raise ValueError("Business not found")
        
        return business

business_service = BusinessService()