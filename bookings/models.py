"""
Models for the Diagnostic Appointment Booking API.

Three domain models sit on top of Django's built-in User:
  - DiagnosticCenter  — a physical scan facility
  - ScanType          — a kind of diagnostic test (MRI, CT, etc.)
  - Appointment       — one booking by one patient

Double-booking prevention strategy
------------------------------------
We use TWO layers of protection:

1. Application layer (serializer validation inside transaction.atomic):
   Before creating an appointment we query for any BOOKED appointment at the
   same center + date + time slot and raise a validation error immediately.

2. Database layer (unique_together / UniqueConstraint):
   The Appointment model has a unique constraint on
   (diagnostic_center, appointment_date, start_time) filtered to BOOKED rows
   only (a partial index when using PostgreSQL).  This catches any concurrent
   race condition that slips past the application check.

Cancelled appointments have status='CANCELLED', which is excluded from the
partial index, so a cancelled slot can be rebooked.
"""

from django.db import models
from django.contrib.auth.models import User


class DiagnosticCenter(models.Model):
    """A physical diagnostic center where patients have scans."""

    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.city})"


class ScanType(models.Model):
    """A type of diagnostic scan offered at centers (MRI, CT Scan, etc.)."""

    name = models.CharField(max_length=255)
    description = models.TextField()
    duration_minutes = models.PositiveIntegerField(help_text="Expected scan duration in minutes")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Appointment(models.Model):
    """
    A booking by a patient for a specific scan at a specific center.

    Status lifecycle: BOOKED → COMPLETED | CANCELLED
    """

    class Status(models.TextChoices):
        BOOKED = "BOOKED", "Booked"
        CANCELLED = "CANCELLED", "Cancelled"
        COMPLETED = "COMPLETED", "Completed"

    patient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    diagnostic_center = models.ForeignKey(
        DiagnosticCenter,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    scan_type = models.ForeignKey(
        ScanType,
        on_delete=models.CASCADE,
        related_name="appointments",
    )
    appointment_date = models.DateField()
    start_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BOOKED,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["appointment_date", "start_time"]
        constraints = [
            # Partial unique constraint: only one BOOKED appointment per
            # center + date + time slot.  Cancelled rows are excluded so
            # rescheduling a cancelled slot works correctly.
            # NOTE: This partial index works on PostgreSQL.  On SQLite
            # (test / dev without Docker) the condition is ignored and the
            # application-level check in the serializer carries the load.
            models.UniqueConstraint(
                fields=["diagnostic_center", "appointment_date", "start_time"],
                condition=models.Q(status="BOOKED"),
                name="unique_active_appointment_per_slot",
            )
        ]

    def __str__(self):
        return (
            f"Appointment #{self.pk} — {self.patient.username} @ "
            f"{self.diagnostic_center.name} on {self.appointment_date} {self.start_time}"
        )
