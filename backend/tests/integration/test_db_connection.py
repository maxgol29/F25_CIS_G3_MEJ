import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from db.models import db

class TestDatabaseConnection:
    
    def test_database_connection_successful(self):

        db.connect()
        assert db.conn is not None
        db.close()
    
    def test_tables_exist(self, app):
        tables = ['item', 'review', 'user', 'business', 'role', 
                'address', 'permission', 'promo_code', 'payment', 'promotype']
        
        cursor = db.conn.cursor()
        try:
            for table in tables:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = %s
                    )
                """, (table,))
                exists = cursor.fetchone()[0]
                assert exists, f"Table '{table}' does not exist"
        finally:
            cursor.close()