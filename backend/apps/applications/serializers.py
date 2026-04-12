from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    """Сериализатор заявки."""
    
    class Meta:
        model = Application
        fields = (
            'id', 'direction', 'participation_format', 'is_foreign',
            'affiliation', 'position', 'talk_type',
            'status', 'created_at'
        )
        read_only_fields = ('id', 'status', 'created_at')
