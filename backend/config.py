import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'postgres')
    DB_PORT = int(os.getenv('DB_PORT', 5432))
    GOOGLE_PLACES_API_KEY = os.getenv('GOOGLE_PLACES_API_KEY', '')
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    DATABASE_URL = os.getenv("DATABASE_URL")

config = Config()