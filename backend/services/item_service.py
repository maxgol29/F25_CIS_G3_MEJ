from db.models import db

class ItemService:
    
    def get_all_items(self, limit=None, business_id=None, google_place_id=None, category=None):
        return db.get_all_items(limit=limit, business_id=business_id, google_place_id=google_place_id, category=category)
     
    def update_item(self, business_id, item_id, data):
        return db.update_item(business_id, item_id, data)

    def delete_item(self, business_id, item_id):
        return db.delete_item(business_id, item_id)
    
    def create_item(self, business_id, data):
        return db.create_item(business_id, data)
    
    def get_items_by_popularity(self, business_id):
        return db.get_items_by_popularity(business_id)

item_service = ItemService()

