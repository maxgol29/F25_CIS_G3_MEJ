from db.models import db

class AuthUserService:
    def signup(self, first_name, last_name, email, phone, password, address, user_type='customer', business_id=None): 
        if not all([first_name, last_name, email, password]): 
            raise ValueError("Missing user fields")
        if len(password) < 6:
            raise ValueError("Password too short")
        if '@' not in email or '.' not in email:
            raise ValueError("Invalid email format")
        required_keys = ['street', 'zip_code', 'city', 'country']
        if not all(k in address and address[k] for k in required_keys):
            raise ValueError("Incomplete address data")        
        if user_type not in ['customer', 'owner']:
            raise ValueError("Invalid user_type. Must be 'customer' or 'owner'")
        if user_type == 'owner' and not business_id:
            raise ValueError("Business ID is required for owner signup")     
        return db.signup( first_name=first_name, last_name=last_name, email=email, phone=phone, password=password, address=address, user_type=user_type, business_id=business_id)
    def login(self, email, password):
        if not email or not password:
            raise ValueError("Missing credentials")
        return db.login(email, password)

    def get_user_details(self, user_id):
        return db.get_user_details(user_id)
    
    def request_address_change(self, user_id, textRequest):
        return db.request_address_change(user_id, textRequest)

auth_user_service = AuthUserService()
