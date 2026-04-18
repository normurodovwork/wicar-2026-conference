from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Application


@receiver(post_save, sender=Application)
def notify_new_application(sender, instance, created, **kwargs):
    """Отправка уведомления в Telegram при создании новой заявки."""
    if created:
        try:
            from apps.telegram_bot.bot import send_application_notification_sync
            send_application_notification_sync(instance.id)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Ошибка отправки уведомления о заявке: {e}', exc_info=True)
