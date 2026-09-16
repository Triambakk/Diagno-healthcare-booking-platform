"""
Views for the Diagnostic Appointment Booking API.

View map
--------
RegisterView          POST /api/auth/register/
LoginView             POST /api/auth/login/
DiagnosticCenterViewSet  /api/centers/  (CRUD, staff-only writes)
ScanTypeViewSet          /api/scans/    (CRUD, staff-only writes)
AppointmentViewSet       /api/appointments/  (book, list, retrieve, cancel)
"""

from django.db import transaction, IntegrityError
from rest_framework import generics, viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import DiagnosticCenter, ScanType, Appointment
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    DiagnosticCenterSerializer,
    ScanTypeSerializer,
    AppointmentSerializer,
    AppointmentCreateSerializer,
)
from .permissions import IsStaffOrReadOnly, IsOwnerOrStaff


# ---------------------------------------------------------------------------
# Authentication views
# ---------------------------------------------------------------------------


class RegisterView(generics.CreateAPIView):
    """
    POST /api/auth/register/
    Public — creates a new user account.
    """

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "message": "Account created successfully.",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(generics.GenericAPIView):
    """
    POST /api/auth/login/
    Public — validates credentials and returns JWT access + refresh tokens.
    """

    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff,
                },
            },
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# DiagnosticCenter endpoints
# ---------------------------------------------------------------------------


class DiagnosticCenterViewSet(viewsets.ModelViewSet):
    """
    /api/centers/  — full CRUD
    GET is open to anyone; POST/PUT/PATCH/DELETE require is_staff.
    """

    queryset = DiagnosticCenter.objects.all()
    serializer_class = DiagnosticCenterSerializer
    permission_classes = [IsStaffOrReadOnly]


# ---------------------------------------------------------------------------
# ScanType endpoints
# ---------------------------------------------------------------------------


class ScanTypeViewSet(viewsets.ModelViewSet):
    """
    /api/scans/  — full CRUD
    GET is open to anyone; write operations require is_staff.
    """

    queryset = ScanType.objects.all()
    serializer_class = ScanTypeSerializer
    permission_classes = [IsStaffOrReadOnly]


# ---------------------------------------------------------------------------
# Appointment endpoints
# ---------------------------------------------------------------------------


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    /api/appointments/

    POST   — book a new appointment (authenticated users only)
    GET    — list own appointments (staff see all)
    GET id — retrieve single appointment (owner or staff)
    PATCH cancel/ — cancel an appointment (owner or staff)

    Double-booking protection
    -------------------------
    The create action wraps the entire serializer.save() call in
    transaction.atomic().  The serializer's validate() method runs the
    application-level conflict check first.  If a concurrent request sneaks
    past that, the database partial unique constraint
    (unique_active_appointment_per_slot) raises IntegrityError, which we catch
    and convert into a 409 Conflict response.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Staff see every appointment; regular users see only their own."""
        user = self.request.user
        if user.is_staff:
            return Appointment.objects.select_related(
                "patient", "diagnostic_center", "scan_type"
            ).all()
        return Appointment.objects.select_related(
            "patient", "diagnostic_center", "scan_type"
        ).filter(patient=user)

    def get_serializer_class(self):
        if self.action == "create":
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_permissions(self):
        if self.action in ("retrieve", "cancel"):
            return [IsAuthenticated(), IsOwnerOrStaff()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(patient=self.request.user)

    def create(self, request, *args, **kwargs):
        """
        Book an appointment.

        Wraps creation in transaction.atomic() so that the conflict check
        and the INSERT happen atomically.  IntegrityError from the DB-level
        partial unique constraint is caught and returned as 409 Conflict.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                self.perform_create(serializer)
        except IntegrityError:
            return Response(
                {"detail": "The requested appointment slot is already booked."},
                status=status.HTTP_409_CONFLICT,
            )

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=["patch"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        PATCH /api/appointments/{id}/cancel/
        Sets status to CANCELLED.  Only the appointment owner or staff may cancel.
        """
        appointment = self.get_object()  # triggers IsOwnerOrStaff check

        if appointment.status == Appointment.Status.CANCELLED:
            return Response(
                {"detail": "Appointment is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if appointment.status == Appointment.Status.COMPLETED:
            return Response(
                {"detail": "Completed appointments cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        appointment.status = Appointment.Status.CANCELLED
        appointment.save()
        serializer = AppointmentSerializer(appointment, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Disable PUT/PATCH on the main endpoint — use the cancel action instead
    def update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use the /cancel/ endpoint to update an appointment."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, *args, **kwargs):
        return Response(
            {"detail": "Use the /cancel/ endpoint to update an appointment."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Appointments cannot be deleted; use cancellation instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
