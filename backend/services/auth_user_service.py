from db.models import db

class AuthUserService:
    def signup(self, first_name, last_name, email, phone, password, address):
        if not all([first_name, last_name, email, password]):
            raise ValueError("Missing user fields")
        if len(password) < 6:
            raise ValueError("Password too short")
        if '@' not in email or '.' not in email:
            raise ValueError("Invalid email format")
        if not all(k in address for k in ['street', 'zip_code', 'city', 'country']):
            raise ValueError("Incomplete address data")
        return db.signup(first_name, last_name, email, phone, password, address)

    def login(self, email, password):
        if not email or not password:
            raise ValueError("Missing credentials")
        return db.login(email, password)

    def get_user_details(self, user_id):
        return db.get_user_details(user_id)

auth_user_service = AuthUserService()
