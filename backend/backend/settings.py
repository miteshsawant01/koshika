import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = 'django-insecure-3re3e9l#z06ll6!fm-9xz64v=krn#ib*3_z*1j%$w8kkf57q8+'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'stemcell_core',
    'ml_engine',
    'ocr_engine',
    'ai_assistant',
    'reports',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASE_URL = os.getenv('DATABASE_URL')

# Support individual Supabase environment variables if DATABASE_URL is not directly set
if not DATABASE_URL and os.getenv('SUPABASE_DB_HOST'):
    sb_user = os.getenv('SUPABASE_DB_USER', 'postgres')
    sb_pass = os.getenv('SUPABASE_DB_PASSWORD', '')
    sb_host = os.getenv('SUPABASE_DB_HOST')
    sb_port = os.getenv('SUPABASE_DB_PORT', '5432')
    sb_name = os.getenv('SUPABASE_DB_NAME', 'postgres')
    DATABASE_URL = f"postgresql://{sb_user}:{sb_pass}@{sb_host}:{sb_port}/{sb_name}"

if DATABASE_URL:
    try:
        import dj_database_url
        is_supabase = 'supabase.co' in DATABASE_URL or 'pooler.supabase.com' in DATABASE_URL
        is_cloud = is_supabase or any(k in DATABASE_URL for k in ['render.com', 'neon.tech', 'aws', 'aiven'])
        is_transaction_pooler = ':6543' in DATABASE_URL

        db_config = dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=0 if is_transaction_pooler else 600,
            ssl_require=is_cloud or (not DEBUG and 'localhost' not in DATABASE_URL and '127.0.0.1' not in DATABASE_URL),
        )

        # For Supabase Transaction Pooler (port 6543), server-side cursors must be disabled
        if is_transaction_pooler:
            db_config['DISABLE_SERVER_SIDE_CURSORS'] = True

        # Ensure SSL mode is set for cloud / Supabase PostgreSQL
        if is_cloud or is_supabase:
            db_config.setdefault('OPTIONS', {})
            db_config['OPTIONS'].setdefault('sslmode', 'require')

        DATABASES = {'default': db_config}
    except Exception as e:
        print(f"Warning: Failed to parse DATABASE_URL ({e}), falling back to SQLite.")
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
else:
    # Check if MySQL is available and requested
    use_mysql = False
    db_host = os.getenv('DB_HOST', 'localhost')
    db_user = os.getenv('DB_USER', 'root')
    db_name = os.getenv('DB_NAME', 'stemcelldb')
    db_password = os.getenv('DB_PASSWORD', 'm123')
    db_port = os.getenv('DB_PORT', '3306')

    # If running in cloud environment (e.g. Render, Heroku) without DATABASE_URL:
    if os.getenv('RENDER') or os.getenv('DYNO') or not DEBUG:
        use_mysql = False
    else:
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.4)
            result = sock.connect_ex((db_host, int(db_port)))
            sock.close()
            if result == 0:
                use_mysql = True
        except Exception:
            use_mysql = False

    if use_mysql:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.mysql',
                'NAME': db_name,
                'USER': db_user,
                'PASSWORD': db_password,
                'HOST': db_host,
                'PORT': db_port,
                'OPTIONS': {
                    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
                    'charset': 'utf8mb4',
                },
            }
        }
    else:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I8N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL= '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

from corsheaders.defaults import default_headers

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-gemini-api-key',
    'x-csrftoken',
]

CSRF_TRUSTED_ORIGINS = [
    'https://*.vercel.app',
    'https://*.onrender.com',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:8000',
]

REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSy-DEMO-KEY-FOR-TESTING-ONLY')
TESSERACT_CMD = os.getenv('TESSERACT_CMD', '')

# Supabase API Settings (optional direct client access)
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', os.getenv('SUPABASE_ANON_KEY', ''))

