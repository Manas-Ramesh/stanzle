"""
Configuration settings for the Stanzle application
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # API Keys
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    WORDNIK_API_KEY = os.getenv('WORDNIK_API_KEY')
    
    # Server settings
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    
    # CORS settings
    CORS_ORIGINS = [
        'http://localhost:3000',
        'http://localhost:8000',
        'http://127.0.0.1:8000'
    ]
    
    # OpenAI settings
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    OPENAI_MAX_TOKENS = int(os.getenv('OPENAI_MAX_TOKENS', 300))
    OPENAI_TEMPERATURE = float(os.getenv('OPENAI_TEMPERATURE', 0.7))
    
    # Wordnik settings
    WORDNIK_BASE_URL = 'http://api.wordnik.com/v4'
    WORDNIK_TIMEOUT = int(os.getenv('WORDNIK_TIMEOUT', 10))
    
    # Game settings
    MAX_POEM_LENGTH = int(os.getenv('MAX_POEM_LENGTH', 10000))
    MIN_POEM_LENGTH = int(os.getenv('MIN_POEM_LENGTH', 10))
    WORD_BANK_SIZE = int(os.getenv('WORD_BANK_SIZE', 4))
    
    # Scoring settings
    EASY_MODE_THEME_POINTS = int(os.getenv('EASY_MODE_THEME_POINTS', 80))
    EASY_MODE_EMOTION_POINTS = int(os.getenv('EASY_MODE_EMOTION_POINTS', 80))
    HARD_MODE_THEME_POINTS = int(os.getenv('HARD_MODE_THEME_POINTS', 40))
    HARD_MODE_EMOTION_POINTS = int(os.getenv('HARD_MODE_EMOTION_POINTS', 40))
    CREATIVITY_POINTS = int(os.getenv('CREATIVITY_POINTS', 20))

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    OPENAI_API_KEY = 'test-key'
    WORDNIK_API_KEY = 'test-key'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
