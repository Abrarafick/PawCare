"""
PawCare — Production Settings.
Optimized for Render (Web Service), Neon PostgreSQL, and Vercel frontend.
"""
import os
import urllib.parse
from pathlib import Path
from .base import *  # noqa: F401, F403

DEBUG = os.environ.get('DEBUG', 'False').lower() in ('true', '1')

# ─── Allowed Hosts ──────────────────────────────────────────────────────────
custom_hosts = [h.strip() for h in os.environ.get('ALLOWED_HOSTS', '').split(',') if h.strip()]
ALLOWED_HOSTS = list(set([
    '.onrender.com',
    'localhost',
    '127.0.0.1',
    *custom_hosts,
]))

# ─── Database Configuration (Neon PostgreSQL) ──────────────────────────────
database_url = os.environ.get('DATABASE_URL')

def _parse_db_url(url: str):
    try:
        import dj_database_url
        return dj_database_url.parse(url, conn_max_age=600, ssl_require=True)
    except Exception:
        # Fallback to standard library parser if dj_database_url isn't installed
        parsed = urllib.parse.urlparse(url)
        query = urllib.parse.parse_qs(parsed.query)
        sslmode = query.get('sslmode', ['require'])[0]
        return {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': parsed.path.lstrip('/'),
            'USER': urllib.parse.unquote(parsed.username or ''),
            'PASSWORD': urllib.parse.unquote(parsed.password or ''),
            'HOST': parsed.hostname or '',
            'PORT': str(parsed.port or 5432),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'sslmode': sslmode,
            },
        }

if database_url:
    DATABASES = {
        'default': _parse_db_url(database_url)
    }
elif os.environ.get('DB_NAME'):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ['DB_NAME'],
            'USER': os.environ.get('DB_USER', ''),
            'PASSWORD': os.environ.get('DB_PASSWORD', ''),
            'HOST': os.environ.get('DB_HOST', 'localhost'),
            'PORT': os.environ.get('DB_PORT', '5432'),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'sslmode': os.environ.get('DB_SSLMODE', 'require'),
            },
        }
    }
else:
    # Graceful fallback to SQLite if no DB credentials provided yet
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }

# ─── HTTPS, Proxy & Security Headers ─────────────────────────────────────────
# Essential for Render / reverse proxies to prevent infinite redirect loops
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True').lower() in ('true', '1')
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# ─── CORS & CSRF Trusted Origins (Vercel Frontend) ──────────────────────────
# Allow Vercel preview & production deployments
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
]

cors_origins = [o.strip() for o in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if o.strip()]
if cors_origins:
    CORS_ALLOWED_ORIGINS = cors_origins
else:
    CORS_ALLOWED_ORIGINS = [
        'http://localhost:5173',
        'http://localhost:3000',
    ]

# If CORS_ALLOW_ALL_ORIGINS is explicitly requested
if os.environ.get('CORS_ALLOW_ALL_ORIGINS', 'False').lower() in ('true', '1'):
    CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins for admin & cross-origin cookies
csrf_trusted = [o for o in CORS_ALLOWED_ORIGINS if o.startswith('http')]
CSRF_TRUSTED_ORIGINS = list(set([
    'https://*.vercel.app',
    'https://*.onrender.com',
    *csrf_trusted,
]))

# ─── Static Files (WhiteNoise) ──────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'  # noqa: F405
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# ─── Persistent Private Storage ─────────────────────────────────────────────
# Cloudflare R2 / AWS S3 or fallback to persistent disk
STORAGE_BACKEND = os.environ.get('STORAGE_BACKEND', 'local')
