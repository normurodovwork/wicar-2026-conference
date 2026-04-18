from django.db import models
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import ConferenceFile
from .serializers import ConferenceFileSerializer


class ConferenceFilesListView(generics.ListAPIView):
    """Получение списка всех файлов конференции."""
    serializer_class = ConferenceFileSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None
    
    def get_queryset(self):
        return ConferenceFile.objects.filter(
            models.Q(file__isnull=False) | models.Q(file_type='gallery', gallery_url__isnull=False)
        ).order_by('file_type')


class ConferenceFileDetailView(generics.RetrieveUpdateAPIView):
    """Получение и обновление файла конференции."""
    queryset = ConferenceFile.objects.all()
    serializer_class = ConferenceFileSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'file_type'
