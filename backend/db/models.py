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
    
    def add_item(self, image_url, dish_name, food_type=None, ingredients=None, portion_size=None, nutritional_profile=None, cooking_method=None):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                '''INSERT INTO item (image_url, dish_name, food_type, ingredients, portion_size, nutritional_profile, cooking_method) 
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
    
    def add_review(self, review_text, label):
        self._ensure_connection()
        cursor = self.conn.cursor()
        try:
            cursor.execute(
                'INSERT INTO review (review_text, label) VALUES (%s, %s)',
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
    
    def get_all_items(self):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('SELECT * FROM item')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching items: {e}")
            raise
        finally:
            cursor.close()

    def get_all_reviews(self):
        self._ensure_connection()
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute('SELECT * FROM review')
            return cursor.fetchall()
        except psycopg2.Error as e:
            print(f"Error fetching reviews: {e}")
            raise
        finally:
            cursor.close()

db = Database()