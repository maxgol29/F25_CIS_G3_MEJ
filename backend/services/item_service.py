from db.models import db

class ItemService:
    
    def get_all_items(self, limit=None, business_id=None, google_place_id=None, category=None):
        return db.get_all_items(limit=limit, business_id=business_id, google_place_id=google_place_id, category=category)

    def create_item(self, image_url, dish_name, food_type=None, ingredients=None, portion_size=None, nutritional_profile=None, cooking_method=None):
        return db.add_item(image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method)

item_service = ItemService()