"""URL configuration for the bookings app."""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DiagnosticCenterViewSet, ScanTypeViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r"centers", DiagnosticCenterViewSet, basename="center")
router.register(r"scans", ScanTypeViewSet, basename="scan")
router.register(r"appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("", include(router.urls)),
]
