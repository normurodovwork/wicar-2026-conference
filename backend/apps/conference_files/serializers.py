from rest_framework import serializers
from .models import ConferenceFile


class ConferenceFileSerializer(serializers.ModelSerializer):
    """Сериализатор файла конференции."""
    
    file_type_display = serializers.CharField(source='get_file_type_display', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_name = serializers.CharField(source='filename', read_only=True)
    
    class Meta:
        model = ConferenceFile
        fields = ('id', 'file_type', 'file_type_display', 'file', 'file_url', 'file_name', 'uploaded_at', 'updated_at')
        read_only_fields = ('id', 'uploaded_at', 'updated_at')
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
