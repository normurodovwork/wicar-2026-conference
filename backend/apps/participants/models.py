from django.db import models


class Participant(models.Model):
    """Модель участника конференции."""
    
    STATUS_CHOICES = [
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    # Основная информация из пользователя
    full_name = models.CharField(max_length=255, verbose_name='ФИО')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=50, blank=True, null=True, verbose_name='Телефон')
    affiliation = models.CharField(max_length=255, blank=True, null=True, verbose_name='Учреждение/Организация')
    
    # Информация из заявки
    direction = models.CharField(max_length=255, blank=True, null=True, verbose_name='Направление')
    participation_format = models.CharField(max_length=20, blank=True, null=True, verbose_name='Формат участия')
    is_foreign = models.BooleanField(default=False, verbose_name='Иностранный участник')
    position = models.CharField(max_length=255, blank=True, null=True, verbose_name='Должность')
    talk_type = models.CharField(max_length=50, blank=True, null=True, verbose_name='Тип доклада')
    
    # Файлы
    has_article = models.BooleanField(default=False, verbose_name='Статья загружена')
    article_file = models.FileField(upload_to='participants/articles/', blank=True, null=True, verbose_name='Файл статьи')
    
    has_plagiarism = models.BooleanField(default=False, verbose_name='Антиплагиат загружен')
    plagiarism_file = models.FileField(upload_to='participants/plagiarism/', blank=True, null=True, verbose_name='Файл антиплагиата')
    
    # Оплата
    payment_confirmed = models.BooleanField(default=False, verbose_name='Оплата подтверждена')
    payment_file = models.FileField(upload_to='participants/payments/', blank=True, null=True, verbose_name='Файл подтверждения оплаты')
    
    # Статус
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name='Статус')
    
    # Связи
    user = models.OneToOneField(
        'users.User',
        on_delete=models.CASCADE,
        related_name='participant_profile',
        verbose_name='Пользователь',
        null=True,
        blank=True
    )
    application = models.OneToOneField(
        'applications.Application',
        on_delete=models.SET_NULL,
        related_name='participant_profile',
        verbose_name='Заявка',
        null=True,
        blank=True
    )
    
    # Даты
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Участник'
        verbose_name_plural = 'Участники'
        db_table = 'participants'
        ordering = ['-created_at']
    
    def __str__(self):
        return f'{self.full_name} ({self.email})'
