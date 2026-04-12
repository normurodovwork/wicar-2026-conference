from rest_framework import serializers
from .models import Committee, CommitteeMember


class CommitteeMemberSerializer(serializers.ModelSerializer):
    """Сериализатор члена комитета."""

    role_display = serializers.CharField(source='get_role_display', read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CommitteeMember
        fields = ('id', 'full_name', 'role', 'role_display', 'position', 'photo', 'photo_url', 'order')
        read_only_fields = ('id',)

    def get_photo_url(self, obj):
        if obj.photo:
            return obj.photo.url
        return None


class CommitteeSerializer(serializers.ModelSerializer):
    """Сериализатор комитета с вложенными членами."""
    
    members = CommitteeMemberSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Committee
        fields = ('id', 'type', 'type_display', 'name', 'description', 'order', 'members')
        read_only_fields = ('id',)
