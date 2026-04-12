from django.db import models


class PaymentInfo(models.Model):
    """Модель информации об оплате."""
    
    card_number = models.CharField(max_length=19, verbose_name='Номер карты')
    card_holder = models.CharField(max_length=255, verbose_name='Владелец карты')
    card_bank = models.CharField(max_length=100, default='Uzum Bank', verbose_name='Банк')
    
    # Суммы
    amount_uzs = models.PositiveIntegerField(default=200000, verbose_name='Сумма для участников из Узбекистана (сум)')
    amount_usd = models.PositiveIntegerField(default=20, verbose_name='Сумма для зарубежных участников (USD)')
    
    # Контакты
    contact_phone = models.CharField(max_length=50, default='+998 90 985 80 44', verbose_name='Телефон для связи')
    contact_email = models.EmailField(default='conference@wicar.uz', verbose_name='Email для связи')
    telegram_contact = models.CharField(max_length=100, default='+998 90 985 80 44', verbose_name='Telegram контакт')
    
    # Описание
    description_uz = models.TextField(
        default='Взнос за участие в конференции и публикацию одной статьи составляет 200 тысяч сумов. Взнос для участников из зарубежных стран составляет 20 долларов США. Организационный взнос оплачивается после одобрения участия организационным комитетом. Организационный взнос не взимается с иностранных участников, участвующих в конференции в онлайн-формате.',
        verbose_name='Описание на узбекском',
        blank=True
    )
    description_ru = models.TextField(
        default='Взнос за участие в конференции и публикацию одной статьи составляет 200 тысяч сумов. Взнос для участников из зарубежных стран составляет 20 долларов США. Организационный взнос оплачивается после одобрения участия организационным комитетом. Организационный взнос не взимается с иностранных участников, участвующих в конференции в онлайн-формате.',
        verbose_name='Описание на русском',
        blank=True
    )
    
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Дата обновления')
    
    class Meta:
        verbose_name = 'Информация об оплате'
        verbose_name_plural = 'Информация об оплате'
        db_table = 'payment_info'
    
    def __str__(self):
        return f'{self.card_bank} - {self.card_number}'
