from unicodedata import category
import psycopg2
from psycopg2.extras import RealDictCursor
from config import config

class Database:
    def __init__(self):
        self.conn = None

    def connect(self):
        try:
            ssl_mode = 'disable' if config.DB_HOST == 'localhost' else 'require'
            
            self.conn = psycopg2.connect(
                host=config.DB_HOST,
                user=config.DB_USER,
                password=config.DB_PASSWORD,
                database=config.DB_NAME,
                port=config.DB_PORT,
                sslmode=ssl_mode
            )
            print("Database connection successful")
            return self.conn
        except psycopg2.Error as e:
            print(f"Database connection failed: {e}")
            raise
    
    def close(self):
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def _ensure_connection(self):
        if not self.conn:
            self.connect()

    # Item-related database operations
    
    def add_item(self, image_url, dish_name, food_type=None, ingredients=None, portion_size=None, nutritional_profile=None, cooking_method=None):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                '''INSERT INTO "Item" (image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s)''',
                (image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method)
            )
            self.conn.commit()
            print("Item added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting item: {e}")
            raise
        finally:
            cursor.close()

    def get_all_items(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = "SELECT * FROM \"Item\""
            if limit:
                query += f" LIMIT {limit}"
            cursor.execute(query)
            return cursor.fetchall()
        finally:
            cursor.close()

    # Review-related database operations
    
    def add_review(self, review_text, label):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Review" (review_text, label) VALUES (%s, %s)',
                (review_text, label)
            )
            self.conn.commit()
            print("Review added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting review: {e}")
            raise
        finally:
            cursor.close()

    def get_all_reviews(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "Review"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching reviews: {e}")
            raise
        finally:
            cursor.close()

    # User-related database operations

    def add_user(self, last_name, email):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "User" (last_name, email) VALUES (%s, %s)',
                (last_name, email)
            )
            self.conn.commit()
            print("User added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting user: {e}")
            raise
        finally:
            cursor.close()

    def get_all_users(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "User"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching users: {e}")
            raise
        finally:
            cursor.close()

    def get_all_businesses(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "Business"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching businesses: {e}")
            raise
        finally:
            cursor.close()

    def add_business(self, name, type, location):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Business" (name, type, location) VALUES (%s, %s, %s)',
                (name, type, location)
            )
            self.conn.commit()
            print("Business added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting business: {e}")
            raise
        finally:
            cursor.close()

    # PromoCode-related database operations

    def add_promo_code(self, name, description):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Promo_Code" (name, description) VALUES (%s, %s)',
                (name, description)
            )
            self.conn.commit()
            print("Promo code added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting promo code: {e}")
            raise
        finally:
            cursor.close()

    def get_all_promo_codes(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "Promo_Code"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching promo codes: {e}")
            raise
        finally:
            cursor.close()

    #Address-related database operations

    def add_address(self, street, city, state, zip_code):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Address" (street, city, state, zip) VALUES (%s, %s, %s, %s)',
                (street, city, state, zip_code)
            )
            self.conn.commit()
            print("Address added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting address: {e}")
            raise
        finally:
            cursor.close()

    def get_all_addresses(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "Address"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching addresses: {e}")
            raise
        finally:
            cursor.close()

    # Role-related database operations

    def add_role(self, name):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Role" (name) VALUES (%s)',
                (name,)
            )
            self.conn.commit()
            print("Role added successfully")
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error inserting role: {e}")
            raise
        finally:
            cursor.close()

    def get_all_roles(self, limit=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            query = 'SELECT * FROM "Role"'
            if limit:
                query += f' LIMIT {limit}'
            cursor.execute(query)
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching roles: {e}")
            raise
        finally:
            cursor.close()
            

db = Database()