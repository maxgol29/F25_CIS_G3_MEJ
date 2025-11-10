import psycopg2
from psycopg2.extras import RealDictCursor
from werkzeug.security import generate_password_hash, check_password_hash
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

    def add_address(self, street, city, state, zip):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO "Address" (street, city, state, zip) VALUES (%s, %s, %s, %s)',
                (street, city, state, zip)
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

# auth-related database operations

 
    def signup(self, first_name, last_name, email, phone, password, address):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('SELECT id FROM "User" WHERE email = %s', (email,))
            if cursor.fetchone():
                raise ValueError("Email already exists")
            cursor.execute('''
                INSERT INTO "Address" 
                (street, building_number, apartment_number, zip_code, city, state, country, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id
            ''', (
                address['street'],
                address.get('building_number'),
                address.get('apartment_number'),
                address['zip_code'],
                address['city'],
                address.get('state'),
                address['country']
            ))
            address_id = cursor.fetchone()['id']
            cursor.execute('''
                INSERT INTO "User" 
                (first_name, last_name, email, phone, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, first_name, last_name, email, phone
            ''', (first_name, last_name, email, phone))
            user = cursor.fetchone()
            cursor.execute('''
                INSERT INTO "User_Address" (userID, addressID, address_type)
                VALUES (%s, %s, 'home')
            ''', (user['id'], address_id))
            password_hash = generate_password_hash(password)
            cursor.execute('''
                INSERT INTO "User_Auth" 
                (userID, password_hash, created_at, updated_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ''', (user['id'], password_hash))

            self.conn.commit()
            return user
        except Exception as e:
            self.conn.rollback()
            raise e
        finally:
            cursor.close()

    def login(self, email, password):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('''
                SELECT u.id, u.first_name, u.last_name, u.email, ua.password_hash
                FROM "User" u
                INNER JOIN "User_Auth" ua ON u.id = ua.userID
                WHERE u.email = %s AND u.is_active = TRUE
            ''', (email,))
            user = cursor.fetchone()
            if not user or not check_password_hash(user['password_hash'], password):
                raise ValueError("Invalid email or password")

            cursor.execute('UPDATE "User_Auth" SET last_login = CURRENT_TIMESTAMP WHERE userID = %s', (user['id'],))
            self.conn.commit()
            return {k: user[k] for k in ('id', 'first_name', 'last_name', 'email')}
        finally:
            cursor.close()

    def get_user_details(self, user_id):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('''
                SELECT 
                    u.id, u.first_name, u.last_name, u.email, u.phone,
                    a.street, a.building_number, a.apartment_number,
                    a.zip_code, a.city, a.state, a.country
                FROM "User" u
                LEFT JOIN "User_Address" ua ON u.id = ua.userID AND ua.address_type = 'home'
                LEFT JOIN "Address" a ON ua.addressID = a.id
                WHERE u.id = %s AND u.is_active = TRUE
            ''', (user_id,))
            data = cursor.fetchone()
            if not data:
                raise ValueError("User not found")
            return data
        finally:
            cursor.close()

db = Database()