from db.models import db

class RoleService:
    def get_all_roles(self, limit=None):
        return db.get_all_roles(limit)

    def create_role(self, name):
        if not all([name]):
            raise ValueError('Missing name')
        return db.add_role(name)

role_service = RoleService()

    