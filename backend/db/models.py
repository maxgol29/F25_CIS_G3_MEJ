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

    def get_all_items(self, limit=None, business_id=None, google_place_id=None, category=None):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
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

    def update_item(self, business_id, item_id, data):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute(
                'SELECT id FROM "Item" WHERE id = %s AND businessID = %s',
                (item_id, business_id)
            )
            if not cursor.fetchone():
                raise ValueError("Item not found for this business")
            allowed_fields = {
                'dish_name': 'dish_name',
                'description': 'description',
                'category': 'category',
                'price': 'price',
                'discount_percentage': 'discount_percentage',
                'image_url': 'image_url',
                'portion_size': 'portion_size',
                'available_quantity': 'available_quantity',
                'is_available': 'is_available'
            }
            
            update_fields = []
            update_values = []
            
            for field_name, db_column in allowed_fields.items():
                if field_name in data:
                    value = data[field_name]
                    if db_column == 'price' and value is not None and value <= 0:
                        raise ValueError("Price must be greater than 0")
                    
                    if db_column == 'discount_percentage' and value is not None:
                        if value < 0 or value > 100:
                            raise ValueError("Discount percentage must be between 0 and 100")
                    
                    update_fields.append(f'"{db_column}" = %s')
                    update_values.append(value)
            
            if not update_fields:
                raise ValueError("No valid fields to update")
            update_fields.append('"updated_at" = CURRENT_TIMESTAMP')
            query = f'''
                UPDATE "Item"
                SET {", ".join(update_fields)}
                WHERE id = %s AND businessID = %s
                RETURNING id, businessID, dish_name, description, category, price, 
                        discount_percentage, image_url, portion_size, available_quantity, 
                        is_available, created_at, updated_at;
            '''
            
            update_values.extend([item_id, business_id])
            cursor.execute(query, update_values)
            
            updated_item = cursor.fetchone()
            self.conn.commit()
            
            return {
                'id': updated_item['id'],
                'businessID': updated_item['businessid'],
                'dish_name': updated_item['dish_name'],
                'description': updated_item['description'],
                'category': updated_item['category'],
                'price': float(updated_item['price']),
                'discount_percentage': float(updated_item['discount_percentage']),
                'image_url': updated_item['image_url'],
                'portion_size': updated_item['portion_size'],
                'available_quantity': updated_item['available_quantity'],
                'is_available': updated_item['is_available'],
                'created_at': str(updated_item['created_at']),
                'updated_at': str(updated_item['updated_at'])
            }
            
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()
    
    def delete_item(self, business_id, item_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute(
                'SELECT id, dish_name FROM "Item" WHERE id = %s AND businessID = %s',
                (item_id, business_id)
            )
            item = cursor.fetchone()
            if not item:
                raise ValueError("Item not found for this business")
            cursor.execute(
                'DELETE FROM "Item" WHERE id = %s AND businessID = %s',
                (item_id, business_id)
            )
            
            self.conn.commit()
            
            return {
                'message': f'Item "{item["dish_name"]}" deleted successfully',
                'deleted_item_id': item_id
            }
            
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()

    def create_item(self, business_id, data):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            dish_name = data.get('dish_name', '').strip()
            if not dish_name:
                raise ValueError("Dish name is required and cannot be empty")
            
            price = data.get('price')
            if price is None:
                raise ValueError("Price is required")
            
            try:
                price = float(price)
                if price <= 0:
                    raise ValueError("Price must be greater than 0")
            except (TypeError, ValueError):
                raise ValueError("Price must be a valid number greater than 0")

            description = data.get('description', '')
            category = data.get('category', '')
            discount_percentage = data.get('discount_percentage', 0)
            image_url = data.get('image_url', '')
            ingredients = data.get('ingredients')
            cooking_method = data.get('cooking_method', '')
            portion_size = data.get('portion_size', '')
            available_quantity = data.get('available_quantity', 0)
            is_available = data.get('is_available', True)

            try:
                discount_percentage = float(discount_percentage)
                if discount_percentage < 0 or discount_percentage > 100:
                    raise ValueError("Discount percentage must be between 0 and 100")
            except (TypeError, ValueError):
                raise ValueError("Discount percentage must be a valid number between 0 and 100")

            try:
                available_quantity = int(available_quantity)
                if available_quantity < 0:
                    raise ValueError("Available quantity cannot be negative")
            except (TypeError, ValueError):
                raise ValueError("Available quantity must be a valid non-negative number")

            ingredients_json = None
            if ingredients:
                if isinstance(ingredients, (list, dict)):
                    import json
                    ingredients_json = json.dumps(ingredients)
                elif isinstance(ingredients, str):
                    ingredients_json = ingredients

            cursor.execute('''
                INSERT INTO "Item"
                (businessID, dish_name, description, category, price, 
                discount_percentage, image_url, ingredients, cooking_method, 
                portion_size, available_quantity, is_available, created_at, updated_at)
                VALUES
                (%s, %s, %s, %s, %s, 
                %s, %s, %s, %s, 
                %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, businessID, dish_name, description, category, price, 
                        discount_percentage, image_url, ingredients, cooking_method, 
                        portion_size, available_quantity, is_available, created_at, updated_at;
            ''', (
                business_id, dish_name, description, category, price,
                discount_percentage, image_url, ingredients_json, cooking_method,
                portion_size, available_quantity, is_available
            ))
            
            created_item = cursor.fetchone()
            self.conn.commit()
            
            return {
                'id': created_item['id'],
                'businessID': created_item['businessid'],
                'dish_name': created_item['dish_name'],
                'description': created_item['description'],
                'category': created_item['category'],
                'price': float(created_item['price']),
                'discount_percentage': float(created_item['discount_percentage']),
                'image_url': created_item['image_url'],
                'ingredients': created_item['ingredients'],
                'cooking_method': created_item['cooking_method'],
                'portion_size': created_item['portion_size'],
                'available_quantity': created_item['available_quantity'],
                'is_available': created_item['is_available'],
                'created_at': str(created_item['created_at']),
                'updated_at': str(created_item['updated_at'])
            }
            
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            raise e
        finally:
            if cursor:
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

    def get_user_orders(self, user_id, limit=50):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('''
                SELECT o.id, o.businessID, o.status, o.subtotal, o.discount_amount, 
                    o.tax_amount, o.total_amount, o.created_at,
                    b.name as business_name
                FROM "Order" o
                JOIN "Business" b ON o.businessID = b.id
                WHERE o.userID = %s
                ORDER BY o.created_at DESC
                LIMIT %s
            ''', (user_id, limit))
            
            orders = []
            for row in cursor.fetchall():
                order_id = row['id']

                cursor.execute('''
                    SELECT i.dish_name, oi.quantity
                    FROM "Order_Item" oi
                    JOIN "Item" i ON oi.itemID = i.id
                    WHERE oi.orderID = %s
                ''', (order_id,))
                
                items = []
                for item_row in cursor.fetchall():
                    items.append({
                        'name': item_row['dish_name'],
                        'quantity': item_row['quantity']
                    })
                
                orders.append({
                    'id': row['id'],
                    'businessID': row['businessid'],
                    'businessName': row['business_name'],
                    'status': row['status'],
                    'subtotal': float(row['subtotal']),
                    'discount_amount': float(row['discount_amount']),
                    'tax_amount': float(row['tax_amount']),
                    'total_amount': float(row['total_amount']),
                    'created_at': str(row['created_at']),
                    'items': items
                })
            
            return orders
            
        finally:
            if cursor:
                cursor.close()

    def get_business_orders(self, business_id, limit=50):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            
            cursor.execute('''
                SELECT id, userid, status, subtotal, discount_amount, 
                    tax_amount, total_amount, created_at
                FROM "Order"
                WHERE businessID = %s
                ORDER BY created_at DESC
                LIMIT %s
            ''', (business_id, limit))
            
            orders = []
            for row in cursor.fetchall():
                orders.append({
                    'id': row['id'],
                    'userID': row['userid'],
                    'status': row['status'],
                    'subtotal': float(row['subtotal']),
                    'discount_amount': float(row['discount_amount']),
                    'tax_amount': float(row['tax_amount']),
                    'total_amount': float(row['total_amount']),
                    'created_at': str(row['created_at'])
                })
            
            return orders
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_items_by_popularity(self, business_id):
        self._ensure_connection()
        cursor = None
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute('''
                SELECT 
                    i.id,
                    i.dish_name,
                    i.description,
                    i.category,
                    i.price,
                    i.discount_percentage,
                    i.image_url,
                    i.portion_size,
                    i.is_available,
                    COUNT(oi.id) as times_ordered,
                    COALESCE(SUM(oi.quantity), 0) as total_quantity_sold
                FROM "Item" i
                LEFT JOIN "Order_Item" oi ON i.id = oi.itemID
                WHERE i.businessID = %s
                GROUP BY i.id, i.dish_name, i.description, i.category, i.price, 
                        i.discount_percentage, i.image_url, i.portion_size, i.is_available
                ORDER BY COUNT(oi.id) DESC, i.dish_name ASC;
            ''', (business_id,))
            
            items = []
            for row in cursor.fetchall():
                items.append({
                    'id': row['id'],
                    'dish_name': row['dish_name'],
                    'description': row['description'],
                    'category': row['category'],
                    'price': float(row['price']),
                    'discount_percentage': float(row['discount_percentage']),
                    'image_url': row['image_url'],
                    'portion_size': row['portion_size'],
                    'is_available': row['is_available'],
                    'times_ordered': row['times_ordered'],
                    'total_quantity_sold': row['total_quantity_sold']
                })
            
            return items
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    # PromoCode-related database operations

    def create_promo_code(self, business_id, type_id, code, description, 
                     expiration_date=None, max_uses=None, item_ids=None, is_active=True):
        
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")

            cursor.execute('SELECT id FROM "Promo_Type" WHERE id = %s', (type_id,))
            if not cursor.fetchone():
                raise ValueError("Promo type not found")

            cursor.execute('SELECT id FROM "Promo_Code" WHERE code = %s', (code,))
            if cursor.fetchone():
                raise ValueError("Promo code already exists")

            cursor.execute('''
                INSERT INTO "Promo_Code"
                (businessID, typeID, code, description, expiration_date, 
                max_uses, is_active, created_at, updated_at)
                VALUES
                (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, businessID, typeID, code, description, expiration_date, 
                        max_uses, current_uses, is_active, created_at, updated_at;
            ''', (
                business_id, type_id, code.upper(), description, expiration_date,
                max_uses, is_active
            ))
            
            promo = cursor.fetchone()
            promo_id = promo['id']

            if item_ids and len(item_ids) > 0:
                for item_id in item_ids:
                    cursor.execute(
                        'SELECT id FROM "Item" WHERE id = %s AND businessID = %s',
                        (item_id, business_id)
                    )
                    if not cursor.fetchone():
                        raise ValueError(f"Item {item_id} not found for this business")

                    cursor.execute('''
                        INSERT INTO "Promo_Code_Item" (promoID, itemID)
                        VALUES (%s, %s)
                        ON CONFLICT DO NOTHING;
                    ''', (promo_id, item_id))
            
            self.conn.commit()
            
            return {
                'id': promo['id'],
                'businessID': promo['businessid'],
                'typeID': promo['typeid'],
                'code': promo['code'],
                'description': promo['description'],
                'expiration_date': str(promo['expiration_date']) if promo['expiration_date'] else None,
                'max_uses': promo['max_uses'],
                'current_uses': promo['current_uses'],
                'is_active': promo['is_active'],
                'applies_to_all_items': len(item_ids) == 0,
                'created_at': str(promo['created_at']),
                'updated_at': str(promo['updated_at'])
            }
            
        except Exception as e:
            if self.conn:
                self.conn.rollback()
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_promos(self, business_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute('''
                SELECT pc.id, pc.businessID, pc.typeID, pc.code, pc.description, 
                    pc.expiration_date, pc.max_uses, pc.current_uses, pc.is_active,
                    pc.created_at, pc.updated_at,
                    pt.name as type_name, pt.discount_percentage, pt.discount_fixed_amount
                FROM "Promo_Code" pc
                JOIN "Promo_Type" pt ON pc.typeID = pt.id
                WHERE pc.businessID = %s
                ORDER BY pc.created_at DESC;
            ''', (business_id,))
            
            promos = []
            for row in cursor.fetchall():
                promo_id = row['id']
                cursor.execute('''
                    SELECT i.id, i.dish_name, i.price
                    FROM "Promo_Code_Item" pci
                    JOIN "Item" i ON pci.itemID = i.id
                    WHERE pci.promoID = %s;
                ''', (promo_id,))
                
                items = []
                for item_row in cursor.fetchall():
                    items.append({
                        'id': item_row['id'],
                        'name': item_row['dish_name'],
                        'price': float(item_row['price'])
                    })
                
                promos.append({
                    'id': row['id'],
                    'businessID': row['businessid'],
                    'typeID': row['typeid'],
                    'code': row['code'],
                    'description': row['description'],
                    'expiration_date': str(row['expiration_date']) if row['expiration_date'] else None,
                    'max_uses': row['max_uses'],
                    'current_uses': row['current_uses'],
                    'is_active': row['is_active'],
                    'type_name': row['type_name'],
                    'discount_percentage': float(row['discount_percentage']) if row['discount_percentage'] else None,
                    'discount_fixed_amount': float(row['discount_fixed_amount']) if row['discount_fixed_amount'] else None,
                    'applies_to_all_items': len(items) == 0,
                    'items': items,
                    'created_at': str(row['created_at']),
                    'updated_at': str(row['updated_at'])
                })
            
            return promos
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_promo_usage(self, business_id, promo_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")

            cursor.execute(
                'SELECT id, code FROM "Promo_Code" WHERE id = %s AND businessID = %s',
                (promo_id, business_id)
            )
            if not cursor.fetchone():
                raise ValueError("Promo not found for this business")

            cursor.execute('''
                SELECT 
                    pcu.id,
                    pcu.promoID,
                    pcu.userID,
                    pcu.orderID,
                    pcu.discount_amount,
                    pcu.used_at,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM "Promo_Code_Usage" pcu
                JOIN "User" u ON pcu.userID = u.id
                WHERE pcu.promoID = %s
                ORDER BY pcu.used_at DESC;
            ''', (promo_id,))
            
            usage_list = []
            for row in cursor.fetchall():
                usage_list.append({
                    'id': row['id'],
                    'promoID': row['promoid'],
                    'userID': row['userid'],
                    'orderID': row['orderid'],
                    'user_email': row['email'],
                    'user_name': f"{row['first_name']} {row['last_name']}",
                    'discount_amount': float(row['discount_amount']),
                    'used_at': str(row['used_at'])
                })
            
            return usage_list
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_all_promos_usage(self, business_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute('''
                SELECT 
                    pcu.id,
                    pcu.promoID,
                    pcu.userID,
                    pcu.orderID,
                    pcu.discount_amount,
                    pcu.used_at,
                    pc.code as promo_code,
                    pc.description as promo_description,
                    u.email,
                    u.first_name,
                    u.last_name
                FROM "Promo_Code_Usage" pcu
                JOIN "Promo_Code" pc ON pcu.promoID = pc.id
                JOIN "User" u ON pcu.userID = u.id
                WHERE pc.businessID = %s
                ORDER BY pcu.used_at DESC;
            ''', (business_id,))
            
            usage_list = []
            for row in cursor.fetchall():
                usage_list.append({
                    'id': row['id'],
                    'promoID': row['promoid'],
                    'promo_code': row['promo_code'],
                    'promo_description': row['promo_description'],
                    'userID': row['userid'],
                    'orderID': row['orderid'],
                    'user_email': row['email'],
                    'user_name': f"{row['first_name']} {row['last_name']}",
                    'discount_amount': float(row['discount_amount']),
                    'used_at': str(row['used_at'])
                })
            
            return usage_list
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_orders_daily(self, business_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)

            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            
            cursor.execute('''
                SELECT 
                    DATE(created_at) as order_date,
                    COUNT(*) as order_count,
                    SUM(total_amount) as total_revenue,
                    AVG(total_amount) as average_order_value,
                    COUNT(DISTINCT userID) as unique_customers
                FROM "Order"
                WHERE businessID = %s
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) DESC;
            ''', (business_id,))
            
            daily_data = []
            for row in cursor.fetchall():
                daily_data.append({
                    'order_date': str(row['order_date']),
                    'order_count': row['order_count'],
                    'total_revenue': float(row['total_revenue']) if row['total_revenue'] else 0,
                    'average_order_value': float(row['average_order_value']) if row['average_order_value'] else 0,
                    'unique_customers': row['unique_customers']
                })
            
            return daily_data
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

    def get_business_income(self, business_id):
        self._ensure_connection()
        cursor = None
        
        try:
            cursor = self.conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute('SELECT id FROM "Business" WHERE id = %s', (business_id,))
            if not cursor.fetchone():
                raise ValueError("Business not found")
            cursor.execute('''
                SELECT 
                    DATE(created_at) as income_date,
                    COUNT(*) as orders_count,
                    SUM(total_amount) as daily_income,
                    SUM(subtotal) as subtotal,
                    SUM(discount_amount) as total_discounts,
                    SUM(tax_amount) as total_tax,
                    SUM(processing_fee) as total_processing_fees
                FROM "Order"
                WHERE businessID = %s
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) DESC;
            ''', (business_id,))
            
            daily_data = []
            total_income = 0
            total_orders = 0
            total_subtotal = 0
            total_discounts = 0
            total_tax = 0
            total_fees = 0
            
            for row in cursor.fetchall():
                daily_income = float(row['daily_income']) if row['daily_income'] else 0
                daily_data.append({
                    'date': str(row['income_date']),
                    'orders_count': row['orders_count'],
                    'daily_income': daily_income,
                    'subtotal': float(row['subtotal']) if row['subtotal'] else 0,
                    'discounts': float(row['total_discounts']) if row['total_discounts'] else 0,
                    'tax': float(row['total_tax']) if row['total_tax'] else 0,
                    'processing_fees': float(row['total_processing_fees']) if row['total_processing_fees'] else 0
                })
                
                total_income += daily_income
                total_orders += row['orders_count']
                total_subtotal += float(row['subtotal']) if row['subtotal'] else 0
                total_discounts += float(row['total_discounts']) if row['total_discounts'] else 0
                total_tax += float(row['total_tax']) if row['total_tax'] else 0
                total_fees += float(row['total_processing_fees']) if row['total_processing_fees'] else 0
            
            return {
                'daily_income': daily_data,
                'summary': {
                    'total_income': round(total_income, 2),
                    'total_orders': total_orders,
                    'total_subtotal': round(total_subtotal, 2),
                    'total_discounts': round(total_discounts, 2),
                    'total_tax': round(total_tax, 2),
                    'total_processing_fees': round(total_fees, 2),
                    'average_daily_income': round(total_income / len(daily_data), 2) if daily_data else 0,
                    'average_order_value': round(total_income / total_orders, 2) if total_orders > 0 else 0,
                    'days_with_orders': len(daily_data)
                }
            }
            
        except Exception as e:
            raise e
        finally:
            if cursor:
                cursor.close()

db = Database()