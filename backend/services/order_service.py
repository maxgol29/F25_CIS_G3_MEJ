from db.models import db

class OrderService:
    
    def create_order(self, user_id, business_id, items, subtotal, discount_amount, 
                     tax_amount, processing_fee, total_amount, promo_code=None):
        return db.create_order(
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

order_service = OrderService()