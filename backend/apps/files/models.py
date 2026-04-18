import time
from django.db import models
from django.conf import settings


def file_upload_path(instance, filename):
    """Генерация пути для загрузки файла."""
    return f'{instance.type}/{int(time.time())}_{filename}'


class File(models.Model):
    """Модель файла."""
    
    TYPE_CHOICES = [
        ('article', 'Статья'),
        ('plagiarism', 'Отчет о плагиате'),
        ('payment', 'Квитанция об оплате'),
        ('info_letter', 'Информационное письмо'),
        ('collection', 'Сборник'),
        ('program', 'Программа'),
    ]
    
    application = models.ForeignKey(
        'applications.Application',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='files',
        verbose_name='Заявка'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='Тип файла')
    file = models.FileField(upload_to=file_upload_path, verbose_name='Файл')
    original_name = models.CharField(max_length=255, verbose_name='Оригинальное имя')
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата загрузки')
    
    class Meta:
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        db_table = 'files'
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f'{self.original_name} ({self.get_type_display()})'

    def save(self, *args, **kwargs):
        """Переопределяем save для отправки уведомлений о новых файлах."""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Если файл новый и это статья или антиплагиат, отправляем уведомление
        if is_new and self.type in ['article', 'plagiarism']:
            try:
                from apps.participants.models import Participant
                from apps.telegram_bot.bot import send_file_notification_sync
                
                # Находим participant по application
                if self.application:
                    try:
                        participant = Participant.objects.get(application=self.application)
                        send_file_notification_sync(participant.id, self.type)
                    except Participant.DoesNotExist:
                        pass
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Ошибка отправки уведомления о файле #{self.id}: {e}', exc_info=True)
