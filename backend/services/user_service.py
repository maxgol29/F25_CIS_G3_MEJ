# ======== NOT EXECUTED YET ==========
from db.models import db

class UserService:
    def get_all_users(self, limit=None):
        return db.get_all_users(limit)

    def create_user(self, first_name, last_name, email):
        if not first_name or not last_name or not email:
            raise ValueError('Missing first_name, last_name, or email')
        if not isinstance(email, str) or '@' not in email:
            raise ValueError('Invalid email format')
    
    def get_user_details(self, user_id):
        return db.get_user_details(user_id)
    
user_service = UserService()
# =========================================