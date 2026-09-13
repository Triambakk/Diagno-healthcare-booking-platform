"""
Serializers for the Diagnostic Appointment Booking API.

Each serializer handles:
- Input validation (field-level and cross-field)
- Serialisation of model instances to JSON

Appointment serializer contains the critical double-booking check.
"""

from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from .models import DiagnosticCenter, ScanType, Appointment


# ---------------------------------------------------------------------------
# Auth serializers
# ---------------------------------------------------------------------------


class RegisterSerializer(serializers.ModelSerializer):
    """Validate and create a new user account."""

    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        # Use create_user so the password is properly hashed
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )


class LoginSerializer(serializers.Serializer):
    """Authenticate an existing user and return JWT tokens."""

    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please try again.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")
        data["user"] = user
        return data


# ---------------------------------------------------------------------------
# DiagnosticCenter serializer
# ---------------------------------------------------------------------------


class DiagnosticCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiagnosticCenter
        fields = ["id", "name", "address", "city", "contact_number", "created_at"]
        read_only_fields = ["id", "created_at"]


# ---------------------------------------------------------------------------
# ScanType serializer
# ---------------------------------------------------------------------------


class ScanTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScanType
        fields = ["id", "name", "description", "duration_minutes", "price", "created_at"]
        read_only_fields = ["id", "created_at"]


# ---------------------------------------------------------------------------
# Appointment serializers
# ---------------------------------------------------------------------------


class AppointmentSerializer(serializers.ModelSerializer):
    """
    Full appointment serializer — used for list/retrieve responses.
    Embeds nested center and scan_type details for convenience.
    """

    diagnostic_center = DiagnosticCenterSerializer(read_only=True)
    scan_type = ScanTypeSerializer(read_only=True)
    patient_username = serializers.CharField(source="patient.username", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id",
            "patient_username",
            "diagnostic_center",
            "scan_type",
            "appointment_date",
            "start_time",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class AppointmentCreateSerializer(serializers.ModelSerializer):
    """
    Write-only serializer for booking a new appointment.

    Validation layers:
    1. diagnostic_center must exist (FK validation)
    2. scan_type must exist (FK validation)
    3. appointment_date must not be in the past
    4. No BOOKED appointment for the same center + date + time (business rule)
    """

    diagnostic_center = serializers.PrimaryKeyRelatedField(
        queryset=DiagnosticCenter.objects.all()
    )
    scan_type = serializers.PrimaryKeyRelatedField(queryset=ScanType.objects.all())

    class Meta:
        model = Appointment
        fields = ["id", "diagnostic_center", "scan_type", "appointment_date", "start_time", "status"]
        read_only_fields = ["id", "status"]

    def validate_appointment_date(self, value):
        today = timezone.localdate()
        if value <= today:
            raise serializers.ValidationError(
                "Appointment date must be at least 1 day in advance (tomorrow or later)."
            )
        return value

    def validate(self, data):
        """Cross-field validation: check for conflicting active bookings."""
        center = data.get("diagnostic_center")
        date = data.get("appointment_date")
        time = data.get("start_time")

        if center and date and time:
            conflict = Appointment.objects.filter(
                diagnostic_center=center,
                appointment_date=date,
                start_time=time,
                status=Appointment.Status.BOOKED,
            ).exists()
            if conflict:
                raise serializers.ValidationError(
                    {"detail": "The requested appointment slot is already booked."}
                )
        return data

    def create(self, validated_data):
        # patient is injected by the view via perform_create
        return Appointment.objects.create(**validated_data)
