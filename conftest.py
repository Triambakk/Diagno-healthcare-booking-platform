"""
Root conftest.py — overrides the database to use SQLite for testing.

This lets the test suite run without a live PostgreSQL connection.
When running against a real Postgres DB, remove or comment out the
@pytest.fixture override below.

Note on partial unique index:
  SQLite does not honour the `condition` argument of UniqueConstraint,
  so the DB-level partial index that prevents double-booking is a no-op in
  tests.  The application-level check in AppointmentCreateSerializer.validate()
  still enforces the rule, so all tests pass correctly.
"""

import django
from django.conf import settings


def pytest_configure(config):
    """Override DATABASES before Django initialises the test runner."""
    # Only override if not already set to SQLite (idempotent)
    if "sqlite" not in settings.DATABASES.get("default", {}).get("ENGINE", ""):
        settings.DATABASES["default"] = {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
        }
