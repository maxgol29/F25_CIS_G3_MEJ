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
                WHERE table_name = 'Item'
            )
        """)
        item_table_exists = cursor.fetchone()[0]

        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Review'
            )
        """)
        review_table_exists = cursor.fetchone()[0]

        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'User'
            )
        """)
        user_table_exists = cursor.fetchone()[0]

        cursor.execute("""
                       SELECT EXISTS (
                           SELECT FROM information_schema.tables 
                           WHERE table_name = 'Business'
                       )
        """)
        business_table_exists = cursor.fetchone()[0]

        cursor.execute("""
                       SELECT EXISTS (
                           SELECT FROM information_schema.tables 
                           WHERE table_name = 'Role'
                       )
        """)

        role_table_exists = cursor.fetchone()[0]

        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'Address'
                       )
        """)

        role_table_exists = cursor.fetchone()[0]

        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'Address'
                       )
        """)

        address_table_exists = cursor.fetchone()[0]


        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'Permission'
                       )
        """)

        permission_table_exists = cursor.fetchone()[0]

        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'Promo_Code'
                       )
        """)

        promo_code_table_exists = cursor.fetchone()[0]


        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'Payment'
                       )
        """)

        payment_table_exists = cursor.fetchone()[0]


        
        cursor.execute("""
                      SELECT EXISTS (
                           SELECT FROM information_schema.tables
                           WHERE table_name = 'PromoType'
                       )
        """)

        promo_type_table_exists = cursor.fetchone()[0]

        cursor.close()
        
        assert item_table_exists is True
        assert review_table_exists is True
        assert user_table_exists is True
        assert business_table_exists is True
        assert role_table_exists is True
        assert address_table_exists is True
        assert permission_table_exists is True
        assert promo_code_table_exists is True
        assert payment_table_exists is True
        assert promo_type_table_exists is True