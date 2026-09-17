"""
Custom DRF permissions for the Diagnostic Booking API.

We keep permissions simple: Django's built-in is_staff flag
separates staff from regular authenticated users.
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsStaffOrReadOnly(BasePermission):
    """
    Allow any authenticated request for safe (read) methods.
    Only staff users can perform write operations (POST, PUT, PATCH, DELETE).
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True  # GET, HEAD, OPTIONS — open to anyone
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class IsOwnerOrStaff(BasePermission):
    """
    Object-level permission: allow access only to the appointment owner or staff.
    Used on appointment detail / cancel endpoints.
    """

    def has_object_permission(self, request, view, obj):
        # Staff can see / act on any appointment
        if request.user.is_staff:
            return True
        # Regular users can only see their own appointment
        return obj.patient == request.user
