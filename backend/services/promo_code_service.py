# ======== NOT EXECUTED YET ==========
from db.models import db

class PromoCodeService:
    def get_all_promo_codes(self, limit=None):
        return db.get_all_promo_codes(limit)

    def create_promo_code(self, name, description):
        if not name or not description:
            raise ValueError('Missing name or description')
        return db.add_promo_code(name, description)

promo_code_service = PromoCodeService()
# =========================================