"""
Tests for authentication endpoints.

Covers:
- Successful registration
- Duplicate registration (username + email)
- Successful login
- Invalid login credentials
- Protected endpoint rejects unauthenticated requests
"""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def registered_user(db):
    """Create a regular (non-staff) user for reuse across tests."""
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="securepass123",
    )


@pytest.mark.django_db
class TestRegistration:
    def test_successful_registration(self, client):
        url = reverse("register")
        payload = {
            "username": "bob",
            "email": "bob@example.com",
            "password": "securepass123",
        }
        response = client.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["username"] == "bob"
        assert User.objects.filter(username="bob").exists()

    def test_duplicate_username_rejected(self, client, registered_user):
        url = reverse("register")
        payload = {
            "username": "alice",  # already exists
            "email": "different@example.com",
            "password": "securepass123",
        }
        response = client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_duplicate_email_rejected(self, client, registered_user):
        url = reverse("register")
        payload = {
            "username": "charlie",
            "email": "alice@example.com",  # already exists
            "password": "securepass123",
        }
        response = client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_password_not_returned(self, client):
        url = reverse("register")
        payload = {
            "username": "dave",
            "email": "dave@example.com",
            "password": "securepass123",
        }
        response = client.post(url, payload, format="json")
        assert "password" not in response.data


@pytest.mark.django_db
class TestLogin:
    def test_successful_login_returns_tokens(self, client, registered_user):
        url = reverse("login")
        payload = {"username": "alice", "password": "securepass123"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_invalid_credentials_rejected(self, client, registered_user):
        url = reverse("login")
        payload = {"username": "alice", "password": "wrongpassword"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 400

    def test_nonexistent_user_rejected(self, client):
        url = reverse("login")
        payload = {"username": "ghost", "password": "doesnotmatter"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 400


@pytest.mark.django_db
class TestProtectedEndpoints:
    def test_unauthenticated_cannot_access_appointments(self, client):
        url = reverse("appointment-list")
        response = client.get(url)
        assert response.status_code == 401
