from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Participant
from .serializers import ParticipantSerializer, ParticipantListSerializer


class ParticipantsListView(generics.ListAPIView):
    """Получение списка участников (для админов) или текущего участника."""
    serializer_class = ParticipantListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Админы видят всех, обычные пользователи - только себя
        if user.is_staff:
            return Participant.objects.all().select_related('user', 'application')
        return Participant.objects.filter(user=user)


class ParticipantDetailView(generics.RetrieveUpdateAPIView):
    """Получение и обновление участника."""
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAdminUser]


class ParticipantPaymentConfirmView(generics.UpdateAPIView):
    """Подтверждение оплаты участника."""
    queryset = Participant.objects.all()
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def patch(self, request, *args, **kwargs):
        participant = self.get_object()
        participant.payment_confirmed = True
        participant.save()
        return Response({'message': 'Оплата подтверждена'})


class CurrentParticipantView(generics.RetrieveAPIView):
    """Получение данных текущего участника."""
    serializer_class = ParticipantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return Participant.objects.get(user=self.request.user)
