from db.models import db

class OrderService:
    
    def create_order(self, user_id, business_id, items, subtotal, discount_amount, 
                     tax_amount, processing_fee, total_amount, promo_code=None, promo_id=None): 
        return db.create_order(
            promo_id=promo_id,
            user_id=user_id,
            business_id=business_id,
            items=items,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            processing_fee=processing_fee,
            total_amount=total_amount,
            promo_code=promo_code
        )

    def get_order(self, order_id):
        return db.get_order(order_id)

    def get_user_orders(self, user_id, limit=50):
        return db.get_user_orders(user_id, limit)
    
    def get_business_orders(self, business_id, limit=50):
        return db.get_business_orders(business_id, limit)

order_service = OrderService()