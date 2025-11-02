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
        cursor = db.conn.cursor()

        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'item'
            )
        """)
        item_table_exists = cursor.fetchone()[0]

        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'review'
            )
        """)
        review_table_exists = cursor.fetchone()[0]
        
        cursor.close()
        
        assert item_table_exists is True
        assert review_table_exists is True