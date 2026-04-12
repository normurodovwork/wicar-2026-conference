from rest_framework import serializers
from .models import Committee, CommitteeMember


class CommitteeMemberSerializer(serializers.ModelSerializer):
    """Сериализатор члена комитета."""
    
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CommitteeMember
        fields = ('id', 'full_name', 'role', 'role_display', 'position', 'photo', 'order')
        read_only_fields = ('id',)


class CommitteeSerializer(serializers.ModelSerializer):
    """Сериализатор комитета с вложенными членами."""
    
    members = CommitteeMemberSerializer(many=True, read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    
    class Meta:
        model = Committee
        fields = ('id', 'type', 'type_display', 'name', 'description', 'order', 'members')
        read_only_fields = ('id',)
