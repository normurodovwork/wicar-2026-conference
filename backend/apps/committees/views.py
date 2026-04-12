from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Committee
from .serializers import CommitteeSerializer


class CommitteesListView(generics.ListAPIView):
    """Получение списка всех комитетов."""
    serializer_class = CommitteeSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Отключаем пагинацию
    
    def get_queryset(self):
        return Committee.objects.filter(
            is_active=True
        ).prefetch_related(
            'members'
        ).order_by('order')
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        # Фильтруем только активных членов
        committees = []
        for committee in queryset:
            committee_data = CommitteeSerializer(committee).data
            # Фильтруем только активных членов
            committee_data['members'] = [
                m for m in committee_data['members']
                if any(member.id == m['id'] and member.is_active 
                       for member in committee.members.all())
            ]
            committees.append(committee_data)
        return Response(committees)
