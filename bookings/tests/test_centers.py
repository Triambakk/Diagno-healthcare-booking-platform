"""
Tests for DiagnosticCenter and ScanType endpoints.

Covers:
- List / retrieve centers (public)
- Staff can create a center
- Normal user cannot create a center
- Staff can create a scan type
- Normal user cannot create a scan type
"""

import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from bookings.models import DiagnosticCenter, ScanType


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def regular_user(db):
    return User.objects.create_user(
        username="patient1",
        email="patient1@example.com",
        password="pass1234",
    )


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        username="staffmember",
        email="staff@example.com",
        password="pass1234",
        is_staff=True,
    )


@pytest.fixture
def center(db):
    return DiagnosticCenter.objects.create(
        name="Apollo Diagnostic Center",
        address="Sector 65",
        city="Gurugram",
        contact_number="9876543210",
    )


@pytest.fixture
def scan(db):
    return ScanType.objects.create(
        name="MRI",
        description="Magnetic Resonance Imaging",
        duration_minutes=45,
        price="2500.00",
    )


def auth_client(user):
    """Return an APIClient authenticated as the given user."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


# ---------------------------------------------------------------------------
# DiagnosticCenter tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDiagnosticCenterList:
    def test_anyone_can_list_centers(self, client, center):
        url = reverse("center-list")
        response = client.get(url)
        assert response.status_code == 200
        assert len(response.data) >= 1

    def test_anyone_can_retrieve_center(self, client, center):
        url = reverse("center-detail", kwargs={"pk": center.pk})
        response = client.get(url)
        assert response.status_code == 200
        assert response.data["name"] == center.name


@pytest.mark.django_db
class TestDiagnosticCenterCreate:
    def test_staff_can_create_center(self, staff_user):
        c = auth_client(staff_user)
        url = reverse("center-list")
        payload = {
            "name": "Metropolis Labs",
            "address": "MG Road",
            "city": "Bangalore",
            "contact_number": "9000011111",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 201
        assert DiagnosticCenter.objects.filter(name="Metropolis Labs").exists()

    def test_regular_user_cannot_create_center(self, regular_user):
        c = auth_client(regular_user)
        url = reverse("center-list")
        payload = {
            "name": "Fake Center",
            "address": "Nowhere",
            "city": "Unknown",
            "contact_number": "0000000000",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 403

    def test_anonymous_cannot_create_center(self, client):
        url = reverse("center-list")
        payload = {
            "name": "Anon Center",
            "address": "Nowhere",
            "city": "Unknown",
            "contact_number": "0000000000",
        }
        response = client.post(url, payload, format="json")
        # IsStaffOrReadOnly returns 403 for authenticated non-staff
        # and also 403 for anonymous (not 401) because we check is_staff only
        assert response.status_code in (401, 403)


# ---------------------------------------------------------------------------
# ScanType tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestScanTypePermissions:
    def test_staff_can_create_scan(self, staff_user):
        c = auth_client(staff_user)
        url = reverse("scan-list")
        payload = {
            "name": "CT Scan",
            "description": "Computed Tomography",
            "duration_minutes": 30,
            "price": "1800.00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 201

    def test_regular_user_cannot_create_scan(self, regular_user):
        c = auth_client(regular_user)
        url = reverse("scan-list")
        payload = {
            "name": "PET-CT",
            "description": "PET-CT scan",
            "duration_minutes": 60,
            "price": "5000.00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 403
