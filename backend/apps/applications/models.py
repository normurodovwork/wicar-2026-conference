from django.db import models
from django.conf import settings


class Application(models.Model):
    """Модель заявки на участие в конференции."""
    
    STATUS_CHOICES = [
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='application',
        verbose_name='Пользователь'
    )
    direction = models.CharField(max_length=255, verbose_name='Направление')
    participation_format = models.CharField(max_length=20, verbose_name='Формат участия')
    is_foreign = models.BooleanField(default=False, verbose_name='Иностранный участник')
    affiliation = models.CharField(max_length=255, blank=True, null=True, verbose_name='Организация')
    position = models.CharField(max_length=255, blank=True, null=True, verbose_name='Должность')
    talk_type = models.CharField(max_length=50, blank=True, null=True, verbose_name='Тип доклада')
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name='Статус'
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    
    class Meta:
        verbose_name = 'Заявка'
        verbose_name_plural = 'Заявки'
        db_table = 'applications'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.user.full_name} - {self.direction}'
