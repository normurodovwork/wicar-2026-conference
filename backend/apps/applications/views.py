from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Application
from .serializers import ApplicationSerializer


class ApplicationView(generics.GenericAPIView):
    """Получение/создание заявки пользователя (upsert)."""
    serializer_class = ApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Получить заявку текущего пользователя со статусом из Participant."""
        try:
            application = request.user.application
            serializer = self.get_serializer(application)
            data = serializer.data
            
            # Переопределяем статус из Participant если он существует
            try:
                from apps.participants.models import Participant
                participant = Participant.objects.get(user=request.user)
                data['status'] = participant.status
            except Participant.DoesNotExist:
                pass
            
            return Response(data)
        except Application.DoesNotExist:
            return Response(
                {'message': 'Заявка не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )

    def post(self, request, *args, **kwargs):
        """Создать или обновить заявку + создать/обновить участника."""
        try:
            # Проверяем, есть ли уже заявка
            application = request.user.application
            # Обновляем существующую
            serializer = self.get_serializer(application, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            application = serializer.save()

            # Обновляем участника
            self._update_participant(request.user, application)

            # Возвращаем статус из Participant
            try:
                from apps.participants.models import Participant
                participant = Participant.objects.get(user=request.user)
                response_data = serializer.data
                response_data['status'] = participant.status
                return Response(response_data)
            except Participant.DoesNotExist:
                return Response(serializer.data)
        except Application.DoesNotExist:
            # Создаём новую
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            application = serializer.save(user=request.user)

            # Создаём участника
            self._create_participant(request.user, application)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

    def _create_participant(self, user, application):
        """Создать участника из пользователя и заявки."""
        from apps.participants.models import Participant

        if not Participant.objects.filter(user=user).exists():
            Participant.objects.create(
                user=user,
                application=application,
                full_name=user.full_name,
                email=user.email,
                phone=user.phone or '',
                affiliation=application.affiliation or '',
                direction=application.direction or '',
                participation_format=application.participation_format or '',
                is_foreign=getattr(application, 'is_foreign', False),
                position=application.position or '',
                talk_type=application.talk_type or '',
                status=application.status,
            )

    def _update_participant(self, user, application):
        """Обновить участника из заявки."""
        from apps.participants.models import Participant

        try:
            participant = Participant.objects.get(user=user)
            participant.affiliation = application.affiliation or ''
            participant.direction = application.direction or ''
            participant.participation_format = application.participation_format or ''
            participant.is_foreign = getattr(application, 'is_foreign', False)
            participant.position = application.position or ''
            participant.talk_type = application.talk_type or ''
            participant.save()
        except Participant.DoesNotExist:
            self._create_participant(user, application)
