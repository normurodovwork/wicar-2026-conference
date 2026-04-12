"""
URL configuration for WICAR 2026 project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint."""
    return Response({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health', health_check, name='health-check'),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.applications.urls')),
    path('api/', include('apps.files.urls')),
    path('api/', include('apps.committees.urls')),
    path('api/', include('apps.participants.urls')),
    path('api/', include('apps.payment.urls')),
    path('api/', include('apps.conference_files.urls')),
]

# Раздаём медиа-файлы в development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
