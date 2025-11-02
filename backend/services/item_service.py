from db.models import db

class ItemService:
    @staticmethod
    # def get_top_items(limit=100):
    #     return db.get_all_items(limit=limit)
    
    def get_all_items(self):
        return db.get_all_items()
    
    @staticmethod
    def create_item(image_url, dish_name, food_type=None, ingredients=None, portion_size=None, nutritional_profile=None, cooking_method=None):
        return db.add_item(image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method)

item_service = ItemService()