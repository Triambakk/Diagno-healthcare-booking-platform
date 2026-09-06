"""
Django settings for the Diagnostic Appointment Booking API.
All secrets are loaded from environment variables (never hardcoded).
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url

# ------------------------------------------------------------------
# Paths
# ------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env file (no-op if not present; real environments set vars directly)
load_dotenv(BASE_DIR / ".env", override=False)

# ------------------------------------------------------------------
# Security
# ------------------------------------------------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "insecure-dev-key-change-in-production")
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")
raw_hosts = os.environ.get("ALLOWED_HOSTS", "*")
ALLOWED_HOSTS = [h.strip() for h in raw_hosts.split(",") if h.strip()]
if not ALLOWED_HOSTS or "*" in ALLOWED_HOSTS:
    ALLOWED_HOSTS = ["*"]
else:
    if ".vercel.app" not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(".vercel.app")

# ------------------------------------------------------------------
# Application definition
# ------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    # Local
    "bookings",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# ------------------------------------------------------------------
# Database — PostgreSQL (default, configurable via environment / DATABASE_URL)
# ------------------------------------------------------------------
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            ssl_require=True if "neon.tech" in DATABASE_URL or "supabase" in DATABASE_URL or "render.com" in DATABASE_URL or "aivencloud" in DATABASE_URL else False,
        )
    }
else:
    DATABASE_ENGINE = os.environ.get("DATABASE_ENGINE", "django.db.backends.postgresql")
    if "sqlite" in DATABASE_ENGINE:
        DATABASES = {
            "default": {
                "ENGINE": "django.db.backends.sqlite3",
                "NAME": BASE_DIR / os.environ.get("DATABASE_NAME", "db.sqlite3"),
            }
        }
    else:
        DATABASES = {
            "default": {
                "ENGINE": DATABASE_ENGINE,
                "NAME": os.environ.get("DATABASE_NAME", "diagnostic_booking"),
                "USER": os.environ.get("DATABASE_USER", "postgres"),
                "PASSWORD": os.environ.get("DATABASE_PASSWORD", ""),
                "HOST": os.environ.get("DATABASE_HOST", "localhost"),
                "PORT": os.environ.get("DATABASE_PORT", "5432"),
            }
        }

# ------------------------------------------------------------------
# Password validation
# ------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ------------------------------------------------------------------
# Internationalisation
# ------------------------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ------------------------------------------------------------------
# Static files & WhiteNoise
# ------------------------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ------------------------------------------------------------------
# CORS & CSRF Settings
# ------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
    ).split(",")
    if origin.strip()
]
CORS_ALLOW_ALL_ORIGINS = os.environ.get("CORS_ALLOW_ALL_ORIGINS", "False") == "True"
CORS_ALLOW_CREDENTIALS = True

csrf_trusted = os.environ.get("CSRF_TRUSTED_ORIGINS", "")
if csrf_trusted:
    CSRF_TRUSTED_ORIGINS = [o.strip() for o in csrf_trusted.split(",") if o.strip()]
else:
    CSRF_TRUSTED_ORIGINS = [
        "https://*.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

# ------------------------------------------------------------------
# Django REST Framework
# ------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        # Most endpoints override this; default is safe (require auth)
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# ------------------------------------------------------------------
# Simple JWT settings
# ------------------------------------------------------------------
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
