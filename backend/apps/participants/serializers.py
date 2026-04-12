from rest_framework import serializers
from .models import Participant


class ParticipantSerializer(serializers.ModelSerializer):
    """Сериализатор участника."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    article_file_url = serializers.SerializerMethodField()
    plagiarism_file_url = serializers.SerializerMethodField()
    payment_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Participant
        fields = (
            'id', 'full_name', 'email', 'phone', 'affiliation',
            'direction', 'participation_format', 'is_foreign', 'position', 'talk_type',
            'has_article', 'article_file', 'article_file_url',
            'has_plagiarism', 'plagiarism_file', 'plagiarism_file_url',
            'payment_confirmed', 'payment_file', 'payment_file_url',
            'status', 'status_display',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_article_file_url(self, obj):
        if obj.article_file:
            return obj.article_file.url
        return None
    
    def get_plagiarism_file_url(self, obj):
        if obj.plagiarism_file:
            return obj.plagiarism_file.url
        return None
    
    def get_payment_file_url(self, obj):
        if obj.payment_file:
            return obj.payment_file.url
        return None


class ParticipantListSerializer(serializers.ModelSerializer):
    """Упрощённый сериализатор для списка участников."""
    
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Participant
        fields = (
            'id', 'full_name', 'email', 'phone', 'affiliation',
            'direction', 'participation_format', 'is_foreign',
            'has_article', 'article_file',
            'has_plagiarism', 'plagiarism_file',
            'payment_confirmed', 'payment_file',
            'status', 'status_display',
            'created_at'
        )
        read_only_fields = ('id', 'created_at')
