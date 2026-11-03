"""
PawCare — Development settings.
Uses SQLite for development (no PostgreSQL required for local dev).
Switch to production.py for a live deployment.
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = True

# Database: Connect to Neon PostgreSQL if DATABASE_URL is present, otherwise fallback to SQLite
database_url = os.environ.get('DATABASE_URL')
if database_url:
    from config.settings.production import _parse_db_url
    DATABASES = {
        'default': _parse_db_url(database_url)
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }

# In development, allow all origins for convenience
CORS_ALLOW_ALL_ORIGINS = True

# Less strict security in development
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

