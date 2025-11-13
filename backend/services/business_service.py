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
        
        return db.get_all_restaurants(limit)

business_service = BusinessService()