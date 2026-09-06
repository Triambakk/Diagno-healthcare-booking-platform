"""
URL configuration for the Diagnostic Appointment Booking API.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from bookings.views import RegisterView, LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Browsable API login
    path("api-auth/", include("rest_framework.urls")),
    # Auth
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # App endpoints
    path("api/", include("bookings.urls")),
]
