from django.db import models


class TelegramAdmin(models.Model):
    """Модель администратора Telegram бота."""

    ROLE_CHOICES = [
        ('all', 'Все уведомления'),
        ('payment', 'Только оплаты'),
        ('article', 'Только статьи'),
    ]

    chat_id = models.CharField(max_length=50, unique=True, verbose_name='Chat ID')
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='all',
        verbose_name='Роль'
    )
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Администратор Telegram'
        verbose_name_plural = 'Администраторы Telegram'
        db_table = 'telegram_admins'

    def __str__(self):
        role_label = self.get_role_display()
        return f'{self.full_name} ({self.chat_id}) - {role_label}'
