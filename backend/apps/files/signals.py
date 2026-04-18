from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import File


@receiver(post_save, sender=File)
def notify_new_file(sender, instance, created, **kwargs):
    """Отправка уведомления в Telegram при загрузке нового файла."""
    if created and instance.type in ['article', 'plagiarism']:
        # Находим participant по application
        if instance.application:
            try:
                from apps.participants.models import Participant
                from apps.telegram_bot.bot import send_file_notification_sync
                participant = Participant.objects.get(application=instance.application)
                send_file_notification_sync(participant.id, instance.type)
            except Participant.DoesNotExist:
                pass
            except Exception as e:
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f'Ошибка отправки уведомления о файле: {e}', exc_info=True)
