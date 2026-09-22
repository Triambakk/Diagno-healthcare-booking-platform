"""
Tests for Appointment endpoints.

Covers:
- Authenticated user can book an appointment
- Unauthenticated cannot book
- Booked appointment appears in user's list
- User cannot retrieve another user's appointment (403)
- Cancellation works and changes status to CANCELLED
- Cancelled slot can be rebooked
- Conflicting (double) booking is rejected (most critical test)
- Past date is rejected
"""

import pytest
from datetime import date, time, timedelta
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from bookings.models import DiagnosticCenter, ScanType, Appointment


# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def user_alice(db):
    return User.objects.create_user(
        username="alice",
        email="alice@example.com",
        password="pass1234",
    )


@pytest.fixture
def user_bob(db):
    return User.objects.create_user(
        username="bob",
        email="bob@example.com",
        password="pass1234",
    )


@pytest.fixture
def staff_user(db):
    return User.objects.create_user(
        username="admin",
        email="admin@example.com",
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


@pytest.fixture
def future_date():
    """A date safely in the future for test appointments."""
    return (date.today() + timedelta(days=30)).isoformat()


def auth_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


# ---------------------------------------------------------------------------
# Booking tests
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestAppointmentCreate:
    def test_authenticated_user_can_book(self, user_alice, center, scan, future_date):
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future_date,
            "start_time": "10:00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 201
        assert Appointment.objects.filter(patient=user_alice).count() == 1

    def test_unauthenticated_cannot_book(self, client, center, scan, future_date):
        url = reverse("appointment-list")
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future_date,
            "start_time": "11:00",
        }
        response = client.post(url, payload, format="json")
        assert response.status_code == 401

    def test_past_date_rejected(self, user_alice, center, scan):
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": "2020-01-01",
            "start_time": "10:00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 400
        assert "appointment_date" in response.data or "detail" in response.data

    def test_today_date_rejected(self, user_alice, center, scan):
        """Same-day booking must be rejected with 400."""
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": date.today().isoformat(),
            "start_time": "14:00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 400

    def test_tomorrow_date_valid(self, user_alice, center, scan):
        """Tomorrow's booking is valid and must succeed (201)."""
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        tomorrow = (date.today() + timedelta(days=1)).isoformat()
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": tomorrow,
            "start_time": "10:00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["appointment_date"] == tomorrow

    def test_future_date_valid(self, user_alice, center, scan):
        """Future booking (e.g. 15 days ahead) is valid and must succeed (201)."""
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        future = (date.today() + timedelta(days=15)).isoformat()
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future,
            "start_time": "11:00",
        }
        response = c.post(url, payload, format="json")
        assert response.status_code == 201
        assert response.data["appointment_date"] == future


@pytest.mark.django_db
class TestAppointmentList:
    def test_user_sees_own_appointments(self, user_alice, user_bob, center, scan, future_date):
        # Create one appointment for alice and one for bob
        Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="09:00",
        )
        Appointment.objects.create(
            patient=user_bob,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="10:00",
        )
        c = auth_client(user_alice)
        response = c.get(reverse("appointment-list"))
        assert response.status_code == 200
        # Alice should only see her own
        assert len(response.data) == 1
        assert response.data[0]["patient_username"] == "alice"

    def test_staff_sees_all_appointments(self, user_alice, user_bob, staff_user, center, scan, future_date):
        Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="09:00",
        )
        Appointment.objects.create(
            patient=user_bob,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="10:00",
        )
        c = auth_client(staff_user)
        response = c.get(reverse("appointment-list"))
        assert response.status_code == 200
        assert len(response.data) == 2


@pytest.mark.django_db
class TestAppointmentOwnership:
    def test_user_cannot_access_another_users_appointment(
        self, user_alice, user_bob, center, scan, future_date
    ):
        appointment = Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="14:00",
        )
        c = auth_client(user_bob)
        url = reverse("appointment-detail", kwargs={"pk": appointment.pk})
        response = c.get(url)
        # The queryset already scopes to the requesting user's appointments,
        # so Bob simply cannot find Alice's appointment: 404 (not 403).
        # This is correct — we don't reveal other users' resource existence.
        assert response.status_code == 404

    def test_owner_can_access_own_appointment(self, user_alice, center, scan, future_date):
        appointment = Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="15:00",
        )
        c = auth_client(user_alice)
        url = reverse("appointment-detail", kwargs={"pk": appointment.pk})
        response = c.get(url)
        assert response.status_code == 200


@pytest.mark.django_db
class TestCancellation:
    def test_owner_can_cancel_appointment(self, user_alice, center, scan, future_date):
        appointment = Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="16:00",
        )
        c = auth_client(user_alice)
        url = reverse("appointment-cancel", kwargs={"pk": appointment.pk})
        response = c.patch(url)
        assert response.status_code == 200
        appointment.refresh_from_db()
        assert appointment.status == Appointment.Status.CANCELLED

    def test_other_user_cannot_cancel(self, user_alice, user_bob, center, scan, future_date):
        appointment = Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="17:00",
        )
        c = auth_client(user_bob)
        url = reverse("appointment-cancel", kwargs={"pk": appointment.pk})
        response = c.patch(url)
        # The queryset scopes to the authenticated user — Bob can't find
        # Alice's appointment, so the response is 404 rather than 403.
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# THE most critical test: double-booking prevention
# ---------------------------------------------------------------------------


@pytest.mark.django_db
class TestDoubleBookingPrevention:
    def test_second_booking_same_slot_rejected(self, user_alice, user_bob, center, scan, future_date):
        """
        1. Alice books Center A at 10:00.
        2. Bob tries to book the SAME Center A at 10:00.
        3. Bob's request must fail (400 or 409).
        """
        c_alice = auth_client(user_alice)
        c_bob = auth_client(user_bob)
        url = reverse("appointment-list")

        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future_date,
            "start_time": "10:00",
        }

        # First booking succeeds
        r1 = c_alice.post(url, payload, format="json")
        assert r1.status_code == 201

        # Second booking for the SAME slot must fail
        r2 = c_bob.post(url, payload, format="json")
        assert r2.status_code in (400, 409)

    def test_cancelled_slot_can_be_rebooked(self, user_alice, user_bob, center, scan, future_date):
        """
        1. Alice books a slot.
        2. Alice cancels it.
        3. Bob books the same slot — must succeed.
        """
        # Alice books
        appointment = Appointment.objects.create(
            patient=user_alice,
            diagnostic_center=center,
            scan_type=scan,
            appointment_date=future_date,
            start_time="11:00",
        )

        # Alice cancels
        c_alice = auth_client(user_alice)
        cancel_url = reverse("appointment-cancel", kwargs={"pk": appointment.pk})
        r_cancel = c_alice.patch(cancel_url)
        assert r_cancel.status_code == 200

        # Bob books the same slot — should succeed
        c_bob = auth_client(user_bob)
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future_date,
            "start_time": "11:00",
        }
        r_bob = c_bob.post(reverse("appointment-list"), payload, format="json")
        assert r_bob.status_code == 201

    def test_same_user_cannot_double_book(self, user_alice, center, scan, future_date):
        """A single user trying to book the same slot twice is also rejected."""
        c = auth_client(user_alice)
        url = reverse("appointment-list")
        payload = {
            "diagnostic_center": center.pk,
            "scan_type": scan.pk,
            "appointment_date": future_date,
            "start_time": "12:00",
        }
        r1 = c.post(url, payload, format="json")
        assert r1.status_code == 201

        r2 = c.post(url, payload, format="json")
        assert r2.status_code in (400, 409)
