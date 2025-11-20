import psycopg2
from psycopg2.extras import RealDictCursor, Json
from werkzeug.security import generate_password_hash, check_password_hash
from config import config

class Database:
    def __init__(self):
        self.conn = None

    def connect(self):
        try:
            local_hosts = {'localhost', '127.0.0.1', '::1', '0.0.0.0'}
            ssl_mode = 'disable' if config.DB_HOST in local_hosts else 'require'
            
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
        else:
            try:
                cursor = self.conn.cursor()
                cursor.execute("SELECT 1")
                cursor.close()
            except (psycopg2.OperationalError, psycopg2.InterfaceError):
                self.close()
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

    def get_all_items(self, limit=None, business_id=None, google_place_id=None, category=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            # Base query selects items; optionally join Business when filtering by google_place_id
            if google_place_id:
                query = 'SELECT i.* FROM "Item" i LEFT JOIN "Business" b ON i.businessID = b.id WHERE b.google_place_id = %s'
                params = [google_place_id]
            else:
                query = 'SELECT i.* FROM "Item" i WHERE 1=1'
                params = []

            if business_id:
                query += ' AND i.businessID = %s'
                params.append(business_id)

            if category:
                query += ' AND i.category = %s'
                params.append(category)

            if limit:
                query += f' LIMIT {limit}'

            cursor.execute(query, tuple(params) if params else None)
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

    def signup(self, first_name, last_name, email, phone, password, address, user_type='customer', business_id=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('SELECT id FROM "User" WHERE email = %s', (email,))
            if cursor.fetchone():
                raise ValueError("Email already exists")
            role_name = 'owner' if user_type == 'owner' else 'customer'
            cursor.execute('SELECT id FROM "Role" WHERE name = %s', (role_name,))
            role_result = cursor.fetchone()
            if not role_result:
                raise ValueError(f"Role '{role_name}' not found. Please create roles first.")
            role_id = role_result['id']
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
                (roleid, first_name, last_name, email, phone, is_active, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, first_name, last_name, email, phone, roleid
            ''', (role_id, first_name, last_name, email, phone)) 
            user = cursor.fetchone()
            cursor.execute('''
                INSERT INTO "User_Address" (userID, addressID, address_type)
                VALUES (%s, %s, 'home')
            ''', (user['id'], address_id))
            if user_type == 'owner' and business_id:
                cursor.execute('''
                    UPDATE "Business"
                    SET ownerID = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                ''', (user['id'], business_id))            
            password_hash = generate_password_hash(password)
            cursor.execute('''
                INSERT INTO "User_Auth" 
                (userID, password_hash, created_at, updated_at)
                VALUES (%s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ''', (user['id'], password_hash))

            self.conn.commit()            
            result = {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'phone': user['phone'],
                'user_type': user_type,
                'business_id': business_id if user_type == 'owner' else None,
                'roleID': user['roleid']
            }
            return result
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
                SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.roleID, r.name as role_name, ua.password_hash
                FROM "User" u
                INNER JOIN "User_Auth" ua ON u.id = ua.userID
                LEFT JOIN "Role" r ON u.roleID = r.id
                WHERE u.email = %s AND u.is_active = TRUE
            ''', (email,))
            user = cursor.fetchone()
            if not user or not check_password_hash(user['password_hash'], password):
                raise ValueError("Invalid email or password")

            cursor.execute('UPDATE "User_Auth" SET last_login = CURRENT_TIMESTAMP WHERE userID = %s', (user['id'],))
            self.conn.commit()
            user_type = 'owner' if user['role_name'] == 'owner' else 'customer'
            business_id = None
            if user_type == 'owner':
                cursor.execute('SELECT id FROM "Business" WHERE ownerID = %s', (user['id'],))
                business = cursor.fetchone()
                business_id = business['id'] if business else None
            return {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email'],
                'phone': user['phone'],
                'user_type': user_type, 
                'role': user['role_name'],
                'business_id': business_id
            }
        finally:
            cursor.close()

    def get_user_details(self, user_id):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('''
                SELECT 
                    u.id, u.first_name, u.last_name, u.email, u.phone, u.roleID, r.name as role_name,
                    a.street, a.building_number, a.apartment_number,
                    a.zip_code, a.city, a.state, a.country
                FROM "User" u
                LEFT JOIN "Role" r ON u.roleID = r.id
                LEFT JOIN "User_Address" ua ON u.id = ua.userID AND ua.address_type = 'home'
                LEFT JOIN "Address" a ON ua.addressID = a.id
                WHERE u.id = %s AND u.is_active = TRUE
            ''', (user_id,))
            data = cursor.fetchone()
            if not data:
                raise ValueError("User not found")
            result = dict(data)
            result['user_type'] = 'owner' if result.get('role_name') == 'owner' else 'customer'
            return result
        finally:
            cursor.close()

    def update_user_password(self, user_id, new_password):
        """Update a user's password only. Returns True if successful."""
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            password_hash = generate_password_hash(new_password)
            cursor.execute('''
                UPDATE "User_Auth"
                SET password_hash = %s, updated_at = CURRENT_TIMESTAMP
                WHERE userID = %s
                RETURNING userID
            ''', (password_hash, user_id))
            
            result = cursor.fetchone()
            if not result:
                raise ValueError("User not found or password update failed")
            
            self.conn.commit()
            return True
        except psycopg2.Error as e:
            self.conn.rollback()
            print(f"Error updating password: {e}")
            raise
        finally:
            cursor.close()


   # Save businesses from Google Places API

    def save_businesses_from_places(self, businesses):
        self._ensure_connection()
        saved_count = 0
        skipped_count = 0
        errors = []
        try:
            for business in enumerate(businesses):
                cursor = None
                try:
                    google_place_id = business.get('place_id')
                    if not google_place_id:
                        continue
                    name = business.get('name')
                    phone = business.get('international_phone_number')
                    website = business.get('website')
                    opening_hours = business.get('opening_hours')
                    opening_hours_json = Json(opening_hours) if isinstance(opening_hours, (dict, list)) else None
                    rating = business.get('rating')
                    total_reviews = business.get('user_ratings_total', 0)
                    types = business.get('types', [])
                    place_type = next(
                        (t for t in types if t in ['restaurant', 'cafe', 'bar']),
                        types[0] if types else 'restaurant'
                    )

                    address_id = None
                    vicinity = business.get('vicinity', '')
                    geometry = business.get('geometry', {})
                    location = geometry.get('location', {})
                    latitude = location.get('lat')
                    longitude = location.get('lng')
                    
                    street = ''
                    city = ''
                    state = '' 
                    zip_code = '' 
                    country = 'United States'  
                    
                    if vicinity:
                        parts = [p.strip() for p in vicinity.split(',')]
                        
                        if len(parts) >= 1:
                            street = parts[0] 
                        if len(parts) >= 2:
                            city = parts[1] 

                    if street and city:
                        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
                        try:
                            cursor.execute('''
                                INSERT INTO "Address"
                                (street, city, state, zip_code, country, latitude, longitude,
                                created_at, updated_at)
                                VALUES
                                (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                                RETURNING id;
                            ''', (
                                street, city, state, zip_code, country, latitude, longitude
                            ))
                            
                            cursor.close()
                        except Exception as addr_error:
                            if cursor:
                                cursor.close()
                            address_id = None

                    cursor = self.conn.cursor(cursor_factory=RealDictCursor)
                    try:
                        cursor.execute('''
                            INSERT INTO "Business"
                            (name, type, phone, website, google_place_id,
                            opening_hours, rating, total_reviews, addressID,
                            is_active, is_verified, created_at, updated_at)
                            VALUES
                            (%s, %s, %s, %s, %s,
                            %s, %s, %s, %s,
                            TRUE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                            ON CONFLICT (google_place_id) DO NOTHING;
                        ''', (
                            name, place_type, phone, website, google_place_id,
                            opening_hours_json, rating, total_reviews, address_id
                        ))

                        if cursor.rowcount > 0:
                            saved_count += 1
                        else:
                            skipped_count += 1
                        
                        self.conn.commit()
                        cursor.close()
                        
                    except Exception:
                        self.conn.rollback()
                        if cursor:
                            cursor.close()

                except Exception as e:
                    if cursor:
                        cursor.close()
                    continue
            return {'saved': saved_count, 'skipped': skipped_count, 'errors': errors}
        except Exception as e:
            raise e


    def get_all_restaurants(self, limit=None):
        self._ensure_connection()
        cursor = None
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = '''
                SELECT 
                    id, name, type, google_place_id, rating, 
                    total_reviews, opening_hours, phone, website,
                    is_active, created_at
                FROM "Business"
                WHERE is_active = TRUE
                ORDER BY rating DESC, total_reviews DESC
            '''  
            if limit:
                query += f' LIMIT {limit}'
            
            cursor.execute(query)
            restaurants = cursor.fetchall()
            
            result = [dict(r) for r in restaurants] if restaurants else []
            return result
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_by_id(self, business_id):
        self._ensure_connection()
        cursor = None     
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            
            query = '''
                SELECT 
                    "id", "name", "type", google_place_id, rating, 
                    total_reviews, opening_hours, phone, website,
                    is_active, created_at
                FROM "Business"
                WHERE "id" = %s AND is_active = TRUE
            '''
            
            cursor.execute(query, (business_id,))
            business = cursor.fetchone()
            
            result = dict(business) if business else None
            return result
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_items_by_business_id(self, business_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor) 
            check_query = 'SELECT "id" FROM "Business" WHERE "id" = %s'
            cursor.execute(check_query, (business_id,))
            
            if not cursor.fetchone():
                return []
            
            query = '''
                SELECT 
                    id, BusinessID, dish_name, description, category,
                    price, discount_percentage, image_url, ingredients,
                    cooking_method, portion_size, available_quantity,
                    is_available, created_at, updated_at
                FROM "Item"
                WHERE BusinessID = %s
                ORDER BY category, dish_name
            '''
            
            cursor.execute(query, (business_id,))
            items = cursor.fetchall()
            
            result = [dict(item) for item in items] if items else []
            return result
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def create_order(self, user_id, business_id, items, subtotal, discount_amount, 
                    tax_amount, processing_fee, total_amount, promo_code=None):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('SELECT id FROM "User" WHERE id = %s', (user_id,))
            if not cursor.fetchone():
                raise ValueError("User not found")
            
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")

            cursor.execute('''
                INSERT INTO "Order" 
                (userID, businessID, status, subtotal, discount_amount, tax_amount, 
                processing_fee, total_amount, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, userID, businessID, status, subtotal, discount_amount, 
                        tax_amount, processing_fee, total_amount, created_at
            ''', (user_id, business_id, 'pending', subtotal, discount_amount, 
                tax_amount, processing_fee, total_amount))
            
            order = cursor.fetchone()
            order_id = order['id']

            for item in items:
                cursor.execute('''
                    INSERT INTO "Order_Item" 
                    (orderID, itemID, quantity, unit_price, discount_percentage, created_at)
                    VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ''', (order_id, item['itemId'], item['quantity'], item['price'], 
                    item.get('discountPercentage', 0)))
            
            self.conn.commit()
            
            return {
                'id': order['id'],
                'userID': order['userid'],
                'businessID': order['businessid'],
                'status': order['status'],
                'subtotal': float(order['subtotal']),
                'discount_amount': float(order['discount_amount']),
                'tax_amount': float(order['tax_amount']),
                'processing_fee': float(order['processing_fee']),
                'total_amount': float(order['total_amount']),
                'created_at': str(order['created_at'])
            }
            
        except Exception as e:
            self.conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()


    def get_order(self, order_id):
        self._ensure_connection()
        cursor = None     
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('''
                SELECT o.id, o.userID, o.businessID, o.status, o.subtotal, o.discount_amount, 
                    o.tax_amount, o.processing_fee, o.total_amount, o.created_at,
                    b.name as business_name, b.phone as business_phone, b.email as business_email,
                    a.street, a.building_number, a.apartment_number, a.zip_code, 
                    a.city, a.state, a.country, a.latitude, a.longitude
                FROM "Order" o
                JOIN "Business" b ON o.businessID = b.id
                LEFT JOIN "Address" a ON b.addressID = a.id
                WHERE o.id = %s
            ''', (order_id,))
            
            order = cursor.fetchone()
            
            if not order:
                raise ValueError("Order not found")

            cursor.execute('''
                SELECT oi.id, oi.itemID, i.dish_name, oi.quantity, oi.unit_price, 
                    oi.discount_percentage
                FROM "Order_Item" oi
                JOIN "Item" i ON oi.itemID = i.id
                WHERE oi.orderID = %s
            ''', (order_id,))
            
            items = []
            for row in cursor.fetchall():
                items.append({
                    'id': row['id'],
                    'itemId': row['itemid'],
                    'dishName': row['dish_name'],
                    'quantity': row['quantity'],
                    'price': float(row['unit_price']),
                    'discountPercentage': float(row['discount_percentage'])
                })
            
            return {
                'id': order['id'],
                'userID': order['userid'],
                'businessID': order['businessid'],
                'status': order['status'],
                'subtotal': float(order['subtotal']),
                'discount_amount': float(order['discount_amount']),
                'tax_amount': float(order['tax_amount']),
                'processing_fee': float(order['processing_fee']),
                'total_amount': float(order['total_amount']),
                'created_at': str(order['created_at']),
                'business': {
                    'address': {
                        'street': order['street'],
                        'building_number': order['building_number'],
                        'apartment_number': order['apartment_number'],
                        'zip_code': order['zip_code'],
                        'city': order['city'],
                        'state': order['state'],
                        'country': order['country'],
                    }
                },
                'items': items
            }
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

db = Database()