import os
from db.models import db
import qrcode
import io
import base64

class OrderService:
    
    def create_order(self, user_id, business_id, items, subtotal, discount_amount, 
                     tax_amount, processing_fee, total_amount, promo_code=None, promo_id=None, payment_method_id=None): 
        return db.create_order(
            user_id=user_id,
            business_id=business_id,
            items=items,
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            processing_fee=processing_fee,
            total_amount=total_amount,
            payment_method_id=payment_method_id,
            promo_id=promo_id
        )

    def get_order(self, order_id):
        return db.get_order(order_id)

    def get_user_orders(self, user_id, limit=50):
        return db.get_user_orders(user_id, limit)
    
    def get_business_orders(self, business_id, limit=50):
        return db.get_business_orders(business_id, limit)
    
    def update_order_status(self, order_id, new_status):
        return db.update_order_status(order_id, new_status)
    
    def create_payment_method(self, user_id, payment_type, payment_data=None):
        return db.create_payment_method(user_id, payment_type, payment_data)

    def generate_order_qr_code(self, order_id):
        try:
            order_url = f"{os.getenv('API_BASE_URL')}/api/orders/{order_id}"

            qr = qrcode.QRCode(
                version=1, 
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )

            qr.add_data(order_url)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)
            img_base64 = base64.b64encode(img_byte_arr.getvalue()).decode('utf-8')
            return f"data:image/png;base64,{img_base64}"
        except Exception as e:
            raise Exception(f"Failed to generate QR code: {str(e)}")

order_service = OrderService()