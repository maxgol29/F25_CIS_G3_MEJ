from db.models import db

class AddressService:
    def get_all_addresses(self, limit=None):
        return db.get_all_addresses(limit)

    def create_address(self, street, city, state, zip):
        if not all([street, city, state, zip]):
            raise ValueError('Missing required address fields')       
        return db.add_address(street, city, state, zip)

address_service = AddressService()