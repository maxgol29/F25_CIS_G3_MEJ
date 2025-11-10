from db.models import db

class UserService:
    def get_all_users(self, limit=None):
        return db.get_all_users(limit)

    def create_user(self, last_name, email):
        if not last_name or not email:
            raise ValueError('Missing last_name or email')
        return db.add_user(last_name, email)
    
    def get_user_details(self, user_id):
        return db.get_user_details(user_id)
user_service = UserService()