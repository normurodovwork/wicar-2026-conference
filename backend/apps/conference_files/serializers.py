from rest_framework import serializers
from .models import ConferenceFile


class ConferenceFileSerializer(serializers.ModelSerializer):
    """Сериализатор файла конференции."""
    
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.CharField(source='filename', read_only=True)
    gallery_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ConferenceFile
        fields = ('id', 'file_type', 'file_type_display', 'file', 'file_url', 'file_name', 'gallery_url', 'uploaded_at', 'updated_at')
        read_only_fields = ('id', 'file_url', 'file_name', 'file_type_display', 'uploaded_at', 'updated_at')
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

    def get_gallery_url(self, obj):
        return obj.gallery_url if obj.file_type == 'gallery' else None
