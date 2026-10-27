"""
PawCare — Development settings.
Uses SQLite for development (no PostgreSQL required for local dev).
Switch to production.py for a live deployment.
"""
from .base import *  # noqa: F401, F403
import os

DEBUG = True

# Development database — SQLite (no server needed)
# To use PostgreSQL instead, set STORAGE_BACKEND=postgres and configure DB_* vars
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

