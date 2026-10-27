"""
URL configuration for PawCare project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.pets.urls')),
    path('api/', include('apps.vaccinations.urls')),
    path('api/', include('apps.reports.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]

