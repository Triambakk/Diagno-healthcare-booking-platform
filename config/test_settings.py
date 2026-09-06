"""
Test settings — extends base settings but overrides the database to
use in-memory SQLite so tests run without a live PostgreSQL server.
"""

from config.settings import *  # noqa: F401, F403

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

# Silence password validators during tests for speed
AUTH_PASSWORD_VALIDATORS = []
