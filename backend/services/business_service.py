from db.models import db

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
        
        return db.get_items_by_business_id(business_id)

    def get_business_by_id(self, business_id):
        if not business_id:
            raise ValueError("Business ID required")
        
        business = db.get_business_by_id(business_id)

        
        if not business:
            raise ValueError("Business not found")
        
        return business
    
    def get_business_items_by_popularity(self, business_id):
        return db.get_business_items_by_popularity(business_id)
    
    def get_business_orders_daily(self, business_id):
        return db.get_business_orders_daily(business_id)

    def get_business_income(self, business_id):
        return db.get_business_income(business_id)
    
business_service = BusinessService()
