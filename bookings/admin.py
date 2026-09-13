"""Admin registrations for the bookings app."""

from django.contrib import admin
from .models import DiagnosticCenter, ScanType, Appointment


@admin.register(DiagnosticCenter)
class DiagnosticCenterAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "city", "contact_number", "created_at"]
    search_fields = ["name", "city"]


@admin.register(ScanType)
class ScanTypeAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "duration_minutes", "price", "created_at"]
    search_fields = ["name"]


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = [
        "id", "patient", "diagnostic_center", "scan_type",
        "appointment_date", "start_time", "status", "created_at",
    ]
    list_filter = ["status", "appointment_date", "diagnostic_center"]
    search_fields = [
        "patient__username",
        "patient__email",
        "diagnostic_center__name",
        "diagnostic_center__city",
        "scan_type__name",
    ]
