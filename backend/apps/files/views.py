import os
import time
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.conf import settings
from .models import File
from .serializers import FileSerializer, FileUploadSerializer


class FileUploadView(generics.GenericAPIView):
    """Загрузка файла + автоматическое обновление Participant."""
    serializer_class = FileUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        uploaded_file = serializer.validated_data['file']
        file_type = serializer.validated_data['type']

        # Генерируем путь
        ext = os.path.splitext(uploaded_file.name)[1]
        filename = f'{int(time.time())}_{uploaded_file.name}'
        file_path = f'{file_type}/{filename}'

        # Сохраняем файл
        file_instance = File.objects.create(
            application=None,  # Можно связать позже
            type=file_type,
            file=file_path,
            original_name=uploaded_file.name
        )

        # Физически сохраняем файл
        full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)

        with open(full_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # Автоматически обновляем Participant
        self._update_participant_files(request.user, file_type, file_instance)
        
        # Если это чек об оплате, отправляем уведомление админам
        if file_type == 'payment':
            self._notify_admins_about_payment(request.user)

        return Response(
            FileSerializer(file_instance).data,
            status=status.HTTP_201_CREATED
        )
    
    def _notify_admins_about_payment(self, user):
        """Отправка уведомления админам о загрузке чека."""
        try:
            from apps.participants.models import Participant
            from apps.telegram_bot.bot import send_payment_notification_sync
            
            participant = Participant.objects.get(user=user)
            # Запускаем в отдельном потоке
            send_payment_notification_sync(participant.id)
        except Participant.DoesNotExist:
            # Participant ещё не создан
            pass
        except Exception as e:
            # Не прерываем загрузку файла из-за ошибок уведомления
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Ошибка отправки уведомления: {e}')
    
    def _update_participant_files(self, user, file_type, file_instance):
        """Обновляет поля участника при загрузке файлов."""
        from apps.participants.models import Participant
        
        try:
            participant = Participant.objects.get(user=user)
            
            if file_type == 'article':
                participant.has_article = True
                participant.article_file = file_instance.file.path
                # Копируем файл в media participants/articles/
                import shutil
                new_path = f'participants/articles/{os.path.basename(file_instance.file.name)}'
                new_full_path = os.path.join(settings.MEDIA_ROOT, new_path)
                os.makedirs(os.path.dirname(new_full_path), exist_ok=True)
                shutil.copy(file_instance.file.path, new_full_path)
                participant.article_file = new_path
                
            elif file_type == 'plagiarism':
                participant.has_plagiarism = True
                import shutil
                new_path = f'participants/plagiarism/{os.path.basename(file_instance.file.name)}'
                new_full_path = os.path.join(settings.MEDIA_ROOT, new_path)
                os.makedirs(os.path.dirname(new_full_path), exist_ok=True)
                shutil.copy(file_instance.file.path, new_full_path)
                participant.plagiarism_file = new_path
                
            elif file_type == 'payment':
                import shutil
                new_path = f'participants/payments/{os.path.basename(file_instance.file.name)}'
                new_full_path = os.path.join(settings.MEDIA_ROOT, new_path)
                os.makedirs(os.path.dirname(new_full_path), exist_ok=True)
                shutil.copy(file_instance.file.path, new_full_path)
                participant.payment_file = new_path
            
            participant.save()
            
        except Participant.DoesNotExist:
            # Participant ещё не создан - это нормально, он создастся при подаче заявки
            pass


class FileDeleteView(generics.DestroyAPIView):
    """Удаление файла."""
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        # Проверяем владение (файл принадлежит пользователю через заявку)
        if instance.application and instance.application.user != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('У вас нет прав для удаления этого файла')

        # Удаляем физический файл
        if instance.file:
            file_path = os.path.join(settings.MEDIA_ROOT, str(instance.file))
            if os.path.exists(file_path):
                os.remove(file_path)

        instance.delete()


class GlobalFilesView(generics.ListAPIView):
    """Получение глобальных файлов по типу."""
    serializer_class = FileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        file_type = self.request.query_params.get('type')
        queryset = File.objects.filter(application__isnull=True)

        if file_type:
            queryset = queryset.filter(type=file_type)

        return queryset
