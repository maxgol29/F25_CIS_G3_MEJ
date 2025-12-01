from db.models import db

class PromoCodeService:
    def create_promo_code(self, business_id, type_id, code, description, 
                         expiration_date=None, max_uses=None, item_ids=None, is_active=True):
        if item_ids is None:
            item_ids = []
        return db.create_promo_code(
            business_id=business_id,
            type_id=type_id,
            code=code,
            description=description,
            expiration_date=expiration_date,
            max_uses=max_uses,
            item_ids=item_ids,
            is_active=is_active
        )
    
    def get_business_promos(self, business_id):
        return db.get_business_promos(business_id)
    
    def get_business_promo_usage(self, business_id, promo_id):
        return db.get_business_promo_usage(business_id, promo_id)
    
    def get_business_all_promos_usage(self, business_id):
        return db.get_business_all_promos_usage(business_id)
    
    def validate_promo_code(self, promo_code, subtotal):
        return db.validate_promo_code(promo_code, subtotal)
    
    def get_promo_types(self):
        return db.get_promo_types()

promo_code_service = PromoCodeService()